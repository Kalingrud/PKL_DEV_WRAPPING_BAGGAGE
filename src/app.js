const express = require('express');
const cors = require('cors');
const { getLocalIPAddress } = require('./utils/helpers');

// Import middleware
const apiLogMiddleware = require('./middleware/apiLogMiddleware');

// Import routes
const userRoutes = require('./routes/userRoutes');
const apiLogRoutes = require('./routes/apiLogRoutes');

const app = express();

// Debug middleware untuk melihat request awal
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/users/lingga_crud') {
    console.log('REQUEST START - Method:', req.method);
    console.log('REQUEST START - Path:', req.path);
    console.log('REQUEST START - Content-Type:', req.headers['content-type']);
    console.log('REQUEST START - Content-Length:', req.headers['content-length']);
  }
  next();
});

// JSON parsing dengan error handling - HARUS PALING AWAL
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain'], // Support both JSON and text/plain
  verify: (req, res, buf, encoding) => {
    console.log('JSON PARSER - Raw buffer length:', buf.length);
    console.log('JSON PARSER - Content-Type:', req.headers['content-type']);
    
    // Debug JSON content dengan lebih detail
    const rawContent = buf.toString();
    console.log('JSON PARSER - Raw content preview:', rawContent.substring(0, 200));
    
    // Cek karakter di position 115 jika error
    if (rawContent.length > 110) {
      console.log('JSON PARSER - Characters around position 110-120:', rawContent.substring(105, 125));
      console.log('JSON PARSER - Line 7 content:', rawContent.split('\n')[6]);
      console.log('JSON PARSER - Full content with line numbers:');
      rawContent.split('\n').forEach((line, index) => {
        console.log(`Line ${index + 1}: ${line}`);
      });
    }
  }
}));

// Middleware untuk parse text/plain sebagai JSON dengan cleaning yang lebih robust
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain') {
    console.log('TEXT/PLAIN DETECTED');
    console.log('Raw body type:', typeof req.body);
    console.log('Raw body value:', req.body);
    
    if (req.body && typeof req.body === 'string') {
      try {
        console.log('TEXT/PLAIN PARSER - Raw string:', req.body);
        
        // Clean JSON string - remove trailing commas and fix common issues
        let cleanedJson = req.body
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before } or ]
          .replace(/([^\\])\\([^\\\/bfnrt])/g, '$1\\\\$2') // Fix unescaped backslashes
          .replace(/\n\s*/g, '') // Remove newlines and extra spaces
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/\uFEFF/g, '') // Remove BOM
          .trim();
        
        console.log('TEXT/PLAIN PARSER - Cleaned string:', cleanedJson);
        req.body = JSON.parse(cleanedJson);
        console.log('TEXT/PLAIN PARSER - Parsed JSON:', req.body);
      } catch (error) {
        console.error('TEXT/PLAIN PARSER - Parse error:', error.message);
        console.error('TEXT/PLAIN PARSER - Problematic content:', req.body);
        
        // Try multiple fix strategies
        const fixStrategies = [
          // Strategy 1: Remove trailing commas and fix basic issues
          (json) => json
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/([^\\])\\([^\\\/bfnrt])/g, '$1\\\\$2')
            .replace(/\n\s*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\uFEFF/g, '')
            .trim(),
          
          // Strategy 2: Fix unquoted keys and values
          (json) => json
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/(\w+):/g, '"$1":')
            .replace(/:(\s*)(\w+)(\s*[,\}])/g, ': "$2"$3')
            .replace(/([^\\])\\([^\\\/bfnrt])/g, '$1\\\\$2')
            .replace(/\n\s*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\uFEFF/g, '')
            .trim(),
          
          // Strategy 3: More aggressive cleaning
          (json) => json
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/(\w+):/g, '"$1":')
            .replace(/:(\s*)([^",\s{}[\]]+)(\s*[,\}])/g, ': "$2"$3')
            .replace(/([^\\])\\([^\\\/bfnrt])/g, '$1\\\\$2')
            .replace(/\n\s*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\uFEFF/g, '')
            .trim(),
          
          // Strategy 4: Remove all non-printable characters and fix structure
          (json) => json
            .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII characters
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/(\w+):/g, '"$1":')
            .replace(/:(\s*)([^",\s{}[\]]+)(\s*[,\}])/g, ': "$2"$3')
            .replace(/\s+/g, ' ')
            .trim(),
          
          // Strategy 5: Fix missing quotes specifically
          (json) => json
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/(\w+):/g, '"$1":')
            .replace(/:(\s*)([^",\s{}[\]]+)(\s*[,\}])/g, ': "$2"$3')
            .replace(/:(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*[,\}])/g, ': "$2"$3') // Fix unquoted string values
            .replace(/([^\\])\\([^\\\/bfnrt])/g, '$1\\\\$2')
            .replace(/\n\s*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\uFEFF/g, '')
            .trim()
        ];
        
        let fixed = false;
        for (let i = 0; i < fixStrategies.length && !fixed; i++) {
          try {
            const fixedJson = fixStrategies[i](req.body);
            console.log(`TEXT/PLAIN PARSER - Attempting fix strategy ${i + 1}:`, fixedJson);
            req.body = JSON.parse(fixedJson);
            console.log(`TEXT/PLAIN PARSER - Strategy ${i + 1} success:`, req.body);
            fixed = true;
          } catch (fixError) {
            console.error(`TEXT/PLAIN PARSER - Strategy ${i + 1} failed:`, fixError.message);
          }
        }
        
        if (!fixed) {
          console.error('TEXT/PLAIN PARSER - All fix strategies failed');
        }
      }
    } else if (req.body && typeof req.body === 'object' && Object.keys(req.body).length === 0) {
      console.log('TEXT/PLAIN PARSER - Empty object, trying to parse raw data');
      // Jika body kosong, coba ambil dari raw data
      let data = '';
      req.on('data', chunk => {
        data += chunk.toString();
      });
      req.on('end', () => {
        try {
          console.log('TEXT/PLAIN PARSER - Raw data from stream:', data);
          req.body = JSON.parse(data);
          console.log('TEXT/PLAIN PARSER - Parsed from stream:', req.body);
          next();
        } catch (error) {
          console.error('TEXT/PLAIN PARSER - Stream parse error:', error.message);
          next();
        }
      });
      return;
    }
  }
  next();
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Set trust proxy untuk mendapatkan IP yang benar
app.set('trust proxy', true);

// Middleware khusus untuk memastikan JSON parsing
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json' && req.body && typeof req.body === 'object') {
    console.log('JSON parsing berhasil');
  } else if (req.headers['content-type']?.includes('application/json')) {
    console.log('Content-Type JSON tapi body tidak ter-parse');
  }
  next();
});

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));

// Debug middleware untuk form data
app.use((req, res, next) => {
  if (req.method === 'POST' && req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    console.log('FORM DATA DETECTED');
    console.log('Form data:', req.body);
    console.log('Form data keys:', Object.keys(req.body || {}));
  }
  next();
});

// Error handler untuk JSON parsing
app.use((error, req, res, next) => {
  console.log('ERROR HANDLER TRIGGERED');
  console.log('Error type:', error.constructor.name);
  console.log('Error message:', error.message);
  console.log('Error status:', error.status);
  console.log('Has body property:', 'body' in error);
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error detected:', error.message);
    return res.status(400).json({
      code: 400,
      message: 'Invalid JSON format',
      data: [],
      debug_info: {
        error_message: error.message,
        content_type: req.headers['content-type'],
        request_path: req.path
      }
    });
  }
  
  console.log('Error not handled by JSON parser, passing to next middleware');
  next();
});

// Debug middleware - setelah JSON parsing
app.use((req, res, next) => {
  console.log(`\n=== REQUEST DEBUG ===`);
  console.log(`${req.method} ${req.path} - ${req.ip || 'unknown'}`);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Body parsed:', JSON.stringify(req.body, null, 2));
  console.log('=== END DEBUG ===\n');
  next();
});

// API Logging middleware (fixed with non-blocking pattern)
app.use(apiLogMiddleware);

// Routes
app.use('/', userRoutes);
app.use('/api/logs', apiLogRoutes);

// Root endpoint
app.get('/', (req, res) => {
  const localIPs = getLocalIPAddress();
  const serverInfo = {
    message: '🔥 User Management API Server with AUTO LOGGING',
    version: '1.0.0',
    timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
    logging_status: '🔥 ACTIVE - Semua request tercatat otomatis di api_log',
    server_info: {
      port: process.env.PORT || 4999
    },
    endpoints: {
      users: {
        create:       'POST /create',
        read_get:     'GET /read',
        read_post:    'POST /read',
        update:       'POST /update',
        delete:       'POST /delete',
        login:        'POST /login',
        lingga_trx:   'POST /lingga_trx',
        lingga_crud:  'POST /lingga_crud',
        grab_setup:   'POST /Grab_Setup'
      },
      logs: {
        recent:        'GET /api/logs/recent',
        filter:        'GET /api/logs/filter',
        test:          'GET /api/logs/test'
      }
    }
  };
  
  res.json({ code: 200, message: 'OK', data: serverInfo });
});

// Test endpoints
app.get('/test/log', (req, res) => {
  res.json({    
    code: 200,
    message: 'OK',
    data: [{
      success: true,
      message: '🔥 Test logging endpoint berhasil diakses!',
      info: 'Endpoint ini dibuat khusus untuk test apakah logging berjalan',
      timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
      should_be_logged: true,
      client_info: {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        method: req.method,
        path: req.path,
        query: req.query
      }
    }]
  });
});

app.get('/test/unauthorized', (req, res) => {
  res.status(401).json({
success: false,
message: 'Unauthorized access - Token tidak valid atau expired',
error_code: 'UNAUTHORIZED_ACCESS',
timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
required_auth: 'Bearer token atau API key'
  });
});

app.post('/test/unauthorized', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Unauthorized access - Invalid credentials',
    error_code: 'INVALID_CREDENTIALS',
    timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
    required_auth: 'Valid username dan password'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl || req.url
  });
});

module.exports = app;

/*
================================================================================
📚 PENJELASAN LENGKAP TENTANG FUNGSI DAN STRUKTUR APP.JS
================================================================================

🎯 TUJUAN FILE INI:
File app.js adalah jantung dari aplikasi Node.js Express. Ini adalah file utama yang 
mengatur semua middleware, routing, dan konfigurasi server.

📋 STRUKTUR DAN FUNGSI SETIAP BAGIAN:

1️⃣ IMPORT DEPENDENCIES (Baris 1-10):
   - express: Framework utama untuk membuat web server
   - cors: Mengizinkan akses dari domain lain (Cross-Origin Resource Sharing)
   - getLocalIPAddress: Fungsi helper untuk mendapatkan IP address lokal
   - apiLogMiddleware: Middleware khusus untuk logging semua request
   - userRoutes: File yang berisi semua route untuk user (CRUD, login, dll)
   - apiLogRoutes: File yang berisi route untuk melihat log API

2️⃣ KONFIGURASI EXPRESS APP (Baris 12):
   - Membuat instance Express application yang akan menjadi server kita

3️⃣ DEBUG MIDDLEWARE UNTUK LINGGA_CRUD (Baris 15-23):
   - Fungsi: Memantau request khusus untuk endpoint lingga_crud
   - Mengapa: Untuk debugging masalah parsing JSON pada endpoint ini
   - Yang dicatat: Method, path, content-type, dan ukuran content

4️⃣ JSON PARSING DENGAN ERROR HANDLING (Baris 25-47):
   - Fungsi: Mengubah data JSON mentah menjadi object JavaScript
   - Limit: Maksimal 10MB untuk mencegah serangan DoS
   - Support: application/json dan text/plain
   - verify: Fungsi yang dipanggil sebelum parsing untuk debugging
   - Yang dicatat: Ukuran buffer, content-type, preview content, karakter di posisi tertentu

5️⃣ MIDDLEWARE TEXT/PLAIN PARSER (Baris 49-175):
   - Fungsi: Mengubah data text/plain menjadi JSON object
   - Masalah yang diperbaiki: Trailing commas, backslash yang tidak di-escape, newlines
   - 5 strategi perbaikan: Jika parsing gagal, coba strategi lain secara berurutan
   - Cleaning: Menghapus karakter kontrol, BOM, dan karakter tidak terlihat

6️⃣ CORS MIDDLEWARE (Baris 177-182):
   - Fungsi: Mengizinkan akses dari domain/port lain
   - origin: '*' = semua domain diizinkan
   - methods: GET, POST, PUT, DELETE, OPTIONS
   - allowedHeaders: Content-Type dan Authorization

7️⃣ TRUST PROXY SETTING (Baris 184-185):
   - Fungsi: Memastikan IP address yang benar didapatkan
   - Penting untuk: Logging, rate limiting, dan security

8️⃣ JSON PARSING VERIFICATION (Baris 187-195):
   - Fungsi: Memastikan JSON sudah ter-parse dengan benar
   - Debugging: Mencatat status parsing untuk troubleshooting

9️⃣ FORM DATA PARSING (Baris 197-198):
   - Fungsi: Mengubah data form (application/x-www-form-urlencoded) menjadi object
   - extended: true = mendukung nested objects

🔟 FORM DATA DEBUG MIDDLEWARE (Baris 200-208):
   - Fungsi: Memantau dan mencatat data form yang masuk
   - Yang dicatat: Content-type, body, dan keys

1️⃣1️⃣ ERROR HANDLER UNTUK JSON (Baris 210-237):
   - Fungsi: Menangani error saat parsing JSON
   - Yang ditangani: SyntaxError dengan status 400
   - Response: Error message yang user-friendly dengan debug info

1️⃣2️⃣ REQUEST DEBUG MIDDLEWARE (Baris 239-249):
   - Fungsi: Mencatat semua request yang masuk untuk debugging
   - Yang dicatat: Method, path, IP, content-type, body type, body content
   - Format: JSON yang mudah dibaca

1️⃣3️⃣ API LOGGING MIDDLEWARE (Baris 251-252):
   - Fungsi: Mencatat semua request ke database untuk audit trail
   - File: apiLogMiddleware.js
   - Database: Tabel api_log

1️⃣4️⃣ ROUTING (Baris 254-256):
   - app.use('/', userRoutes): Semua route user bisa diakses langsung (tanpa /users)
   - app.use('/api/logs', apiLogRoutes): Route untuk melihat log API

1️⃣5️⃣ ROOT ENDPOINT (Baris 258-290):
   - URL: GET /
   - Fungsi: Menampilkan informasi server dan daftar endpoint
   - Yang ditampilkan: Version, timestamp, status logging, daftar endpoint

1️⃣6️⃣ TEST ENDPOINTS (Baris 292-332):
   - GET /test/log: Test apakah logging berjalan
   - GET /test/unauthorized: Test response 401
   - POST /test/unauthorized: Test response 401 untuk POST

1️⃣7️⃣ 404 HANDLER (Baris 334-341):
   - Fungsi: Menangani URL yang tidak ditemukan
   - Response: Error message dengan path yang diminta

1️⃣8️⃣ MODULE EXPORTS (Baris 343):
   - Fungsi: Mengekspor app untuk digunakan di server.js

================================================================================
🔧 CARA KERJA MIDDLEWARE SECARA BERURUTAN:
================================================================================

1. Request masuk → Debug middleware (lingga_crud)
2. JSON parsing → Error handling jika gagal
3. Text/plain parsing → Jika content-type text/plain
4. CORS → Set headers untuk cross-origin
5. Trust proxy → Set IP yang benar
6. JSON verification → Pastikan parsing berhasil
7. Form data parsing → Parse application/x-www-form-urlencoded
8. Form data debug → Catat form data
9. Error handler → Tangani JSON errors
10. Request debug → Catat semua request
11. API logging → Simpan ke database
12. Routes → Proses ke controller yang sesuai
13. 404 handler → Jika route tidak ditemukan

================================================================================
📊 ENDPOINT YANG TERSEDIA:
================================================================================

USER ENDPOINTS (tanpa prefix /users):
- POST /create          → Membuat user baru
- GET /read            → Membaca data user (dengan query params)
- POST /read           → Membaca data user (dengan body params)
- POST /update         → Update data user
- POST /delete         → Hapus user
- POST /login          → Login user
- POST /lingga_trx     → Transaksi penjualan
- POST /lingga_crud    → CRUD universal untuk semua tabel
- POST /Grab_Setup     → Setup data berdasarkan type

LOG ENDPOINTS:
- GET /api/logs/recent  → Lihat log terbaru
- GET /api/logs/filter  → Filter log berdasarkan kriteria
- GET /api/logs/test     → Test endpoint log

TEST ENDPOINTS:
- GET /test/log          → Test logging
- GET /test/unauthorized → Test response 401
- POST /test/unauthorized → Test response 401 POST

================================================================================
🚀 CARA MENJALANKAN:
================================================================================

1. Pastikan database MySQL sudah running
2. Install dependencies: npm install
3. Jalankan server: npm start atau node src/server.js
4. Server akan berjalan di port 4999 (default)
5. Akses http://localhost:4999 untuk melihat info server

================================================================================
⚠️ PENTING UNTUK DIINGAT:
================================================================================

1. Semua request akan tercatat di database (tabel api_log)
2. JSON parsing memiliki error handling yang robust
3. CORS sudah dikonfigurasi untuk semua domain
4. Debug logging aktif untuk troubleshooting
5. Endpoint tidak memerlukan prefix /users lagi
6. Error handling yang user-friendly
7. Support untuk multiple content-type (JSON, form, text/plain)

================================================================================
*/
