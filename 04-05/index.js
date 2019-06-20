const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')
const minio = require('minio')

const app = express()
const port = process.env.PORT || 3000
const upload = multer({ storage: multer.memoryStorage() })
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const minioHost = process.env.MINIO_HOST || "localhost"
const minioBucket = 'image-storage'

async function initMongo() {
  console.log("Initialising MongoDB...")
  let success = false
  while (!success) {
    try {
      client = await MongoClient.connect(mongoURL, { useNewUrlParser: true });
      success = true
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  const db = client.db('dev').collection('notes')
  console.log("MongoDB initialised")
  return db
}

async function initMinIO() {
  console.log("Initialising MinIO...")
  const client = new minio.Client({
    endPoint: minioHost,
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  })
  let success = false
  while (!success) {
    try {
      if (!await client.bucketExists(minioBucket)) {
        await client.makeBucket(minioBucket)
      }
      success = true
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  console.log("MinIO initialised")
  return client
}

async function start() {
  const db = await initMongo() 
  const minio = await initMinIO()

  app.set('view engine', 'pug')
  app.set('views', path.join(__dirname, '/views'))
  app.use(express.static(path.join(__dirname, 'public')))

  app.get('/', async (req, res) => {
    res.render('index', { notes: await getNotesAsMd(db) })
  })

  app.post('/note', upload.single('image'), async (req, res) => {
    if (req.body.upload) {
      await minio.putObject(minioBucket, req.file.originalname, req.file.buffer)
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
    const stream = await minio.getObject(minioBucket, decodeURIComponent(req.params.name))
    stream.pipe(res)
  })

  app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`)
  })
}

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

start()
