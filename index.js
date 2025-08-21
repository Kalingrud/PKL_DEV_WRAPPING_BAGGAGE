const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/iffat', (req, res) => {
  res.send('haloo saya iffat')
  res.send('Hobi saya coli')
})


app.get('/kalingga', (req, res) => {
  res.send('haloo saya kalingga')
  res.send('hobi saya makan')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})