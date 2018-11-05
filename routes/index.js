const router = require('koa-router')()
const path = require('path')
const fs = require('mz/fs')

router.get('/*', async (ctx, next) => {

    if (!ctx.request.url.startsWith('/api')){
        let homePagePath = path.resolve(__dirname,'../','public/home_page.html');
        let html = ''
        try{
            html = await fs.readFile(homePagePath)
        }catch (e) {
            ctx.throw(500,e)
            // console.log(e)
            // html = 'HTTP-Internal Server Error'
        }
        ctx.type = 'html'
        ctx.body = html
        return
    } else {}
})

module.exports = router
