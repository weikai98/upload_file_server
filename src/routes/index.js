const Router = require('koa-router')
const router = new Router()

router.get('/hahaha', ctx => {
  ctx.body = 'index'
})

module.exports = router