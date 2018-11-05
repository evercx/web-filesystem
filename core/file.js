const fs = require('mz/fs')
const multiparty = require('multiparty')
const tools = require('../lib/tools')
const { pathIsExist } = require('../lib/tools')
const { storagePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')

module.exports = {

    /**
     * 函数功能简述
     *
     * 根据给定文件路径获取文件流
     *
     * @param    {string}  absFilePath    文件的绝对路径
     * @returns  {object}
     *
     */

    getFileStream: async (absFilePath) => {

        let isExist = await pathIsExist(absFilePath)

        if(isExist){
            return fs.createReadStream(absFilePath)
        }else{
            throw new Error(FAILED.FILE_NOTEXIST)
        }
    },

    /**
     * 函数功能简述
     *
     * 根据给定文件路径删除文件
     *
     * @param    {string}  fileAbsPath    文件的绝对路径
     * @returns  {object}
     *
     */

    delOneFile: async (fileAbsPath) => {

        let isExist = await pathIsExist(fileAbsPath)

        if(!fileAbsPath.startsWith(storagePath)){
            throw new Error(FAILED.FILE_INVALID)
        }
        if(!isExist) {
            throw new Error(FAILED.FILE_NOTEXIST)
        }

        try{
            await fs.unlink(fileAbsPath)
            return {
                message:SUCCESS.DELETE_FILE,
                result:{path:fileAbsPath}
            }
        }catch (e) {
            // console.log("delOneFile",e)
            throw new Error(FAILED.DELETE_FILE)
        }
    },


    /**
     * 函数功能简述
     *
     * 根据文件流写入本地磁盘
     *
     * @param    {object}  req            HTTP请求流
     * @param    {string}  filePath       文件的绝对路径
     * @returns  {object}
     *
     */

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
                resolve({
                    message:SUCCESS.UPLOAD_FILE
                });
            });
        })
    }
}
