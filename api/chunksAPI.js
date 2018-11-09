const contentDisposition = require('content-disposition')
const path = require('path')
const fs = require('mz/fs')
const tools = require('../lib/tools')
const { storagePath,chunkStoragePath } = require('../storage.js')
const { getUploadedChunks,writeFileMeta,parseFileMeta,uploadChunkFileStream } = require('../core/chunks')
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
        let chunkFileInfoAbsPath = path.resolve(chunkFileStoragePath,body.fileMd5Value + '.chunkinfo')

        try {
            if (await tools.pathIsExist(chunkFileStoragePath)){
                uploadedChunks = await getUploadedChunks(body.fileMd5Value)
                chunkFileInfo = await parseFileMeta(chunkFileInfoAbsPath)
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

        // console.log(fileMeta)

        let chunkInfoName = chunkFileMeta.fileMd5Value + '.chunkinfo'
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

        if(!chunk) return ctx.body = "no chunk"


        let chunkInfoPath = path.resolve(tools.getAbsPath(filePath),fileMd5Value+".chunkinfo")
        let fileMeta = await parseFileMeta(chunkInfoPath)

        try{
            ctx.body = await uploadChunkFileStream(ctx.req,chunk,fileMeta)
        }catch (e) {
            /* istanbul ignore next */
            ctx.throw(500,e.message)
        }
    },


    downloadChunkFile: async (ctx,next) => {

    },

    deleteChunkFile: async (ctx,next) => {

        let filePath = ctx.params['0']
        let fileMd5Value = ctx.request.query['fileMd5']

        console.log(ctx.params)
        console.log(ctx.request.query)

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(!fileMd5Value) return ctx.throw(404)

        let chunkFileMetaAbsPath = path.resolve(tools.getAbsPath(filePath),fileMd5Value + '.chunkinfo')
        let chunkFileStoragePath = path.resolve(chunkStoragePath,fileMd5Value)
        let chunkFileInfoAbsPath = path.resolve(chunkFileStoragePath,fileMd5Value + '.chunkinfo')

        try{
            if (await tools.pathIsExist(chunkFileMetaAbsPath)){
                await fs.unlink(chunkFileMetaAbsPath)
            }
            if (await tools.pathIsExist(chunkFileInfoAbsPath)){
                let chunkFileInfo = await parseFileMeta(chunkFileInfoAbsPath)
                chunkFileInfo.reference -= 1
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