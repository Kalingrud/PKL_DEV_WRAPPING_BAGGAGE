// users.js - DEBUG VERSION
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// Middleware untuk CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Set trust proxy untuk mendapatkan IP yang benar
app.set('trust proxy', true); 

// Middleware untuk parsing data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 DEBUG: Middleware logging sederhana untuk cek apakah middleware jalan
app.use((req, res, next) => {
    console.log('');
    console.log('🔥 ======= REQUEST MASUK =======');
    console.log('🕐 Waktu:', new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}));
    console.log('🌐 IP:', req.ip || req.connection.remoteAddress || 'unknown');
    console.log('📱 Method:', req.method);
    console.log('🎯 Path:', req.path);
    console.log('🔍 User-Agent:', req.headers['user-agent'] || 'unknown');
    console.log('================================');
    next();
});

// 🔥 IMPORT DAN PASANG API LOGGING MIDDLEWARE
try {
    const { apiLogMiddleware } = require('./routes/api_log');
    app.use(apiLogMiddleware);
    console.log('✅ API Log middleware berhasil dipasang');
} catch (error) {
    console.error('❌ Error loading API Log middleware:', error.message);
    console.log('⚠️ Server akan jalan tanpa logging');
}

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'pkl_wrapping'
});

// Test koneksi database
db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// ==================== SECURITY FUNCTIONS ====================
const validateSecureInput = (value, fieldName) => {
  if (!value || typeof value !== 'string') {
    return { isValid: true, message: '' };
  }

  const input = value.toString().toLowerCase();
  
  const dangerousPatterns = [
    /alert\s*\(/i, /confirm\s*\(/i, /prompt\s*\(/i, /eval\s*\(/i,
    /function\s*\(/i, /document\./i, /window\./i, /console\./i,
    /<script/i, /<\/script/i, /<iframe/i, /<object/i, /<embed/i,
    /on\w+\s*=/i, /javascript:/i, /vbscript:/i, /data:/i,
    /union\s+select/i, /drop\s+table/i, /delete\s+from/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        message: `${fieldName} tidak boleh mengandung kode HTML, JavaScript, atau karakter berbahaya`
      };
    }
  }

  const suspiciousChars = ['<', '>', '{', '}', '(', ')', ';', '&'];
  const hasSuspiciousChars = suspiciousChars.some(char => input.includes(char));
  
  if (hasSuspiciousChars) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh mengandung karakter khusus seperti < > { } ( ) ; &`
    };
  }

  if (value.length > 255) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh lebih dari 255 karakter`
    };
  }

  return { isValid: true, message: '' };
};

const sanitizeInput = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  return value
    .replace(/[<>]/g, '')
    .replace(/[{}]/g, '')
    .replace(/[()]/g, '')
    .replace(/[;&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

const validateRequiredFields = (req, res, fields) => {
  const errors = [];
  
  for (const field of fields) {
    const value = req.body[field];
    if (!value || value.toString().trim() === '') {
      switch (field) {
        case 'username': errors.push('Mohon isi username terlebih dahulu'); break;
        case 'userdesc': errors.push('Mohon isi userdesc terlebih dahulu'); break;
        case 'pass': errors.push('Mohon isi pass terlebih dahulu'); break;
        case 'usertype': errors.push('Mohon isi usertype terlebih dahulu'); break;
        case 'jenisuser': errors.push('Mohon isi jenisuser terlebih dahulu'); break;
        case 'cabang': errors.push('Mohon isi cabang terlebih dahulu'); break;
        case 'id': errors.push('Mohon isi id terlebih dahulu'); break;
        default: errors.push(`Mohon isi ${field} terlebih dahulu`);
      }
    } else {
      const securityCheck = validateSecureInput(value, field);
      if (!securityCheck.isValid) {
        errors.push(securityCheck.message);
      }
    }
  }
  
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
    return false;
  }
  return true;
};

const validateFieldSecurity = (req, res) => {
  const fieldsToCheck = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
  const errors = [];
  
  for (const field of fieldsToCheck) {
    if (req.body[field] !== undefined) {
      const securityCheck = validateSecureInput(req.body[field], field);
      if (!securityCheck.isValid) {
        errors.push(securityCheck.message);
      }
    }
  }
  
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
    return false;
  }
  return true;
};

const checkUsernameExists = (username, excludeId = null) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT id FROM users WHERE username = ?';
    let params = [username];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

const getLocalIPAddress = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  return results;
};

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
  console.log('🔥 ROOT ENDPOINT DIAKSES - HARUS TERCATAT DI LOG!');
  
  const localIPs = getLocalIPAddress();
  const serverInfo = {
    message: '🔥 User Management API Server with AUTO LOGGING',
    version: '1.0.0',
    timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
    logging_status: '🔥 ACTIVE - Semua request tercatat otomatis di api_log',
    test_info: 'Endpoint ini harus tercatat di tabel api_log!',
    server_info: {
      localhost: `http://localhost:${PORT || 4999}`,
      local_ips: localIPs.map(ip => `http://${ip}:${PORT || 4999}`),
      port: PORT || 4999
    },
    endpoints: {
      create: 'POST /users/create',
      read_get: 'GET /users/read',
      read_post: 'POST /users/read',
      update: 'POST /users/update',
      delete: 'POST /users/delete'
    }
  };
  
  res.json(serverInfo);
});

// ==================== READ ENDPOINTS ====================
app.get('/users/read', (req, res) => {
  console.log('🔥 READ GET ENDPOINT DIAKSES - HARUS TERCATAT DI LOG!');
  handleReadRequest(req, res, req.query);
});

app.post('/users/read', (req, res) => {
  console.log('🔥 READ POST ENDPOINT DIAKSES - HARUS TERCATAT DI LOG!');
  handleReadRequest(req, res, req.body);
});

function handleReadRequest(req, res, params) {
  try {
    console.log('=== READ REQUEST - SHOULD BE LOGGED ===');
    console.log('📍 Client IP:', req.ip || req.connection.remoteAddress);
    console.log('📊 Request Params:', params);
    console.log('🔍 User-Agent:', req.headers['user-agent']);
    
    for (const [key, value] of Object.entries(params || {})) {
      if (value && typeof value === 'string') {
        const securityCheck = validateSecureInput(value, key);
        if (!securityCheck.isValid) {
          return res.status(400).json({
            success: false,
            message: securityCheck.message
          });
        }
      }
    }
    
    const { id, username, userdesc, usertype, jenisuser, cabang } = params || {};
    
    let query = 'SELECT id, username, userdesc, usertype, jenisuser, cabang FROM users WHERE 1=1';
    let queryParams = [];
    
    if (id) {
      query += ' AND id = ?';
      queryParams.push(parseInt(id));
    }
    
    if (username) {
      query += ' AND username LIKE ?';
      queryParams.push('%' + sanitizeInput(username) + '%');
    }
    
    if (userdesc) {
      query += ' AND userdesc LIKE ?';
      queryParams.push('%' + sanitizeInput(userdesc) + '%');
    }
    
    if (usertype) {
      query += ' AND usertype = ?';
      queryParams.push(usertype);
    }
    
    if (jenisuser) {
      query += ' AND jenisuser = ?';
      queryParams.push(parseInt(jenisuser));
    }
    
    if (cabang) {
      query += ' AND cabang = ?';
      queryParams.push(parseInt(cabang));
    }
    
    query += ' ORDER BY id ASC';
    
    console.log('🗄️ Executing query:', query);
    console.log('📝 Query params:', queryParams);
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('❌ Read error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil data'
        });
      }
      
      console.log('✅ Query berhasil, hasil:', results.length, 'records');
      
      // Response ini HARUS di-log oleh middleware
      const responseData = {
        success: true,
        message: 'Data berhasil diambil',
        data: results,
        count: results.length,
        logged_at: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
      };
      
      console.log('📤 Mengirim response - HARUS TERCATAT DI LOG!');
      res.json(responseData);
    });
    
  } catch (error) {
    console.error('❌ Read error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}

// ==================== CREATE ENDPOINT ====================
app.post('/users/create', async (req, res) => {
  try {
    console.log('🔥 CREATE ENDPOINT DIAKSES - HARUS TERCATAT DI LOG!');
    console.log('📍 Client IP:', req.ip || req.connection.remoteAddress);
    console.log('📊 Original Body:', req.body);
    
    const requiredFields = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
    if (!validateRequiredFields(req, res, requiredFields)) {
      return;
    }
    
    let { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
    
    username = sanitizeInput(username);
    userdesc = sanitizeInput(userdesc);
    pass = sanitizeInput(pass);
    
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernamePattern.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)'
      });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    
    const insertQuery = `
      INSERT INTO users (username, userdesc, pass, usertype, jenisuser, cabang) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      username, 
      userdesc, 
      hashedPassword, 
      usertype,
      parseInt(jenisuser),
      parseInt(cabang)
    ];
    
    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('❌ Insert error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat menyimpan data'
        });
      }
      
      console.log('📤 Mengirim response CREATE - HARUS TERCATAT DI LOG!');
      
      // Response ini HARUS otomatis di-log
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: {
          id: result.insertId,
          username,
          userdesc,
          usertype,
          jenisuser,
          cabang
        },
        logged_at: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
      });
    });
    
  } catch (error) {
    console.error('❌ Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ==================== ENDPOINT KHUSUS UNTUK TEST LOGGING ====================
app.get('/test/log', (req, res) => {
    console.log('🧪 TEST LOGGING ENDPOINT - INI PASTI HARUS TERCATAT!');
    
    res.json({
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
    });
});

// Endpoint untuk cek log terbaru
app.get('/api/logs/check', async (req, res) => {
    try {
        const { apiLog } = require('./routes/api_log');
        
        // Test koneksi dulu
        const connectionOK = await apiLog.testConnection();
        if (!connectionOK) {
            return res.status(500).json({
                success: false,
                message: 'Koneksi database api_log bermasalah'
            });
        }
        
        // Ambil 5 log terbaru
        const logs = await apiLog.getRecentLogs(5);
        
        res.json({
            success: true,
            message: 'Log check berhasil',
            connection_status: 'OK',
            recent_logs: logs,
            total_found: logs.length
        });
        
    } catch (error) {
        console.error('❌ Error checking logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error: ' + error.message,
            connection_status: 'FAILED'
        });
    }
});

// Start server
const PORT = process.env.PORT || 4999;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIPs = getLocalIPAddress();
  
  console.log('');
  console.log('🚀 ===============================================');
  console.log('🔥 SERVER STARTED WITH DEBUG LOGGING!');
  console.log('🔥 Setiap request HARUS tercatat di api_log');
  console.log('===============================================');
  console.log('');
  console.log('🌐 ACCESS URLs:');
  console.log(`📍 Localhost: http://localhost:${PORT}`);
  console.log(`📍 Local Network: http://127.0.0.1:${PORT}`);
  
  if (localIPs.length > 0) {
    console.log('📍 Local IP Addresses:');
    localIPs.forEach(ip => {
      console.log(`   🔗 http://${ip}:${PORT}`);
    });
  }
  
  console.log('');
  console.log('🧪 TEST LOGGING DENGAN POSTMAN:');
  console.log(`1. GET  http://localhost:${PORT}/test/log`);
  console.log(`2. GET  http://localhost:${PORT}/users/read`);
  console.log(`3. GET  http://localhost:${PORT}/api/logs/check`);
  console.log('');
  console.log('📊 YANG HARUS TERCATAT OTOMATIS:');
  console.log('✅ incoming: tanggal-bulan-tahun jam:menit:detik');
  console.log('✅ from_ip: IP address user');
  console.log('✅ agent_detect: User-Agent string');
  console.log('✅ url_method: GET/POST/PUT/DELETE');
  console.log('✅ duration: waktu response dalam ms');
  console.log('✅ app_response: isi response JSON');
  console.log('===============================================');
});

module.exports = app;