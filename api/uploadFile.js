const path = require('path')
const fs = require('fs')
const fsPromise = require('../lib/fsPromise.js')
const tools = require('../lib/tools')
const USER_HOME = process.env.HOME || process.env.USERPROFILE
const storagePath = path.resolve(USER_HOME,'storage')

module.exports = {

    uploadFile : async (ctx,next) => {

        let files = ctx.request.files
        let currentPath = ctx.request.body.currentPath || '.'       //当前上传文件所在path

        console.log(files)

        let filePath = tools.formatPath(currentPath)
        filePath = tools.safeDecodeURIComponent(filePath)

        // 存放文件的绝对路径
        let targetFilePath = path.resolve(storagePath,filePath,files['uploadFile'].name)

        try {
            try{
                await fsPromise.access(targetFilePath,fs.constants.F_OK)
                ctx.body = {msg:"该文件已存在"}
                return
            }catch (e) {
                // console.log(e) //不存在
            }

            let filePath = files['uploadFile'].path

            let readStream = fs.createReadStream(filePath)
            let writeStream = fs.createWriteStream(targetFilePath)
            let resultStream = readStream.pipe(writeStream)

            // 上传文件结束后根据原文件地址删除临时文件
            resultStream.on('finish',async ()=>{

                fs.unlink(filePath,()=>{})
            })

        }catch (e) {
            console.log(e)
            throw e
        }

        ctx.body = {msg:"上传成功"}

    }

}
