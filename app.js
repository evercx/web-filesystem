const Koa = require('koa')
const app = new Koa()
const path = require('path')

const onerror = require('koa-onerror')
const logger = require('koa-logger')
const koaBody = require('koa-body');

const index = require('./routes/index')
const api = require('./routes/apis')

// error handler
onerror(app)

// middlewares
app.use(koaBody({}))

// app.use(koaBody({
//     multipart:true,
//     formidable: {
//         maxFileSize: 5000*1024*1024	// 设置上传文件大小最大限制，默认50M
//     }
// }));

app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))


// routes
app.use(api.routes(), api.allowedMethods())
app.use(index.routes(), index.allowedMethods())


app.on('error',(err,ctx) => {

    if(err.code === 'EPIPE'){
        ctx.res.destroy()
        console.log('app error',err)
        return
    }


})


module.exports = app
