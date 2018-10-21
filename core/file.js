const path = require('path')
const fs = require('fs')
const fsPromise = require('../lib/fsPromise')
const tools = require('../lib/tools')
const { pathIsExist } = require('../lib/tools')
const { storagePath } = require('../lib/config')

// const USER_HOME = process.env.HOME || process.env.USERPROFILE
// const storagePath = path.resolve(USER_HOME,'storage')


module.exports = {

    getFileStream: async (absFilePath) => {

        let isExist = pathIsExist(absFilePath)

        if(isExist){

            let readStream = fs.createReadStream(absFilePath)
            return readStream
        }else{
            throw new Error("File does not exists.")
        }
    },

    delOneFile: async (fileAbsPath) => {

        // let fileAbsPath = path.resolve(targetAbsDirPath,fileName)
        let isExist = pathIsExist(fileAbsPath)

        if(!fileAbsPath.startsWith(storagePath)){
            return {msg:"文件地址不合法",path:fileAbsPath}
        }
        if(!isExist) {
            return {msg:"文件不存在",path:fileAbsPath}
        }

        try{
            await fsPromise.unlink(fileAbsPath)
            return {msg:"文件删除成功",path:fileAbsPath}
        }catch (e) {
            console.log("delOneFile",e)
            return {msg:"文件删除失败",path:fileAbsPath}
        }
    }

}


// module.exports.delOneFile('/Users/evercx/storage/t/','f.txt').then( r => console.log(r))