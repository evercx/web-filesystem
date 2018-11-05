const router = require('koa-router')()
const path = require('path')
const fs = require('mz/fs')

router.get('/*', async (ctx, next) => {

    /* istanbul ignore else */
    if (!ctx.request.url.startsWith('/api')){
        let homePagePath = path.resolve(__dirname,'../','public/home_page.html');
        let html = ''
        try{
            html = await fs.readFile(homePagePath)
        }catch (e) {
            /* istanbul ignore next */
            ctx.throw(500,e)
        }
        ctx.type = 'html'
        ctx.body = html
        return
    } else {}
})

module.exports = router
