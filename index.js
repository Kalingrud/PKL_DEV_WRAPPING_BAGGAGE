const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: '103.153.61.219',
  user: 'pkl_dev',
  password: 'Pkl_dev123!',
  database: 'pkl_wrapping'
});

// Test koneksi database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// ==================== SECURITY FUNCTIONS ====================

// Fungsi validasi untuk mencegah injeksi HTML, JavaScript, dan konten berbahaya
const validateSecureInput = (value, fieldName) => {
  if (!value || typeof value !== 'string') {
    return { isValid: true, message: '' };
  }

  const input = value.toString().toLowerCase();
  
  // Daftar kata kunci dan pola berbahaya
  const dangerousPatterns = [
    // JavaScript keywords dan functions
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,
    /eval\s*\(/i,
    /function\s*\(/i,
    /document\./i,
    /window\./i,
    /console\./i,
    /location\./i,
    /navigator\./i,
    
    // HTML tags
    /<script/i,
    /<\/script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<button/i,
    /<link/i,
    /<meta/i,
    /<style/i,
    /<\/style/i,
    
    // Event handlers
    /on\w+\s*=/i,  // onclick, onload, dll
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    
    // URL protocols yang mencurigakan
    /http:\/\//i,
    /https:\/\//i,
    /ftp:\/\//i,
    /file:\/\//i,
    
    // SQL injection attempts
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /execute\s*\(/i,
    
    // Encoding attempts
    /&#/i,
    /%3c/i,  // encoded <
    /%3e/i,  // encoded >
    /\\u00/i, // unicode escape
    /\\x/i,   // hex escape
    
    // PHP code
    /<\?php/i,
    /<\?=/i,
    /\?>/i,
    
    // Server-side includes
    /<!--#/i,
    
    // Base64 encoding pattern (untuk script tersembunyi)
    /data:.*base64/i,
    
    // XML entities
    /&lt;/i,
    /&gt;/i,
    /&quot;/i,
    /&#x/i,
  ];

  // Cek apakah input mengandung pola berbahaya
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        message: `${fieldName} tidak boleh mengandung kode HTML, JavaScript, atau karakter berbahaya`
      };
    }
  }

  // Cek karakter khusus yang mencurigakan
  const suspiciousChars = ['<', '>', '{', '}', '(', ')', ';', '&'];
  const hasSuspiciousChars = suspiciousChars.some(char => input.includes(char));
  
  if (hasSuspiciousChars) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh mengandung karakter khusus seperti < > { } ( ) ; &`
    };
  }

  // Cek apakah input terlalu panjang (mencegah buffer overflow)
  if (value.length > 255) {
    return {
      isValid: false,
      message: `${fieldName} tidak boleh lebih dari 255 karakter`
    };
  }

  return { isValid: true, message: '' };
};

// Fungsi sanitasi input - membersihkan input dari karakter berbahaya
const sanitizeInput = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  return value
    .replace(/[<>]/g, '') // Hapus < dan >
    .replace(/[{}]/g, '') // Hapus { dan }
    .replace(/[()]/g, '') // Hapus ( dan )
    .replace(/[;&]/g, '') // Hapus ; dan &
    .replace(/javascript:/gi, '') // Hapus javascript:
    .replace(/on\w+=/gi, '') // Hapus event handlers
    .trim(); // Hapus spasi di awal dan akhir
};

// Fungsi validasi field wajib dengan pesan error spesifik
const validateRequiredFields = (req, res, fields) => {
  const errors = [];
  
  for (const field of fields) {
    const value = req.body[field];
    if (!value || value.toString().trim() === '') {
      switch (field) {
        case 'username':
          errors.push('Mohon isi username terlebih dahulu');
          break;
        case 'userdesc':
          errors.push('Mohon isi userdesc terlebih dahulu');
          break;
        case 'pass':
          errors.push('Mohon isi pass terlebih dahulu');
          break;
        case 'usertype':
          errors.push('Mohon isi usertype terlebih dahulu');
          break;
        case 'jenisuser':
          errors.push('Mohon isi jenisuser terlebih dahulu');
          break;
        case 'cabang':
          errors.push('Mohon isi cabang terlebih dahulu');
          break;
        case 'id':
          errors.push('Mohon isi id terlebih dahulu');
          break;
        default:
          errors.push(`Mohon isi ${field} terlebih dahulu`);
      }
    } else {
      // Validasi keamanan untuk setiap field
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

// Fungsi validasi khusus untuk setiap field
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

// Fungsi cek username unik
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

// ==================== CREATE ENDPOINT ====================
app.post('/users/create', async (req, res) => {
  try {
    console.log('=== CREATE REQUEST ===');
    console.log('Original Body:', req.body);
    
    // Validasi field wajib dengan pesan error spesifik DAN validasi keamanan
    const requiredFields = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
    if (!validateRequiredFields(req, res, requiredFields)) {
      return;
    }
    
    let { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
    
    // Sanitasi input tambahan untuk field text saja
    username = sanitizeInput(username);
    userdesc = sanitizeInput(userdesc);
    pass = sanitizeInput(pass);
    // usertype, jenisuser, cabang tidak perlu sanitasi karena akan divalidasi sebagai number
    
    console.log('Sanitized Values:', { username, userdesc, usertype, jenisuser, cabang });
    
    // Cek apakah username sudah ada
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Validasi tambahan untuk username (hanya boleh alfanumerik dan underscore)
    const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernamePattern.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    
    // Insert ke database dengan prepared statement (sesuai struktur database)
    const insertQuery = `
      INSERT INTO users (username, userdesc, pass, usertype, jenisuser, cabang) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      username, 
      userdesc, 
      hashedPassword, 
      usertype,           // varchar(20) 
      parseInt(jenisuser), // int
      parseInt(cabang)     // int
    ];
    
    console.log('Final Insert Values:', values);
    
    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat menyimpan data'
        });
      }
      
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
        }
      });
    });
    
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ==================== READ ENDPOINT ====================
// Mendukung GET (query params) dan POST (body params) untuk fleksibilitas
app.get('/users/read', (req, res) => {
  handleReadRequest(req, res, req.query);
});

app.post('/users/read', (req, res) => {
  handleReadRequest(req, res, req.body);
});

// Fungsi helper untuk handle read request
function handleReadRequest(req, res, params) {
  try {
    // Validasi keamanan untuk parameter pencarian
    for (const [key, value] of Object.entries(params)) {
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
    
    const { id, username, userdesc, usertype, jenisuser, cabang } = params;
    
    let query = 'SELECT id, username, userdesc, usertype, jenisuser, cabang FROM users WHERE 1=1';
    let queryParams = [];
    
    // Build dynamic WHERE clause dengan LIKE untuk pencarian
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
      queryParams.push(parseInt(usertype));
    }
    
    if (jenisuser) {
      query += ' AND jenisuser = ?';
      queryParams.push(parseInt(jenisuser)); // int, bukan LIKE
    }
    
    if (cabang) {
      query += ' AND cabang = ?';
      queryParams.push(parseInt(cabang)); // int, bukan LIKE
    }
    
    query += ' ORDER BY id ASC';
    
    console.log('=== DEBUG READ ===');
    console.log('Request Params:', params);
    console.log('Final Query:', query);
    console.log('Parameters:', queryParams);
    console.log('==================');
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Read error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil data'
        });
      }
      
      res.json({
        success: true,
        message: 'Data berhasil diambil',
        data: results,
        count: results.length
      });
    });
    
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}

// ==================== UPDATE ENDPOINT ====================
app.post('/users/update', async (req, res) => {
  try {
    // Validasi ID wajib ada
    if (!validateRequiredFields(req, res, ['id'])) {
      return;
    }
    
    // Validasi keamanan untuk semua field yang akan diupdate
    if (!validateFieldSecurity(req, res)) {
      return;
    }
    
    const { id, username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
    
    // Cek apakah user dengan ID tersebut ada
    db.query('SELECT * FROM users WHERE id = ?', [id], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mencari data'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User dengan ID tersebut tidak ditemukan'
        });
      }
      
      // Build query UPDATE dinamis dengan validasi
      let updateFields = [];
      let updateValues = [];
      let updatedData = {};
      
      // Validasi dan build update untuk setiap field
      if (username !== undefined) {
        if (username.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi username terlebih dahulu'
          });
        }
        
        // Validasi pattern username
        const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
        if (!usernamePattern.test(username)) {
          return res.status(400).json({
            success: false,
            message: 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)'
          });
        }
        
        // Cek username unik (kecuali untuk user saat ini)
        const usernameExists = await checkUsernameExists(username, id);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan'
          });
        }
        
        updateFields.push('username = ?');
        updateValues.push(sanitizeInput(username));
        updatedData.username = sanitizeInput(username);
      }
      
      if (userdesc !== undefined) {
        if (userdesc.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi userdesc terlebih dahulu'
          });
        }
        updateFields.push('userdesc = ?');
        updateValues.push(sanitizeInput(userdesc));
        updatedData.userdesc = sanitizeInput(userdesc);
      }
      
      if (pass !== undefined) {
        if (pass.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi pass terlebih dahulu'
          });
        }
        // Hash password baru
        const hashedPassword = await bcrypt.hash(sanitizeInput(pass), 10);
        updateFields.push('pass = ?');
        updateValues.push(hashedPassword);
        updatedData.pass = 'Updated';
      }
      
      if (usertype !== undefined) {
        if (usertype.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi usertype terlebih dahulu'
          });
        }
        updateFields.push('usertype = ?');
        updateValues.push(usertype); // varchar(20), bukan parseInt
        updatedData.usertype = usertype;
      }
      
      if (jenisuser !== undefined) {
        if (jenisuser.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi jenisuser terlebih dahulu'
          });
        }
        updateFields.push('jenisuser = ?');
        updateValues.push(parseInt(jenisuser)); // int
        updatedData.jenisuser = parseInt(jenisuser);
      }
      
      if (cabang !== undefined) {
        if (cabang.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi cabang terlebih dahulu'
          });
        }
        updateFields.push('cabang = ?');
        updateValues.push(parseInt(cabang)); // int
        updatedData.cabang = parseInt(cabang);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada data yang akan diupdate'
        });
      }
      
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      const params = [...updateValues, parseInt(id)];
      
      console.log('=== DEBUG UPDATE ===');
      console.log('Request Body:', req.body);
      console.log('Update Fields:', updateFields);
      console.log('Final Query:', query);
      console.log('Final Params:', params);
      console.log('====================');
      
      db.query(query, params, (updateErr, result) => {
        if (updateErr) {
          console.error('Update error:', updateErr);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupdate data'
          });
        }
        
        res.json({
          success: true,
          message: 'User berhasil diupdate',
          data: {
            id: parseInt(id),
            ...updatedData
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ==================== DELETE ENDPOINT ====================
app.post('/users/delete', (req, res) => {
  try {
    const { id, username } = req.body;
    
    // Validasi keamanan untuk parameter yang dikirim
    if (username && !validateSecureInput(username, 'username').isValid) {
      return res.status(400).json({
        success: false,
        message: 'Username mengandung karakter berbahaya'
      });
    }
    
    // Validasi: minimal salah satu (id atau username) harus ada dan tidak kosong
    const hasValidId = id !== undefined && id !== null && id !== '' && id.toString().trim() !== '';
    const hasValidUsername = username !== undefined && username !== null && username !== '' && username.toString().trim() !== '';
    
    if (!hasValidId && !hasValidUsername) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi id atau username untuk menghapus data'
      });
    }
    
    // Build query berdasarkan parameter yang valid
    let query = 'SELECT id, username FROM users WHERE ';
    let params = [];
    let searchBy = '';
    
    // Prioritas: jika ada username yang valid, gunakan username (karena unik)
    if (hasValidUsername) {
      query += 'username = ?';
      params = [sanitizeInput(username)];
      searchBy = `username "${sanitizeInput(username)}"`;
    } else if (hasValidId) {
      query += 'id = ?';
      params = [parseInt(id)];
      searchBy = `ID ${id}`;
    }
    
    console.log('=== DEBUG DELETE SEARCH ===');
    console.log('Request Body:', req.body);
    console.log('Has Valid ID:', hasValidId);
    console.log('Has Valid Username:', hasValidUsername);
    console.log('Search Query:', query);
    console.log('Search Params:', params);
    console.log('Search By:', searchBy);
    console.log('==============================');
    
    // Cek apakah user ada sebelum dihapus
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mencari data'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: `User dengan ${searchBy} tidak ditemukan`
        });
      }
      
      const userData = results[0];
      const deleteId = userData.id;
      const deleteUsername = userData.username;
      
      // Delete user berdasarkan ID (untuk memastikan tepat sasaran)
      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      const deleteParams = [deleteId];
      
      console.log('=== DEBUG DELETE ACTION ===');
      console.log('Delete Query:', deleteQuery);
      console.log('Delete Params:', deleteParams);
      console.log('Will Delete:', userData);
      console.log('============================');
      
      db.query(deleteQuery, deleteParams, (deleteErr, result) => {
        if (deleteErr) {
          console.error('Delete error:', deleteErr);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus data'
          });
        }
        
        res.json({
          success: true,
          message: `User "${deleteUsername}" berhasil dihapus`,
          data: {
            deleted_id: deleteId,
            deleted_username: deleteUsername,
            searched_by: searchBy
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4999;
app.listen(PORT, () => {
  console.log('🚀 Server berjalan di http://localhost:' + PORT);
  console.log('');
  console.log('🔒 SECURITY FEATURES ENABLED:');
  console.log('✅ HTML/JavaScript injection protection');
  console.log('✅ SQL injection protection');
  console.log('✅ URL/Link input blocked');
  console.log('✅ Script tag detection');
  console.log('✅ Event handler blocking');
  console.log('✅ Username pattern validation (alphanumeric + underscore only)');
  console.log('✅ Input sanitization');
  console.log('✅ Length validation (max 255 characters)');
  console.log('');
  console.log('📡 CREATE Endpoint: POST http://localhost:' + PORT + '/users/create');
  console.log('📡 READ Endpoint: GET http://localhost:' + PORT + '/users/read');
  console.log('📡 UPDATE Endpoint: POST http://localhost:' + PORT + '/users/update');
  console.log('📡 DELETE Endpoint: POST http://localhost:' + PORT + '/users/delete');
  console.log('');
  console.log('⚠️  BLOCKED INPUT EXAMPLES:');
  console.log('❌ alert("hello")       - JavaScript function');
  console.log('❌ <script>code</script> - HTML script tag');
  console.log('❌ javascript:alert()   - JavaScript protocol');
  console.log('❌ http://example.com   - URL/link');
  console.log('❌ onclick=alert()      - Event handler');
  console.log('❌ user{malicious}      - Special characters');
  console.log('❌ admin(); DROP TABLE  - SQL injection attempt');
  console.log('');
  console.log('✅ ALLOWED INPUT EXAMPLES:');
  console.log('✅ john_doe             - Alphanumeric with underscore');
  console.log('✅ admin123             - Alphanumeric');
  console.log('✅ user_staff_2024      - Valid username pattern');
  console.log('✅ Jakarta Pusat        - Normal text (for userdesc, jenisuser, cabang)');
  console.log('');
  console.log('🔧 Server siap digunakan dengan proteksi keamanan!');
});

module.exports = app;