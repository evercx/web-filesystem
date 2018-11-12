const path = require('path')
const fs = require('mz/fs')
const multiparty = require('multiparty')
const destroy = require('destroy')
const archiver = require('archiver')
const Transform = require('stream').Transform
const tools = require('../lib/tools')
const { pathIsExist,getAbsPath } = require('../lib/tools')
const { storagePath,chunkStoragePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')
const config = require('../config/config')


module.exports = {

    getUploadedChunks: async(fileMd5Value)=>{

        let chunkFilePath = path.resolve(chunkStoragePath,fileMd5Value)
        let uploadedChunks = []

        if (await pathIsExist(chunkFilePath)){

            let chunkList = await fs.readdir(chunkFilePath)

            for(item of chunkList){
                if( item.indexOf('.chunk') !== -1){
                    let chunkIndex = item.substring(0,item.indexOf('.chunk'))
                    uploadedChunks.push(chunkIndex)
                }
            }
            return uploadedChunks
        }else {
            throw new Error(FAILED.CHUNK_NOTEXIST)
        }
    },

    writeFileMeta: async(chunkInfoDirAbsPath,chunkFileMeta) => {
        try {
            await fs.writeFile(chunkInfoDirAbsPath,JSON.stringify(chunkFileMeta))
            // let destPath = path.resolve(chunkStoragePath,fileMeta.fileMd5Value,fileMeta.fileMd5Value + '.cinfo')
            // await fs.copyFile(chunkInfoDirAbsPath,destPath)
            return {
                message:SUCCESS.CREATE_CHUNK,
                result:{
                    fileMeta:chunkFileMeta
                }
            }
        }catch (e) {
            // console.log(e)
            throw new Error(FAILED.CREATE_CHUNK)
        }
    },

    parseFileMeta:async(chunkInfoAbsPath) => {

        // console.log(chunkInfoAbsPath)
        if( pathIsExist(chunkInfoAbsPath)){
            try {
                return JSON.parse(await fs.readFile(chunkInfoAbsPath))
            }catch (e) {
                throw new Error(FAILED.PARSE_FILEMETA)
            }
        }else {
            throw new Error(FAILED.CHUNK_NOTEXIST)
        }
    },


    uploadChunkFileStream: async(req,chunk,chunkFileMeta) => {

        let form = new multiparty.Form({autoFields:false,})
        form.parse(req)

        return new Promise(function(resolve, reject){

            /* istanbul ignore next */
            form.on('error', function(err) {
                console.log('Error parsing form: ' + err.stack);
                reject(err.stack)
            });

            form.on('part', function(part) {

                if(!part.filename){
                    part.resume()
                }
                if (part.filename) {

                    let uploadedPath = path.resolve(chunkStoragePath,chunkFileMeta.fileMd5Value,chunk + '.chunk')
                    part.pipe(fs.createWriteStream(uploadedPath))
                    // part.resume();
                }

                /* istanbul ignore next */
                part.on('error', function(err) {
                    console.log(err)
                    reject(err.stack)
                });
            });

            /* istanbul ignore next */
            form.on('close', async function() {

                console.log("close")

                let chunkInfoDirAbsPath = tools.getAbsPath(chunkFileMeta.path)
                chunkInfoDirAbsPath = path.resolve(chunkInfoDirAbsPath,chunkFileMeta.fileMd5Value + ".cinfo")
                let chunkFileInfoAbsPath = path.resolve(chunkStoragePath,chunkFileMeta.fileMd5Value,chunkFileMeta.fileMd5Value + '.cinfo')
                let chunkFileInfo = await require('./chunks').parseFileMeta(chunkFileInfoAbsPath)

                if(chunkFileMeta.uploadedChunks.indexOf(chunk.toString()) === -1) chunkFileMeta.uploadedChunks.push(chunk.toString())
                chunkFileMeta.lastUpdated = new Date()
                chunkFileInfo.uploadedChunks = chunkFileMeta.uploadedChunks

                try{
                    await require('./chunks').writeFileMeta(chunkInfoDirAbsPath,chunkFileMeta)
                    await require('./chunks').writeFileMeta(chunkFileInfoAbsPath,chunkFileInfo)
                    resolve({
                        message:SUCCESS.UPLOAD_CHUNK
                    });
                }catch (e) {
                    console.log("出错",e)
                    reject(e.message)
                }
            });
        })
    },

    getChunkFileStream: async(fileMeta,rangeString)=>{

        let headers = {}
        let chunkFileStoragePath = path.resolve(chunkStoragePath,fileMeta.fileMd5Value)

        headers['Accept-Ranges'] = 'bytes'
        headers['Content-Length'] = fileMeta.fileSize
        headers['Content-Type'] = 'application/pdf'

        let status = 200
        let range = parseRange(rangeString, fileMeta.fileSize)

        if(rangeString){
            status = 206
            headers['Content-Range'] = `${range.unit} ${range.start}-${range.end}/${fileMeta.fileSize}`
            headers['Content-Length'] = range.end - range.start + 1
        }

        // 根据 range 计算 数据处于哪些chunk中
        let chunkStart = Math.floor(range.start / fileMeta.chunkSize)
        let chunkEnd = Math.floor(range.end / fileMeta.chunkSize)
        let chunkTransferBytes = 0
        let chunkTotalBytes = range.end - range.start + 1

        let chunksList = []
        for( let i = chunkStart; i<= chunkEnd;i++){
            let chunkPath = path.resolve(chunkFileStoragePath,i.toString()+'.chunk')
            chunksList.push(chunkPath)
        }

        let transform = new Transform()
        transform._transform = (data, encoding, callback) =>{

            // 计算这片data在所有数据中的位置 = 之前所有chunk的字节数 + 已经计算过的chunk的字节数
            let dataOffset = chunkStart * fileMeta.chunkSize + chunkTransferBytes
            // 计算截取这片data的结束位置
            let end = Math.min(data.length,range.end - dataOffset + 1)

            // 所有字节都传完了
            if (chunkTotalBytes <= 0){
                transform.push(null)
                return
            }

            if(range.start > dataOffset) {

                // 当前data块 在range的范围的前面，不pipe数据，直接callback
                if( range.start > (data.length + dataOffset)|| end < 0){
                    chunkTransferBytes += data.length
                    callback()
                }

                // range的start索引正好在当前data块里
                else if(range.start <= (data.length + dataOffset)){

                    let start = (range.start - dataOffset)
                    let transferData = data.slice(start,end)
                    let transferDataLength = end - start

                    chunkTransferBytes += data.length
                    chunkTotalBytes -= transferDataLength
                    callback(null,transferData)
                }
            }

            // range的start索引在当前data块以前...
            if( range.start <= dataOffset){
                // end<0 表示range的字节范围在当前data块之前结束，代表数据传输完毕 结束
                if(end < 0){
                    chunkTransferBytes += data.length
                    transform.push(null)
                }
                // range的start索引在当前data块以前,截取的data开始索引取为0,并以end为结束索引
                let transferData = data.slice(0,end)
                let transferDataLength = end
                chunkTransferBytes += data.length
                chunkTotalBytes -= transferDataLength
                callback(null,transferData)
            }
        }

        let pipeStream = async(chunkList,transform)=>{

            for(chunkPath of chunkList){

                transform.srcStream = fs.createReadStream(chunkPath)
                transform.srcStream.pipe(transform,{end:false})
                try{
                    await endReadStream(transform.srcStream)
                }catch (e) {
                    throw new Error(e)
                }
                transform.srcStream = null
                chunkTransferBytes = 0
            }

            transform.push(null)
            return transform
        }

        transform.destroy = () => {
            if( transform.srcStream && typeof transform.srcStream.destroy === 'function' ){
                destroy(transform.srcStream)
            }
            // stream.destroy()
        }

        pipeStream(chunksList,transform)

        return {status,headers,res:transform}
    }
}


let endReadStream = function(readStream){

    return new Promise((resolve,reject) => {

        readStream.on('end',()=>{
            resolve('end')
        })

        readStream.on('error',(err)=>{
            console.log('error',err)
            reject(err)
        })
    })
}



let parseRange = function(range, size) {
    let result = {
        unit: 'bytes',
        start: 0,
        end: size - 1
    }
    let temp = (range || '').split('=')
    result.unit = temp[0] || 'bytes'
    temp = (temp[1] || '').split('-')
    result.start = Number(temp[0] || 0)
    result.end = Number(temp[1] || size - 1)
    return result
}