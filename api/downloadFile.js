const contentDisposition = require('content-disposition')
const tools = require('../lib/tools')
const { getFileStream } = require('../core/file')

module.exports = {

    downloadFile : async (ctx,next) => {

        console.log(ctx.request.param)

        let url = ctx.request.url
        let fileIndex = url.indexOf('file/')
        let filePath = url.substring(fileIndex + 5)

        if(filePath.indexOf("?") !== -1){
            filePath = filePath.split("?")[0]
        }

        filePath = tools.formatPath(filePath)
        filePath = tools.safeDecodeURIComponent(filePath)

        if(filePath === '/') {
            ctx.status = 404
            return
        }

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
            console.log(e)
            ctx.status = 404
            return
        }
    }
}