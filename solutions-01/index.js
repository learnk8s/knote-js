const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongo = require('mongodb').MongoClient

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'

const app = express()
const db = mongo.connect(mongoUrl, { useNewUrlParser: true }).then(it => it.db('dev').collection('notes'))
const upload = multer({ dest: path.join(__dirname, 'public/uploads/') })

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: await getNotesAsMd(null) })
})

app.post('/note', upload.single('image'), async (req, res) => {
  if (req.body.upload) {
    return res.render('index', {
      content: `${req.body.description} ![](/uploads/${encodeURIComponent(req.file.filename)})`,
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