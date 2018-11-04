const contentDisposition = require('content-disposition')
const tools = require('../lib/tools')
const { delOneFile,getFileStream,uploadFileStream } = require('../core/file')
const { SUCCESS,FAILED } = require('../lib/message')

module.exports = {

    deleteFile : async (ctx,next) => {

        let filePath = ctx.params['0']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(filePath === '/') {
            ctx.throw(404,new Error('不能删除根目录'))
            return
        }
        try{
            let fileAbsPath = tools.getAbsPath(filePath)
            ctx.body = await delOneFile(fileAbsPath)
            return
        }catch (e) {
            if(e.message === FAILED.FILE_INVALID || e.message === FAILED.FILE_NOTEXIST){
                ctx.throw(404,e.message)
            }else {
                ctx.throw(500,e.message)
            }
        }
    },

    uploadFileStream: async (ctx,next) => {

        let uploadPath = tools.safeDecodeURIComponent(tools.formatPath(ctx.params['0']))

        try{
            ctx.body = await uploadFileStream(ctx.req,uploadPath)
        }catch (e) {
            ctx.throw(500,e.message)
        }
    },

    downloadFile : async (ctx,next) => {

        let filePath = ctx.params['0']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(filePath === '/') {
            ctx.throw(404)
            return
        }

        if (filePath.lastIndexOf('.') === -1) return ctx.throw(404,new Error('文件地址不合法'))

        try{

            let fileAbsPath = tools.getAbsPath(filePath)
            let readStream = await getFileStream(fileAbsPath)
            let header = {}
            let fileName = fileAbsPath.substring(fileAbsPath.lastIndexOf('/') + 1)

            header['Content-Disposition'] = contentDisposition(fileName)
            ctx.set(header)
            ctx.body = readStream
            return
        }catch (e) {
            ctx.throw(404,e.message)
            return
        }
    }
}