const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const router = new Router()

const index = require('./routes/index')
const file = require('./routes/file')

const koaBody = require('koa-body')

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
  }
}));
app.use(index.routes())
app.use(file.routes())

router.get('/404', (ctx, next) => {
  ctx.body = 'Page Not Found!!!'
  ctx.status = 404
})

app.use(router.routes())

app.listen(3000)