const Router = require('koa-router')
const router = new Router()
const multiparty = require('multiparty')
const path = require('path')
const fs = require('fs')
const { resolve } = require('path')

const UPLOAD_DIR = path.resolve(__dirname, '..', "target")

router.post('/file', ctx => {
  let { filename, hash } = ctx.request.body
  const file = ctx.request.files.chunk
  const size = '----' + file.size
  // 拼接hash以及文件大小
  const newHash = hash + size
  const reader = fs.createReadStream(file.path)
  let filePath = path.resolve(UPLOAD_DIR, newHash)
  const writerStream = fs.createWriteStream(filePath)
  reader.pipe(writerStream)
  ctx.status = 200
  return ctx.body = '上传成功'
})

const pipeStream = (path, writerStream) => {
  new Promise(resolve => {
    const readStream = fs.createReadStream(path)
    readStream.on('end', () => {
      fs.unlinkSync(path)
      resolve()
    })
    readStream.pipe(writerStream)
  })
}

router.post('/merge', async ctx => {
  const filename = ctx.request.body.filename
  const chunkDir = path.resolve(UPLOAD_DIR)
  const chunksPath = fs.readdirSync(chunkDir)

  chunksPath.sort((a, b) => a.split("----")[1] - b.split("-----")[1])

  const filepath = path.resolve(UPLOAD_DIR, filename)

  await Promise.all(
    chunksPath.map((chunkPath, index) => {
      const size = Number(chunkPath.split('----')[2])
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        fs.createWriteStream(filepath, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    })
  )
  ctx.status = 200
  ctx.body = '上传成功'
})
module.exports = router