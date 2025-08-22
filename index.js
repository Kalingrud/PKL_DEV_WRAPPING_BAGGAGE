const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const siswaRoutes = require('./routes/siswa'); // semua CRUD siswa di sini
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/siswa', siswaRoutes);

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Gagal koneksi ke database:", err.message);
    } else {
        console.log("Berhasil koneksi ke database MySQL");
        connection.release();
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('API Siswa berjalan!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler (fix tanpa '*')
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan'
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
