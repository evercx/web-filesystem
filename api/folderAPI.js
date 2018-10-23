const fs = require('mz/fs')
const contentDisposition = require('content-disposition')
const tools = require('../lib/tools')
const {storageFolder} = require('../storage.js')
const { mkFolder,delFolder,showDirInfo,archiveFolder } = require('../core/directory')


module.exports = {

    // 创建文件夹, 由前端给定 相当路径 和 文件夹名称
    makeOneFolder : async (ctx,next) => {

        let targetDirPath = ctx.request.body.targetDirPath || '.'
        let folderName = ctx.request.body.folderName || "新建文件夹"
        let targetAbsDirPath = tools.getAbsPath(targetDirPath)

        try{
            ctx.body = await mkFolder(targetAbsDirPath,folderName)
        }catch (e) {
            ctx.status = 404
        }
        return
    },

    deleteFolder : async (ctx,next) => {

        let folderPath = ctx.params['0']

        folderPath = tools.formatPath(folderPath)
        folderPath = tools.safeDecodeURIComponent(folderPath)

        if(folderPath === './') {
            ctx.status = 404
            return
        }

        let folderAbsPath = tools.getAbsPath(folderPath)
        try{
            let result = await delFolder(folderAbsPath)
            ctx.body = result
        }catch (e) {
            ctx.status = 404
        }

        return
    },

    // 获取文件夹下的文件以及文件夹信息, 由前端给定所要查询的相对路径地址
    getFolderInfo : async (ctx,next) => {

        let curDirPath = ctx.request.query.curDirPath || '.'
        curDirPath = tools.safeDecodeURIComponent(curDirPath)

        let absDirPath = tools.getAbsPath(curDirPath)

        try{
            let InfoResult = await showDirInfo(absDirPath)
            ctx.body = InfoResult.dirInfo
        }catch (e) {
            ctx.throw(404)
        }
        return
    },

    archFolder : async (ctx,next) => {

        let folderPath = ctx.params['0']
        folderPath = tools.formatPath(folderPath)
        folderPath = tools.safeDecodeURIComponent(folderPath)

        let absFolderPath = ''
        let folderName = ''
        let absZipFolderPath = ''
        let zipFolderName = ''

        if (folderPath !== './'){

            let folderPathSplit = folderPath.split('/')
            let folderNameIndex = folderPathSplit.length - 2
            folderName = folderPathSplit[folderNameIndex]
            zipFolderName = folderName + '.zip'
            let relSavedPath = './'
            for(let i =0; i < folderNameIndex;i++){
                relSavedPath = relSavedPath + folderPathSplit[i] + '/'
            }
            absZipFolderPath = tools.getAbsPath(relSavedPath + zipFolderName)
            absFolderPath = tools.getAbsPath(folderPath)
        }else {
            absFolderPath = tools.getAbsPath(folderPath)
            folderName = storageFolder
            zipFolderName = folderName + '.zip'
            absZipFolderPath = tools.getAbsPath(folderPath + zipFolderName)
        }

        try{
            await archiveFolder(absFolderPath,absZipFolderPath)
            let header = {}
            header['Content-Disposition'] = contentDisposition(zipFolderName)
            ctx.set(header)
            ctx.body = fs.createReadStream(absZipFolderPath)
        }catch (e) {
            // console.log("archFolder",e)
            ctx.status = 404
        }
        return
    },
}