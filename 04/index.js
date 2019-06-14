const path = require('path')
const express = require('express')
const mongo = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')
const MinIO = require('minio')

const port = process.env.PORT || 3000
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const minioHost = process.env.MINIO_HOST || "localhost"

const app = express()

const db = mongo
  .connect(mongoURL, { useNewUrlParser: true })
  .then(it => it.db('dev').collection('notes'))

const minioClient = new MinIO.Client({
  endPoint: minioHost,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

const minioBucket = 'image-storage'
minioClient
  .bucketExists(minioBucket)
  .then(async bucketExists => {
    if (!bucketExists) await minioClient.makeBucket(minioBucket)
  })
  .catch(error => console.log(error))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: await getNotesAsMd(db) })
})

app.post('/note', multer({ storage: multer.memoryStorage() }).single('image'), async (req, res) => {
  if (req.body.upload) {
    await minioClient.putObject(minioBucket, req.file.originalname, req.file.buffer)
    const link = `/img/${encodeURIComponent(req.file.originalname)}`
    return res.render('index', {
      content: `${req.body.description} ![](${link})`,
      notes: await getNotesAsMd(db),
    })
  }
  const description = req.body.description
  if (!!description) {
    await insertNote(db, { description })
  }
  res.redirect('/')
})

app.get('/img/:name', async (req, res) => {
  const stream = await minioClient.getObject(minioBucket, decodeURIComponent(req.params.name))
  stream.pipe(res)
})

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})

async function insertNote(db, note) {
  const client = await db
  await client.insertOne(note)
}

async function getNotesAsMd(db) {
  const client = await db
  const notes = await client.find().toArray()
  return notes.map(it => {
    return { ...it, description: marked(it.description) }
  })
}
