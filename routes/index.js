const router = require('koa-router')()
const path = require('path')

const fsPromise = require('../lib/fsPromise.js')

router.get('/*', async (ctx, next) => {

    if (!ctx.request.url.startsWith('/api')){
        let homePagePath = path.resolve('../','public/home_page.html');
        let html = ''
        try{
            html = await fsPromise.readFile(homePagePath)
        }catch (e) {
            console.log(e)
            html = 'HTTP-Internal Server Error'
        }
        ctx.type = 'html'
        ctx.body = html
        return
    } else {}
})



module.exports = router
