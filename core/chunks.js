const path = require('path')
const fs = require('mz/fs')
const multiparty = require('multiparty')
const archiver = require('archiver')
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
                    let chunkIndex = parseInt(item.substring(0,item.indexOf('.chunk')))
                    uploadedChunks.push(chunkIndex)
                }
            }
            return uploadedChunks
        }else {
            return uploadedChunks
        }
    },

    writeFileMeta: async(chunkInfoDirAbsPath,fileMeta) => {
        try {
            await fs.writeFile(chunkInfoDirAbsPath,JSON.stringify(fileMeta))
            // let destPath = path.resolve(chunkStoragePath,fileMeta.fileMd5Value,fileMeta.fileMd5Value + '.chunkinfo')
            // await fs.copyFile(chunkInfoDirAbsPath,destPath)
            return {
                message:SUCCESS.CREATE_CHUNK,
                result:{
                    fileMeta
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
            return {}
        }
    },


    uploadChunkFileStream: async(req,chunk,fileMeta) => {

        // let form = new multiparty.Form({
        //     autoFields: true,
        //     autoFiles: false,
        // })
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

                    let uploadedPath = path.resolve(chunkStoragePath,fileMeta.fileMd5Value,chunk + '.chunk')
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

                let chunkInfoDirAbsPath = tools.getAbsPath(fileMeta.path)
                chunkInfoDirAbsPath = path.resolve(chunkInfoDirAbsPath,fileMeta.fileMd5Value + ".chunkinfo")

                fileMeta.uploadedChunks.push(chunk)
                fileMeta.lastUpdated = new Date()

                try{
                    await require('./chunks').writeFileMeta(chunkInfoDirAbsPath,fileMeta)
                    resolve({
                        message:SUCCESS.UPLOAD_FILE
                    });
                }catch (e) {
                    console.log("出错",e)
                    reject(e.message)
                }
            });
        })


    }








}