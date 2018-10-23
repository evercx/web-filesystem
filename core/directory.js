const path = require('path')
const fs = require('mz/fs')
const archiver = require('archiver')
const { pathIsExist } = require('../lib/tools')
const { storagePath } = require('../storage.js')


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
            }
            return {msg:"success",dirInfo:dirInfo}
        }else {
            throw new Error('目录不存在')
        }
    },

    mkFolder: async (targetAbsDirPath,folderName) => {

        let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(isExist) {
            throw new Error('目录已存在')
        }
        try{
            await fs.mkdir(folderAbsPath)
            return {msg:"文件夹创建成功",folderName:folderName,path:folderAbsPath}
        }catch (e) {
            console.log("mkOneFolder",e)
            throw new Error('文件夹创建失败')
        }
    },

    delFolder: async (folderAbsPath) => {

        let isExist = await pathIsExist(folderAbsPath)

        if(!folderAbsPath.startsWith(storagePath)){
            throw new Error('目录不合法')
        }
        if(!isExist) {
            throw new Error('该目录不存在')
        }
        try{
            await recEmptyFolder(folderAbsPath)
            await fs.rmdir(folderAbsPath)
            return {msg:"文件夹删除成功",path:folderAbsPath}
        }catch (e) {
            console.log("delOneFolder",e)
            throw new Error('文件夹删除失败')
        }
    },

    archiveFolder:async (absFolderPath,folderName,absZipFolderPath) => {


        let archive = archiver('zip',{ zlib:{level:9} })
        try{
            archive = await recArchiveFolder('/',absFolderPath,archive)     //递归遍历给定的文件夹下的所有子文件和子文件夹及其文件
        }catch (e) {
            throw new Error('压缩文件夹出错')
        }

        let outputStream = fs.createWriteStream(absZipFolderPath)
        archive.pipe(outputStream)
        archive.finalize();

        return new Promise(function(resolve,reject){

            outputStream.on('close',function(){
                console.log(archive.pointer() + ' total bytes')
                return resolve("success")
            })

            outputStream.on('end',function(){
                // console.log('Data has been drained');
            })

            archive.on('warning',function(err){
                if (err.code === 'ENOENT') {
                    console.log(err)
                    return reject(err)
                } else {
                    return reject(err)
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

// 递归压缩给定文件夹中的子文件和文件夹
let recArchiveFolder = async(prefixPath,absDirPath,archive) => {

    let dirInfoList = []
    try{
        dirInfoList = await fs.readdir(absDirPath)
        if (dirInfoList.length === 0){
            archive.append(Buffer.from('this is an empty file'),{name:'.empty',prefix:prefixPath})
            return archive
        }
    }catch (e) {
        throw e
    }
    try{
        for( item of dirInfoList){

            let itemPath = path.resolve(absDirPath,item)
            let stat = await fs.stat(itemPath)

            if(stat.isDirectory()){
                let prefix = prefixPath + item + "/"
                archive = await recArchiveFolder(prefix,itemPath,archive)
            }else {
                archive.append(fs.createReadStream(itemPath),{name:item,prefix:prefixPath})
            }
        }
    }catch (e) {
        throw e
    }
    return archive
}





