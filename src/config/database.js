const mysql = require('mysql2');

// Konfigurasi database MySQL
const dbConfig = {
  host:                  '103.153.61.219', // nama host database
  user:                  'pkl_dev',        // nama user database
  password:              'Pkl_dev123!',    // password database
  database:              'pkl_wrapping',   // nama database yang ingin digunakan
  connectionLimit:       200,              // maksimal 200 request yang bisa dihandle sekaligus
  acquireTimeout:        60000,            // waktu maksimal untuk orang 201 yang ga dapet antrian, lebih dari 60 detik orang nya kabur (eror)
  waitForConnections:    true,             // Jika antrian penuh, bisa tunggu sampai 200 orang selesai (bergantian)
  queueLimit:            0,                // tidak ada batas antrian (lobi nya luas)
  enableKeepAlive:       true,             // aktifkan keep-alive Kenapa? 
  // Di mysql2, opsi enableKeepAlive: true artinya koneksi TCP ke 
  // MySQL akan dijaga tetap “hidup” (aktif), 
  // walaupun lagi nggak dipakai query.
  keepAliveInitialDelay: 0                 // keep-alive langsung aktif

// enableKeepAlive: true  → Node.js jaga koneksi tetap hidup dengan sinyal "ping".
//
// keepAliveInitialDelay: 0
//   → Begitu telepon nyambung, langsung bilang: "Halo, aku masih di sini ya, jangan tutup."
//
// keepAliveInitialDelay: 10000
//   → Telepon nyambung, tapi kamu diam dulu 10 detik.
//     Kalau operator ketat, bisa saja telepon diputus sebelum kamu bilang "halo".
};

// Buat connection pool
const pool = mysql.createPool(dbConfig);
// 1. createPool(dbConfig) = bikin kolam berisi pelayan sesuai aturan (dbConfig).


// Test koneksi
pool.getConnection((err, connection) => { //getConnection = coba pinjem 1 pelayan dari kolam.
  if (err) {
    console.error('DB connection error:', err.message); //kalau gagal pinjem, kasih tau ada masalah
    return;
  }
  console.log('Database connected'); //kalo berhasil pinjem, kasih tau udah berhasil bang
  connection.release();  //kalo udah kelar balikin lagi ke kolam
});





module.exports = pool;


