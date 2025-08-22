const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 8000


app.use(express.json())

// koneksi database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'WRAPPING'
})


db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err)
    return
  }
  console.log('Connected to MySQL database: siswa_db')
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Route asli yang sudah ada (static)
app.get('/iffat', (req, res) => {
  res.send('haloo saya iffat hobi saya main bola')
})

app.get('/kalingga', (req, res) => {
  res.send('Halo, saya Kalingga. Umur saya 15 tahun. Hobi saya bermain bulu tangkis. Saya bersekolah di smk telesandi bekasi jurusan RPL.')
})

app.get('/buyung', (req, res) => {
  res.send('Halo, saya buyung. Umur saya 20 tahun. Hobi saya bermain futsal. Saya bersekolah di smk telesandi bekasi jurusan RPL.')
})