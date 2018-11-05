const fs = require('mz/fs')
const contentDisposition = require('content-disposition')
const tools = require('../lib/tools')
const {storageFolder} = require('../storage.js')
const { mkFolder,delFolder,showDirInfo,archiveFolder } = require('../core/directory')
const { SUCCESS,FAILED } = require('../lib/message')

module.exports = {

    // 创建文件夹, 由前端给定 相当路径 和 文件夹名称
    makeOneFolder : async (ctx,next) => {

        let targetDirPath = ctx.request.body.targetDirPath || '.'
        let folderName = ctx.request.body.folderName || "新建文件夹"
        let targetAbsDirPath = tools.getAbsPath(targetDirPath)

        try{
            ctx.body = await mkFolder(targetAbsDirPath,folderName)
        }catch (e) {

            /* istanbul ignore else */
            if(e.message === FAILED.DIR_EXISTED){
                ctx.throw(404,e.message)
            }else {

                ctx.throw(500,e.message)
            }
        }
        return
    },

    deleteFolder : async (ctx,next) => {

        let folderPath = ctx.params['0']

        folderPath = tools.formatPath(folderPath)
        folderPath = tools.safeDecodeURIComponent(folderPath)

        if(folderPath === './') {
            ctx.throw(404,new Error('不能删除根目录'))
        }

        let folderAbsPath = tools.getAbsPath(folderPath)
        try{
            ctx.body = await delFolder(folderAbsPath)
        }catch (e) {
            /* istanbul ignore else */
            if(e.message === FAILED.DIR_INVALID || e.message === FAILED.DIR_NOTEXIST){
                ctx.throw(404,e.message)
            }else {
                ctx.throw(500,e.message)
            }
        }

        return
    },

    // 获取文件夹下的文件以及文件夹信息, 由前端给定所要查询的相对路径地址
    getFolderInfo : async (ctx,next) => {

        let curDirPath = ctx.request.query.curDirPath || '.'
        curDirPath = tools.safeDecodeURIComponent(curDirPath)
        let absDirPath = tools.getAbsPath(curDirPath)

        try{
            ctx.body = await showDirInfo(absDirPath)
        }catch (e) {
            /* istanbul ignore else */
            if(e.message === FAILED.DIR_NOTEXIST){
                ctx.throw(404,e.message)
            }else{
                ctx.throw(500,e.message)
            }
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
                /* istanbul ignore next */
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
            let archiveStream = await archiveFolder(absFolderPath,absZipFolderPath)
            let header = {}
            header['Content-Disposition'] = contentDisposition(zipFolderName)
            ctx.set(header)
            ctx.body = archiveStream
            // ctx.body = fs.createReadStream(absZipFolderPath)
        }catch (e) {
            /* istanbul ignore else */
            if(e.message === FAILED.DIR_NOTEXIST){
                ctx.throw(404,e.message)
            }else{
                ctx.throw(500,e.message)
            }
        }
        return
    },
}