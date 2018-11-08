const path = require('path')
const fs = require('mz/fs')
const archiver = require('archiver')
const { pathIsExist } = require('../lib/tools')
const { storagePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')
const config = require('../config/config')

module.exports = {

    /**
     * 函数功能简述
     *
     * 获取给定路径的文件和文件夹信息
     *
     * @param    {string}  absDirPath    绝对路径字符串
     * @returns  {object}
     *
     */

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
                    // else itemInfo.type = 'other'
                    itemInfo.name = item
                    dirInfo.push(itemInfo)
                }
            }catch (e) {
                // console.log("GET_DIRINFO_ERROR",e)
                // throw e
                /* istanbul ignore next */
                throw new Error(FAILED.GET_DIRINFO)
            }
            return {
                message:SUCCESS.GET_DIRINFO,
                result:{
                    dirInfo:dirInfo
                }
            }
        }else {
            throw new Error(FAILED.DIR_NOTEXIST)
        }
    },

    /**
     * 函数功能简述
     *
     * 根据给定路径创建一个文件夹
     *
     * @param    {string}  targetAbsDirPath    要创建的文件夹所在的绝对路径
     * @param    {string}  folderName          要创建的文件夹名称
     * @returns  {object}
     *
     */

    mkFolder: async (targetAbsDirPath,folderName) => {

        let folderAbsPath = path.resolve(targetAbsDirPath,folderName)
        let isExist = await pathIsExist(folderAbsPath)

        if(isExist) {
            throw new Error(FAILED.DIR_EXISTED)
        }
        try{
            await fs.mkdir(folderAbsPath)
            return {
                message:SUCCESS.MAKE_FOLDER,
                result:{
                    folderName:folderName,
                    path:folderAbsPath
                }

            }
        }catch (e) {
            // console.log("mkOneFolder",e)
            /* istanbul ignore next */
            throw new Error(FAILED.MAKE_FOLDER)
        }
    },

    /**
     * 函数功能简述
     *
     * 删除指定文件夹
     *
     * @param    {string}  folderAbsPath   要删除的文件夹的绝对路径
     * @returns  {object}
     *
     */

    delFolder: async (folderAbsPath) => {

        let isExist = await pathIsExist(folderAbsPath)

        if(!folderAbsPath.startsWith(storagePath)){
            throw new Error(FAILED.DIR_INVALID)
        }
        if(!isExist) {
            throw new Error(FAILED.DIR_NOTEXIST)
        }
        try{
            await recEmptyFolder(folderAbsPath)
            await fs.rmdir(folderAbsPath)
            return {
                message:SUCCESS.DELETE_FOLDER,
                result:{
                    path:folderAbsPath
                }
            }
        }catch (e) {
            // console.log("delOneFolder",e)
            /* istanbul ignore next */
            throw new Error(FAILED.DELETE_FOLDER)
        }
    },

    /**
     * 函数功能简述
     *
     * 根据给定文件夹路径压缩一个文件夹
     *
     * @param    {string}  absFolderPath     要压缩的文件夹所在的绝对路径
     * @param    {string}  absZipFolderPath  压缩的文件夹存放的绝对路径
     * @returns  {object}
     *
     */

    archiveFolder:async (absFolderPath,absZipFolderPath) => {

        let archive = archiver('zip',{ zlib:{level:9} })
        if (await pathIsExist(absFolderPath)){
            try{
                archive = await recArchiveFolder('/',absFolderPath,archive)     //递归遍历给定的文件夹下的所有子文件和子文件夹及其文件
            }catch (e) {
                /* istanbul ignore next */
                throw new Error(FAILED.ARCHIVE_FOLDER)
            }
        }else {
            throw new Error(FAILED.DIR_NOTEXIST)
        }

        // let outputStream = fs.createWriteStream(absZipFolderPath)
        // archive.pipe(outputStream)
        archive.finalize();

        return archive
/*        return new Promise(function(resolve,reject){

            outputStream.on('close',function(){
                // console.log(archive.pointer() + ' total bytes')
                return resolve({
                    message:SUCCESS.ARCHIVE_FOLDER,
                    result:{
                        zipPath:absZipFolderPath
                    }
                })
            })


            /!* istanbul ignore next *!/
            outputStream.on('end',function(){
                // console.log('Data has been drained');
            })


            /!* istanbul ignore next *!/
            archive.on('warning',function(err){
                if (err.code === 'ENOENT') {
                    // console.log(err)
                    return reject(err)
                } else {
                    return reject(err)
                }
            })


            /!* istanbul ignore next *!/
            archive.on('error', function(err) {
                // throw err;
                return reject(err)
            });
        })*/
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
        // console.log("recEmptyFolder",e)
        /* istanbul ignore next */
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

            archive.append('this is an empty file',{name:'.empty',prefix:prefixPath})
            // archive.append('',{name:'',prefix:prefixPath})
            // archive.directory(absDirPath,'empty',{name:'empty',prefix:prefixPath})
            return archive
        }
    }catch (e) {
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        throw e
    }
    return archive
}





