const mysql = require('mysql2');

// Konfigurasi database MySQL - Localhost
const dbConfig = {
  host:                  process.env.DB_HOST || '127.0.0.1', // nama host database (localhost)
  user:                  process.env.DB_USER || 'root',      // nama user database default XAMPP/MySQL
  password:              process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '', // password database default kosong
  database:              process.env.DB_NAME || 'pkl_wrapping', // nama database yang digunakan
  port:                  parseInt(process.env.DB_PORT, 10) || 3306, // port MySQL default
  connectionLimit:       50,               // connection limit optimal (increased from 20)
  waitForConnections:    true,             // tunggu koneksi tersedia
  queueLimit:            0,                // tidak ada batas antrian
  enableKeepAlive:       true,             // aktifkan keep-alive
  keepAliveInitialDelay: 0,                // keep-alive langsung aktif
  charset:               'utf8mb4',        // charset untuk support emoji dan karakter khusus
  timezone:              'local',          // timezone lokal
  dateStrings:           false,            // return dates as Date objects, not strings
  debug:                 false,            // set true untuk debug mode
  multipleStatements:    false,            // disable multiple statements untuk security
  connectTimeout:        10000,            // 10 detik timeout untuk koneksi awal
  namedPlaceholders:     false             // disable named placeholders

// enableKeepAlive: true  → Node.js jaga koneksi tetap hidup dengan sinyal "ping".
//
// keepAliveInitialDelay: 0
//   → Begitu telepon nyambung, langsung bilang: "Halo, aku masih di sini ya, jangan tutup."
//
// acquireTimeout: 60000
//   → Maksimal 60 detik untuk mendapatkan koneksi dari pool
//
// idleTimeout: 300000
//   → Koneksi akan dihapus dari pool setelah 5 menit tidak digunakan
//
// Note: reconnect, maxReconnects, reconnectDelay, dan timeout tidak didukung oleh mysql2
// Retry logic diimplementasikan di level application (controller)
};

// Buat connection pool
const pool = mysql.createPool(dbConfig);
console.log('✅ Database Pool Berhasil terkoneksi');

// Handle pool errors dan auto-reconnect
pool.on('connection', (connection) => {
  console.log('🔗 New database connection established');
  
  // Set session variables untuk connection ini
  connection.query("SET SESSION wait_timeout=28800"); // 8 jam
  connection.query("SET SESSION interactive_timeout=28800"); // 8 jam
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.code || err.message);
  
  // Log error tapi jangan crash aplikasi
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost - Pool will create new connection on next request');
  } else if (err.code === 'ECONNRESET') {
    console.log('🔄 Connection reset - Pool will reconnect automatically');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('⏰ Connection timeout - Check network or MySQL server');
  }
});

// Wrapper untuk db.query dengan auto-retry untuk handle connection loss
const originalQuery = pool.query.bind(pool);

pool.query = function(sql, params, callback) {
  // Handle callback style
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  
  const maxRetries = 3;
  let retryCount = 0;
  
  const executeQuery = () => {
    originalQuery(sql, params, (err, results, fields) => {
      // Check if error is connection-related
      if (err && retryCount < maxRetries) {
        const isConnectionError = 
          err.code === 'PROTOCOL_CONNECTION_LOST' ||
          err.code === 'ECONNRESET' ||
          err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
          err.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' ||
          err.errno === 'ETIMEDOUT' ||
          err.message.includes('Connection lost') ||
          err.message.includes('socket hang up');
        
        if (isConnectionError) {
          retryCount++;
          console.log(`🔄 Connection error detected, retry ${retryCount}/${maxRetries}`);
          console.log(`   Error: ${err.code || err.message}`);
          
          // Retry after 1 second
          setTimeout(executeQuery, 1000);
          return;
        }
      }
      
      // Return result atau error
      if (callback) {
        callback(err, results, fields);
      }
    });
  };
  
  executeQuery();
};


module.exports = pool;


