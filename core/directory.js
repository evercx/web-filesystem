const path = require('path')
const fs = require('mz/fs')
const archiver = require('archiver')
const { pathIsExist } = require('../lib/tools')
const {storagePath} = require('../storage.js')


module.exports = {

    showDirInfo: async (absDirPath) => {

        let dirReadResult = []
        let dirInfo = []
        let isExist = await pathIsExist(absDirPath)

        if(isExist){

            try{
                dirReadResult = await fs.readdir(absDirPath)

                for (item of dirReadResult) {

                    let itemInfo = {}
                    let itemPath = path.resolve(absDirPath,item)
                    let itemStat = await fs.stat(itemPath)

                    if (itemStat.isFile()) itemInfo.type = 'file'
                    else if(itemStat.isDirectory()) itemInfo.type = 'dir'
                    else itemInfo.type = 'other'
                    itemInfo.name = item
                    dirInfo.push(itemInfo)
                }

            }catch (e) {
                throw e
                // return {msg:e,dirInfo:[]}
            }
            return {msg:"success",dirInfo:dirInfo}
        }else {
            throw new Error('目录不存在')
            //return {msg:"dir not exists",dirInfo:[]}
        }
    },

    mkFolder: async (targetAbsDirPath,folderName) => {

        let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(isExist) {
            throw new Error('目录已存在')
            //return {msg:"该目录已存在",folderName:folderName,path:folderAbsPath}
        }

        try{
            await fs.mkdir(folderAbsPath)
            return {msg:"文件夹创建成功",folderName:folderName,path:folderAbsPath}
        }catch (e) {
            console.log("mkOneFolder",e)
            throw new Error('文件夹创建失败')
            // return {msg:"文件夹创建失败",folderName:folderName,path:folderAbsPath}
        }
    },

    delFolder: async (folderAbsPath) => {

        // let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(!folderAbsPath.startsWith(storagePath)){
            // return {msg:"目录不合法",path:folderAbsPath}
            throw new Error('目录不合法')
        }
        if(!isExist) {
            // return {msg:"该目录不存在",path:folderAbsPath}
            throw new Error('该目录不存在')
        }

        try{
            await recEmptyFolder(folderAbsPath)
            await fs.rmdir(folderAbsPath)
            return {msg:"文件夹删除成功",path:folderAbsPath}
        }catch (e) {
            console.log("delOneFolder",e)
            // return {msg:"文件夹删除失败",path:folderAbsPath}
            throw new Error('文件夹删除失败')
        }
    },

    archiveFolder:async (absFolderPath,folderName,absZipFolderPath) => {

        let outputStream = fs.createWriteStream(absZipFolderPath)

        let archive = archiver('zip',{ zlib:{level:9} })
        archive.directory(absFolderPath,folderName)

        archive.pipe(outputStream)
        archive.finalize();

        return new Promise(function(resolve,reject){

            outputStream.on('close',function(){
                console.log(archive.pointer() + ' total bytes')
                return resolve("success")
            })

            outputStream.on('end',function(){
                console.log('Data has been drained');
            })

            archive.on('warning',function(err){
                if (err.code === 'ENOENT') {
                    console.log(err)
                    return reject(err)
                    // log warning
                } else {
                    return reject(err)
                    // throw error
                    // throw err;
                }
            })

            archive.on('error', function(err) {
                // throw err;
                return reject(err)
            });
        })
    }
}


// 递归清空给定文件夹中的子文件和文件夹
let recEmptyFolder = async(absDirPath) => {

    let dirInfo = await fs.readdir(absDirPath)
    if (dirInfo.length === 0) return true;

    try{
        for (item of dirInfo){

            let itemPath = path.resolve(absDirPath,item)
            let stat = await fs.stat(itemPath)
            if (stat.isDirectory()){
                await recEmptyFolder(itemPath)
                await fs.rmdir(itemPath)
            }else {
                await fs.unlink(itemPath)
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

// module.exports.archiveFolder('/Users/evercx/Teambition-Internship/web-filesystem/storage/')




