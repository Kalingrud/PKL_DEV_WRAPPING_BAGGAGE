const mysql = require('mysql2');

// Konfigurasi database MySQL
const dbConfig = {
  host: '103.153.61.219',
  user: 'pkl_dev',
  password: 'Pkl_dev123!',
  database: 'pkl_wrapping',
  connectionLimit: 10,
  // Option yang valid untuk mysql2 connection pool
  acquireTimeout: 60000,    // Waktu maksimal untuk dapat koneksi (60 detik)
  waitForConnections: true, // Tunggu jika pool penuh
  queueLimit: 0,            // Tidak ada batas antrian
  enableKeepAlive: true,    // Aktifkan keep-alive
  keepAliveInitialDelay: 0  // Keep-alive langsung aktif
};

// Buat connection pool
const pool = mysql.createPool(dbConfig);

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('DB connection error:', err.message);
    return;
  }
  console.log('Database connected');
  connection.release();
});

module.exports = pool;
