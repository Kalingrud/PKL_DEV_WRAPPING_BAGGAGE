const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/iffat', (req, res) => {
  res.send('haloo saya iffat')
})


app.get('/kalingga', (req, res) => {
  res.send('haloo saya kalingga')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})