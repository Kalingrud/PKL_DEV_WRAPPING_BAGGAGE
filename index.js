const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./db'); // koneksi database

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

// ✅ Route default
app.get('/', (req, res) => {
    res.send('API Siswa berjalan!');
});

// ✅ CREATE - Tambah data siswa
app.post('/api/siswa', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;

    if (!nama || !asal_sekolah || !jurusan || !hobby) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const query = `
        INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(query, [nama, asal_sekolah, jurusan, hobby], (err, result) => {
        if (err) {
            console.error("❌ Error insert data:", err);
            return res.status(500).json({ message: "Gagal menambahkan siswa" });
        }
        res.status(201).json({
            message: "✅ Siswa berhasil ditambahkan",
            data: {
                id: result.insertId,
                nama,
                asal_sekolah,
                jurusan,
                hobby
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});