const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/iffat', (req, res) => {
  res.send('Halo, saya Iffat. Umur saya 14 tahun. Hobi saya bermain bola.')
})

app.get('/kalingga', (req, res) => {
  res.send('Halo, saya Kalingga. Umur saya 15 tahun. Hobi saya bermain bulu tangkis.')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
