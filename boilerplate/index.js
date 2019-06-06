const path = require('path')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('index', { notes: [] })
})

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})
