const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongo = require('mongodb').MongoClient

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'
const minioAccessKey = process.env.MINIO_ACCESS_KEY || ''
const minioSecretKey = process.env.MINIO_SECRET_KEY || ''

const app = express()
const db = mongo.connect(mongoUrl, { useNewUrlParser: true }).then(it => it.db('dev').collection('notes'))
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
})
const minioBucket = 'image-storage'

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: await getNotesAsMd(null) })
})

app.post('/note', multer({ storage: multer.memoryStorage() }).single('image'), async (req, res) => {
  if (req.body.upload) {
    await minioClient.putObject(minioBucket, req.file.originalname, req.file.buffer)
    const publicUrl = `${minioClient.protocol}//${minioClient.host}:${
      minioClient.port
    }/${minioBucket}/${encodeURIComponent(req.file.originalname)}`
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

app.listen(port, () => {
  console.log(`App listening on port ${port}!\n\nOpen a browser window and visit http://localhost:${port}/first`)
})

async function getNotesAsMd(db) {
  const client = await db
  const notes = await client.find().toArray()
  return notes
}

async function insertNote(db, note) {
  const client = await db
  await client.insertOne(note)
}