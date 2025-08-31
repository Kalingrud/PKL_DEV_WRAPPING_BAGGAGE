const mysql = require('mysql2');

// Konfigurasi database MySQL
const dbConfig = {
  host: '103.153.61.219',
  user: 'pkl_dev',
  password: 'Pkl_dev123!',
  database: 'pkl_wrapping',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Buat connection pool
const pool = mysql.createPool(dbConfig);

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

module.exports = pool;
