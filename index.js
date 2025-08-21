const express = require('express')
const app = express()
const port = 3000

app.get('/iffat', (req, res) => {
  res.send('hallo nama saya iffat')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})