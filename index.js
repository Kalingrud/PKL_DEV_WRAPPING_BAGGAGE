const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/iffat', (req, res) => {
  res.send('haloo saya iffat')
})

app.get('/kalingga', (req, res) => {
  res.send('haloo saya kalingga')
})

// Route tambahan untuk hobi & umur
app.get('/iffat/hoby', (req, res) => {
  res.send('Hobi saya bermain bola, umur saya 14 tahun')
})

app.get('/kalingga/hoby', (req, res) => {
  res.send('Hobi saya bermain bulu tangkis, umur saya 15 tahun')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
