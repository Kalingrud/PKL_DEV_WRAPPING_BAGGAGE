const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Route baru untuk /iffat
app.get('/iffat', (req, res) => {
  res.send('haloo saya iffat')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})