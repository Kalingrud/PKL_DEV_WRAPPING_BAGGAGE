const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // kosong jika tidak ada password
    database: process.env.DB_NAME || 'devfuwiqhip_wrapping',
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error(" Gagal koneksi ke database:", err.message);
        console.error("Pastikan MySQL server sudah running dan konfigurasi database benar");
    } else {
        console.log("Berhasil koneksi ke database MySQL");
        console.log(`Database: ${process.env.DB_NAME || 'devfuwiqhip_wrapping'}`);
        connection.release();
    }
});

module.exports = db;