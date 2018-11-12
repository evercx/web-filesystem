const contentDisposition = require('content-disposition')
const path = require('path')
const fs = require('mz/fs')
const tools = require('../lib/tools')
const { storagePath,chunkStoragePath } = require('../storage.js')
const { getUploadedChunks,writeFileMeta,parseFileMeta,uploadChunkFileStream,getChunkFileStream } = require('../core/chunks')
const { delFolder } = require('../core/directory')
const { SUCCESS,FAILED } = require('../lib/message')
const {CHUNK_SIZE} = require('../config/config')

module.exports = {

    createChunkInfo: async (ctx,next) =>{

        let filePath = ctx.params['0']
        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        let body = ctx.request.body

        if( !body.fileName || !body.fileSize || !body.fileMd5Value){
            ctx.throw(400)
        }

        let fileSize = Math.floor(body.fileSize)
        let chunks = Math.ceil(fileSize / CHUNK_SIZE)
        let uploadedChunks = []
        let chunkFileStoragePath = path.resolve(chunkStoragePath,body.fileMd5Value)
        let chunkFileInfo = {}
        let chunkFileInfoAbsPath = path.resolve(chunkFileStoragePath,body.fileMd5Value + '.cinfo')

        try {
            if (await tools.pathIsExist(chunkFileStoragePath)){
                uploadedChunks = await getUploadedChunks(body.fileMd5Value)
                chunkFileInfo = await parseFileMeta(chunkFileInfoAbsPath)

                // if (chunkFileInfo.uploadedChunks.length === uploadedChunks.length){
                //     return ctx.body = {
                //         message:'该文件已存在',
                //         result:{
                //             fileMeta:{
                //                 fileMd5Value:chunkFileInfo.fileMd5Value,
                //                 uploadedChunks:chunkFileInfo.uploadedChunks,
                //                 chunks:chunkFileInfo.chunks
                //             }
                //         }
                //     }
                // }

            }else {
                await fs.mkdir(chunkFileStoragePath)
                chunkFileInfo = {
                    fileName:body.fileName,
                    fileSize:fileSize,
                    fileMd5Value:body.fileMd5Value,
                    chunkSize:CHUNK_SIZE,
                    path:[],
                    chunks:chunks,
                    created: new Date(),
                    lastUpdated: new Date(),
                    reference:0,
                    uploadedChunks: uploadedChunks,
                }
            }
        }catch (e) {
            console.log(e)
            ctx.throw(500)
        }
        let chunkFileMeta = {
            fileName:body.fileName,
            fileSize:fileSize,
            fileMd5Value:body.fileMd5Value,
            chunkSize:CHUNK_SIZE,
            path:[filePath],
            chunks:chunks,
            created: new Date(),
            lastUpdated: new Date(),
            uploadedChunks: uploadedChunks,
        }

        if (chunkFileInfo.path.indexOf(filePath) === -1){
            chunkFileInfo.path.push(filePath)
            chunkFileInfo.reference++
        }

        let chunkInfoName = chunkFileMeta.fileMd5Value + '.cinfo'
        let chunkDirPath = tools.getAbsPath(filePath)
        let chunkFileMetaAbsPath = path.resolve(chunkDirPath,chunkInfoName)

        try{
            await writeFileMeta(chunkFileInfoAbsPath,chunkFileInfo)
            ctx.body = await writeFileMeta(chunkFileMetaAbsPath,chunkFileMeta)
        }catch (e) {
            ctx.throw(500,e.message)
        }
    },


    uploadChunk: async (ctx,next) => {

        let filePath = ctx.params['0']
        let fileMd5Value = ctx.request.query['fileMd5']
        let chunk = ctx.request.query['chunk']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(!fileMd5Value) return ctx.throw(404)

        let chunkInfoPath = path.resolve(tools.getAbsPath(filePath),fileMd5Value+".cinfo")
        let chunkFileMeta = {}
        try{
            chunkFileMeta = await parseFileMeta(chunkInfoPath)
        }catch (e) {
            if(e.message === FAILED.CHUNK_NOTEXIST){
                ctx.throw(404,e.message)
            }
        }

        if(!chunk) {

            let uploadedChunks = await getUploadedChunks(fileMd5Value)
            if(uploadedChunks.length === chunkFileMeta.uploadedChunks.length){

                return ctx.body = {
                    message:SUCCESS.UPLOAD_CHUNK_FILE,
                    result:{
                        fileMeta:chunkFileMeta
                    }
                }
            }else {
                ctx.throw(400,FAILED.UPLOAD_CHUNK_FILE)
            }
        }

        try{
            ctx.body = await uploadChunkFileStream(ctx.req,chunk,chunkFileMeta)
        }catch (e) {
            /* istanbul ignore next */
            ctx.throw(500,e.message)
        }
    },


    downloadChunkFile: async (ctx,next) => {

        let filePath = ctx.params['0']
        let fileMd5Value = ctx.request.query['fileMd5']
        let rangeString = ctx.headers['range']

        if(!fileMd5Value) return ctx.throw(404)

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        // let chunkFileStoragePath = path.resolve(chunkStoragePath,fileMd5Value)
        let chunkFileMetaAbsPath = path.resolve(tools.getAbsPath(filePath),fileMd5Value+'.cinfo')
        let chunkFileMeta = {}
        let uploadedChunks = []

        try{
            chunkFileMeta = await parseFileMeta(chunkFileMetaAbsPath)
            uploadedChunks = await getUploadedChunks(fileMd5Value)
        }catch (e) {
            if(e.message === FAILED.CHUNK_NOTEXIST){
                ctx.throw(404,e.message)
            }
        }

        if(chunkFileMeta.chunks !== uploadedChunks.length){
            ctx.throw(400,'文件尚未上传完整')
        }

        try{
            let {status,headers,res} = await getChunkFileStream(chunkFileMeta,rangeString)

            headers['Content-Disposition'] = contentDisposition(chunkFileMeta.fileName)
            ctx.set(headers)
            ctx.status = status
            ctx.body = res
            return
        }catch (e) {
            console.log('catch error',e)
            console.log("出错")
            ctx.throw(500,e.message)
        }
    },

    deleteChunkFile: async (ctx,next) => {

        let filePath = ctx.params['0']
        let fileMd5Value = ctx.request.query['fileMd5']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(!fileMd5Value) return ctx.throw(404)

        let chunkFileMetaAbsPath = path.resolve(tools.getAbsPath(filePath),fileMd5Value + '.cinfo')
        let chunkFileStoragePath = path.resolve(chunkStoragePath,fileMd5Value)
        let chunkFileInfoAbsPath = path.resolve(chunkFileStoragePath,fileMd5Value + '.cinfo')

        try{
            let chunkFileMeta = await parseFileMeta(chunkFileMetaAbsPath)
            if (await tools.pathIsExist(chunkFileMetaAbsPath)){
                await fs.unlink(chunkFileMetaAbsPath)
            }
            if (await tools.pathIsExist(chunkFileInfoAbsPath)){
                let chunkFileInfo = await parseFileMeta(chunkFileInfoAbsPath)

                chunkFileInfo.reference -= 1
                chunkFileInfo.path.splice(chunkFileInfo.path.indexOf(chunkFileMeta.path[0]),1)

                if (chunkFileInfo.reference === 0){
                    await delFolder(chunkFileStoragePath)
                }else {
                    await writeFileMeta(chunkFileInfoAbsPath,chunkFileInfo)
                }
            }
        }catch (e) {
            ctx.throw(500,e.message)
        }

        ctx.body = {
            message : SUCCESS.DELETE_FILE
        }
    }
}

