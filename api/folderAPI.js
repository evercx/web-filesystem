const fs = require('fs')
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

        ctx.body = await mkFolder(targetAbsDirPath,folderName)
        return
    },

    deleteFolder : async (ctx,next) => {

        let folderPath = ctx.params['0']

        folderPath = tools.formatPath(folderPath)
        folderPath = tools.safeDecodeURIComponent(folderPath)
        if(folderPath === '/') {
            ctx.status = 404
            return
        }

        let folderAbsPath = tools.getAbsPath(folderPath)
        ctx.body = await delFolder(folderAbsPath)

        return
    },

    // 获取文件夹下的文件以及文件夹信息, 由前端给定所要查询的相对路径地址
    getFolderInfo : async (ctx,next) => {

        let curDirPath = ctx.request.query.curDirPath || '.'
        curDirPath = tools.safeDecodeURIComponent(curDirPath)

        let absDirPath = tools.getAbsPath(curDirPath)
        let InfoResult = await showDirInfo(absDirPath)

        ctx.body = InfoResult.dirInfo
        return
    },

    archFolder : async (ctx,next) => {

        let folderPath = ctx.params['0']
        folderPath = tools.formatPath(folderPath)
        folderPath = tools.safeDecodeURIComponent(folderPath)

        folderPath = folderPath.substring(0,folderPath.length-1)    //去掉最后一个 /

        let index = folderPath.lastIndexOf('/')
        let relFolderPath = folderPath.substring(0,index+1)
        relFolderPath === '' ? relFolderPath = './' : relFolderPath
        let folderName = folderPath.substring(index+1,folderPath.length)

        let zipName = folderName + '.zip'
        let relZipFolderPath = ''
        let absFolderPath = ''

        // 如果当前目录是根目录
        if( relFolderPath === './' && folderName === '.'){
            folderName = storageFolder
            absFolderPath = tools.getAbsPath(relFolderPath)
            relZipFolderPath = relFolderPath + storageFolder + '.zip'

        }else {
            absFolderPath = tools.getAbsPath(relFolderPath + folderName)
            relZipFolderPath = relFolderPath + zipName
        }
        let absZipFolderPath = tools.getAbsPath(relZipFolderPath)

        await archiveFolder(absFolderPath,folderName,absZipFolderPath)
        let header = {}
        header['Content-Disposition'] = contentDisposition(zipName)
        ctx.set(header)
        ctx.body = fs.createReadStream(absZipFolderPath)

        return
    },
}