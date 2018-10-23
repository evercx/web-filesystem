const fs = require('mz/fs')
const multiparty = require('multiparty')
const tools = require('../lib/tools')
const { pathIsExist } = require('../lib/tools')
const { storagePath } = require('../storage.js')


module.exports = {

    getFileStream: async (absFilePath) => {

        let isExist = await pathIsExist(absFilePath)

        if(isExist){
            return fs.createReadStream(absFilePath)
        }else{
            throw new Error("文件不存在")
        }
    },

    delOneFile: async (fileAbsPath) => {

        let isExist = await pathIsExist(fileAbsPath)

        if(!fileAbsPath.startsWith(storagePath)){
            throw new Error('文件地址不合法')
        }
        if(!isExist) {
            throw new Error('文件不存在')
        }

        try{
            await fs.unlink(fileAbsPath)
            return {msg:"文件删除成功",path:fileAbsPath}
        }catch (e) {
            console.log("delOneFile",e)
            throw new Error('文件删除失败')
        }
    },

    uploadFileStream: async(req,filePath) => {

        let form = new multiparty.Form()
        form.parse(req)

        return new Promise(function(resolve, reject){

            form.on('error', function(err) {
                console.log('Error parsing form: ' + err.stack);
                reject(err.stack)
            });

            form.on('part', function(part) {

                if (part.filename) {

                    let targetAbsPath = tools.getAbsPath(filePath + part.filename)
                    part.pipe(fs.createWriteStream(targetAbsPath))
                    part.resume();
                }

                part.on('error', function(err) {
                    reject(err.stack)
                });
            });

            form.on('close', function() {
                resolve('Upload completed!');
            });
        })
    }
}
