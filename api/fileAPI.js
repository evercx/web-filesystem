const multiparty = require('multiparty')
const tools = require('../lib/tools')
const { delOneFile } = require('../core/file')
const StringDecoder = require('string_decoder').StringDecoder

module.exports = {

    deleteFile : async (ctx,next) => {

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

        let fileAbsPath = tools.getAbsPath(filePath)
        ctx.body = await delOneFile(fileAbsPath)

        return
    },


    uploadFileStream: async (ctx,next) => {

        let form = new multiparty.Form()

        form.on('error', function(err) {
            console.log('Error parsing form: ' + err.stack);
        });

        form.on('part',function(part){

            if(part.name){
                console.log("part.name",part.name)
            }
            if(part.filename){
                console.log("part.filename",part.filename)
            }

        })

        form.on('file',function(name,file){
            console.log("name",name)
            console.log("file",file)
        })





        form.parse(ctx.req)
        ctx.body = {msg:"上传测试中"}






    }


}