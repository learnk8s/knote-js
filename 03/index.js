const path = require('path')
const express = require('express')
const app = express()
const mongo = require('mongodb').MongoClient
const multer = require('multer')
const marked = require('marked')

const port = process.env.PORT || 3000
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017'

const upload = multer({ dest: path.join(__dirname, 'public/uploads/') })

const db = mongo
  .connect(mongoURL, { useNewUrlParser: true })
  .then(it => it.db('dev').collection('notes'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: await getNotesAsMd(db) })
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
