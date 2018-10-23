const contentDisposition = require('content-disposition')
const tools = require('../lib/tools')
const { delOneFile,getFileStream,uploadFileStream } = require('../core/file')

module.exports = {

    deleteFile : async (ctx,next) => {

        let filePath = ctx.params['0']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(filePath === '/') {
            ctx.status = 404
            return
        }
        try{
            let fileAbsPath = tools.getAbsPath(filePath)
            ctx.body = await delOneFile(fileAbsPath)
            return
        }catch (e) {
            // console.log("deleteFile",e)
            ctx.status = 404
        }
    },

    uploadFileStream: async (ctx,next) => {

        let uploadPath = tools.safeDecodeURIComponent(tools.formatPath(ctx.params['0']))

        try{
            await uploadFileStream(ctx.req,uploadPath)
            ctx.body = {msg:"上传成功"}
        }catch (e) {
            ctx.status = 500
        }
    },

    downloadFile : async (ctx,next) => {

        let filePath = ctx.params['0']

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(filePath === '/') {
            ctx.status = 404
            return
        }

        if (filePath.lastIndexOf('.') === -1) return 404

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
            // console.log(e)
            ctx.status = 404
            return
        }
    }
}