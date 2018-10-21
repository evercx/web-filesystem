const tools = require('../lib/tools')
const { mkFolder,delFolder,showDirInfo } = require('../core/directory')


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

        let url = ctx.request.url
        let folderIndex = url.indexOf('folder/')
        let folderPath = url.substring(folderIndex + 7)

        if(folderPath.indexOf("?") !== -1){
            folderPath = folderPath.split("?")[0]
        }

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
    }
}