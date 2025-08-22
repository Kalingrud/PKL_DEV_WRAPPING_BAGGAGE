const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/iffat', (req, res) => {
  res.send('Halo, saya Iffat. Umur saya 14 tahun. Hobi saya bermain bola. Saya bersekolah di smk telesandi bekasi jurusan RPL.')
})

app.get('/kalingga', (req, res) => {
  res.send('Halo, saya Kalingga. Umur saya 15 tahun. Hobi saya bermain bulu tangkis. Saya bersekolah di smk telesandi bekasi jurusan RPL.')
})

app.get('/buyung', (req, res) => {
  res.send('Halo, saya buyung. Umur saya 20 tahun. Hobi saya bermain futsal. Saya bersekolah di smk telesandi bekasi jurusan RPL.')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
