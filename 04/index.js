const path = require('path')
const express = require('express')
const app = express()
const mongo = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')
const MinIO = require('minio')

const port = process.env.PORT || 3000
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const minioAccessKey = process.env.MINIO_ACCESS_KEY || "examplekey"
const minioSecretKey = process.env.MINIO_SECRET_KEY || "examplesecret"
const minioHost = process.env.MINIO_HOST || "localhost"

const upload = multer({ dest: path.join(__dirname, 'public/uploads/') })

const minioClient = new MinIO.Client({
  endPoint: minioHost,
  port: 9000,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
})
const minioBucket = 'image-storage'

minioClient
  .bucketExists(minioBucket)
  .then(async bucketExists => {
    if (bucketExists) {
      return
    }
    await minioClient.makeBucket(minioBucket)
    await minioClient.setBucketPolicy(
      minioBucket,
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: ['s3:GetObject'],
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Resource: [`arn:aws:s3:::${minioBucket}/*`],
            Sid: '',
          },
        ],
      }),
    )
  })
  .catch(error => console.log(error))


const db = mongo
  .connect(mongoURL, { useNewUrlParser: true })
  .then(it => it.db('dev').collection('notes'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: await getNotesAsMd(db) })
})

app.post('/note', multer({ storage: multer.memoryStorage() }).single('image'), async (req, res) => {
  if (req.body.upload) {
    await minioClient.putObject(minioBucket, req.file.originalname, req.file.buffer)
    const publicUrl = `${minioClient.protocol}//${minioClient.host}:${minioClient.port}/${minioBucket}/${encodeURIComponent(req.file.originalname)}`
    return res.render('index', {
      content: `${req.body.description} ![](${publicUrl})`,
      notes: await getNotesAsMd(db),
    })
  }
  const description = req.body.description
  if (!!description) {
    await insertNote(db, { description })
  }
  res.redirect('/')
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
