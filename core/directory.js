const path = require('path')
const fsPromise = require('../lib/fsPromise')
const tools = require('../lib/tools')
const { pathIsExist } = require('../lib/tools')
const {storagePath} = require('../lib/config')

// const USER_HOME = process.env.HOME || process.env.USERPROFILE
// const storagePath = path.resolve(USER_HOME,'storage')


module.exports = {

    showDirInfo: async (absDirPath) => {

        let dirReadResult = []
        let dirInfo = []
        let isExist = await pathIsExist(absDirPath)

        if(isExist){

            try{
                dirReadResult = await fsPromise.readdir(absDirPath)

                for (item of dirReadResult) {

                    if (item === '.DS_Store') continue;

                    let itemInfo = {}
                    let itemPath = path.resolve(absDirPath,item)
                    let itemStat = await fsPromise.stat(itemPath)

                    if (itemStat.isFile()) itemInfo.type = 'file'
                    else if(itemStat.isDirectory()) itemInfo.type = 'dir'
                    else itemInfo.type = 'other'
                    itemInfo.name = item
                    dirInfo.push(itemInfo)
                }

            }catch (e) {
                return {msg:e,dirInfo:[]}
            }
            return {msg:"success",dirInfo:dirInfo}
        }else {
            return {msg:"dir not exists",dirInfo:[]}
        }
    },

    mkFolder: async (targetAbsDirPath,folderName) => {

        let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(isExist) {
            return {msg:"该目录已存在",folderName:folderName,path:folderAbsPath}
        }

        try{
            await fsPromise.mkdir(folderAbsPath)
            return {msg:"文件夹创建成功",folderName:folderName,path:folderAbsPath}
        }catch (e) {
            console.log("mkOneFolder",e)
            return {msg:"文件夹创建失败",folderName:folderName,path:folderAbsPath}
        }
    },

    delFolder: async (folderAbsPath) => {

        // let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(!folderAbsPath.startsWith(storagePath)){
            return {msg:"目录不合法",path:folderAbsPath}
        }
        if(!isExist) {
            return {msg:"该目录不存在",path:folderAbsPath}
        }

        try{
            await recEmptyFolder(folderAbsPath)
            await fsPromise.rmdir(folderAbsPath)
            return {msg:"文件夹删除成功",path:folderAbsPath}
        }catch (e) {
            console.log("delOneFolder",e)
            return {msg:"文件夹删除失败",path:folderAbsPath}
        }
    }
}


let recEmptyFolder = async(absDirPath) => {

    let dirInfo = await fsPromise.readdir(absDirPath)
    if (dirInfo.length === 0) return true;

    try{
        for (item of dirInfo){

            let itemPath = path.resolve(absDirPath,item)
            let stat = await fsPromise.stat(itemPath)
            if (stat.isDirectory()){
                await recEmptyFolder(itemPath)
                await fsPromise.rmdir(itemPath)
            }else {
                await fsPromise.unlink(itemPath)
            }
        }
    }catch (e) {
        console.log("recEmptyFolder",e)
        return false
    }
    return true
}



// Test

// module.exports.mkFolder('/Users/evercx/storage','nttt').then( r => console.log(r))

// module.exports.delFolder('/Users/evercx/storage','t').then( r => console.log(r))

// recEmptyFolder('/Users/evercx/storage/t').then( c => console.log(c))




