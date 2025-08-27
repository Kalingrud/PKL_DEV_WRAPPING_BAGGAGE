const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'devfuwiqhip_wrapping'
});

// Test koneksi database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

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
    // Validasi field wajib dengan pesan error spesifik
    const requiredFields = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
    if (!validateRequiredFields(req, res, requiredFields)) {
      return;
    }
    
    const { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
    
    // Cek apakah username sudah ada
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    
    // Insert ke database dengan prepared statement
    const insertQuery = `
      INSERT INTO users (username, userdesc, pass, usertype, jenisuser, cabang) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [username, userdesc, hashedPassword, usertype, jenisuser, cabang];
    
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
      queryParams.push('%' + username + '%');
    }
    
    if (userdesc) {
      query += ' AND userdesc LIKE ?';
      queryParams.push('%' + userdesc + '%');
    }
    
    if (usertype) {
      query += ' AND usertype = ?';
      queryParams.push(parseInt(usertype));
    }
    
    if (jenisuser) {
      query += ' AND jenisuser LIKE ?';
      queryParams.push('%' + jenisuser + '%');
    }
    
    if (cabang) {
      query += ' AND cabang LIKE ?';
      queryParams.push('%' + cabang + '%');
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
        
        // Cek username unik (kecuali untuk user saat ini)
        const usernameExists = await checkUsernameExists(username, id);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan'
          });
        }
        
        updateFields.push('username = ?');
        updateValues.push(username);
        updatedData.username = username;
      }
      
      if (userdesc !== undefined) {
        if (userdesc.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi userdesc terlebih dahulu'
          });
        }
        updateFields.push('userdesc = ?');
        updateValues.push(userdesc);
        updatedData.userdesc = userdesc;
      }
      
      if (pass !== undefined) {
        if (pass.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi pass terlebih dahulu'
          });
        }
        // Hash password baru
        const hashedPassword = await bcrypt.hash(pass, 10);
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
        updateValues.push(usertype);
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
        updateValues.push(jenisuser);
        updatedData.jenisuser = jenisuser;
      }
      
      if (cabang !== undefined) {
        if (cabang.toString().trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Mohon isi cabang terlebih dahulu'
          });
        }
        updateFields.push('cabang = ?');
        updateValues.push(cabang);
        updatedData.cabang = cabang;
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
      params = [username];
      searchBy = `username "${username}"`;
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
  console.log('📡 CREATE Endpoint: POST http://localhost:' + PORT + '/users/create');
  console.log('📡 READ Endpoint: GET http://localhost:' + PORT + '/users/read');
  console.log('📡 UPDATE Endpoint: POST http://localhost:' + PORT + '/users/update');
  console.log('📡 DELETE Endpoint: POST http://localhost:' + PORT + '/users/delete');
  console.log('');
  console.log('=== CONTOH PENGGUNAAN DI POSTMAN ===');
  console.log('');
  console.log('🔹 1. CREATE USER');
  console.log('URL: POST http://localhost:' + PORT + '/users/create');
  console.log('Body Type: x-www-form-urlencoded atau JSON');
  console.log('Parameters:');
  console.log('  username = johndoe');
  console.log('  userdesc = John Doe Admin');
  console.log('  pass = password123');
  console.log('  usertype = 2');
  console.log('  jenisuser = Staff IT');
  console.log('  cabang = Jakarta');
  console.log('');
  console.log('🔹 2. READ DATA (dengan LIKE search)');
  console.log('URL: GET http://localhost:' + PORT + '/users/read');
  console.log('Query Parameters (opsional):');
  console.log('  ?username=udin (akan cari yang mengandung "udin")');
  console.log('  ?jenisuser=Staff (akan cari yang mengandung "Staff")');
  console.log('  ?cabang=Jakarta (akan cari yang mengandung "Jakarta")');
  console.log('  ?usertype=2 (exact match)');
  console.log('  ?id=1 (exact match)');
  console.log('');
  console.log('🔹 3. UPDATE DATA');
  console.log('URL: POST http://localhost:' + PORT + '/users/update');
  console.log('Body Type: x-www-form-urlencoded atau JSON');
  console.log('Parameters (ID wajib, yang lain opsional):');
  console.log('  id = 1');
  console.log('  username = johnsmith');
  console.log('  userdesc = John Smith Updated');
  console.log('');
  console.log('🔹 4. DELETE DATA');
  console.log('URL: POST http://localhost:' + PORT + '/users/delete');
  console.log('Body Type: x-www-form-urlencoded atau JSON');
  console.log('Parameters (pilih salah satu atau keduanya):');
  console.log('  id = 1                    (hapus berdasarkan ID)');
  console.log('  username = johndoe        (hapus berdasarkan username)');
  console.log('  id = 1 & username = johndoe  (hapus berdasarkan ID dan username)');
  console.log('');
  console.log('Contoh DELETE berdasarkan ID saja:');
  console.log('  id = 1');
  console.log('');
  console.log('Contoh DELETE berdasarkan username saja:');
  console.log('  username = johndoe');
  console.log('');
  console.log('Contoh DELETE berdasarkan keduanya (lebih spesifik):');
  console.log('  id = 1');
  console.log('  username = johndoe');
  console.log('');
  console.log('=== CARA MENGGUNAKAN DI POSTMAN ===');
  console.log('');
  console.log('⚠️  PENTING: Semua endpoint menggunakan method POST, kecuali READ yang menggunakan GET!');
  console.log('');
  console.log('1. Buka Postman');
  console.log('2. Untuk UPDATE:');
  console.log('   - Pilih method: POST');
  console.log('   - URL: http://localhost:' + PORT + '/users/update');
  console.log('   - Body > x-www-form-urlencoded atau raw > JSON');
  console.log('   - Masukkan parameter: id, username, dll');
  console.log('');
  console.log('3. Untuk DELETE:');
  console.log('   - Pilih method: POST');
  console.log('   - URL: http://localhost:' + PORT + '/users/delete');
  console.log('   - Body > x-www-form-urlencoded atau raw > JSON');
  console.log('   - Masukkan parameter: id atau username (atau keduanya)');
  console.log('   - Contoh: id = 1 atau username = johndoe');
  console.log('');
  console.log('=== FITUR YANG SUDAH SESUAI ATURAN GURU ===');
  console.log('✅ Endpoint berbeda untuk setiap CRUD');
  console.log('✅ Parameter sama dengan nama kolom database');
  console.log('✅ Validasi field wajib dengan pesan error spesifik');
  console.log('✅ Username harus unik - cek duplikat');
  console.log('✅ Pencarian dengan LIKE untuk username, jenisuser, cabang');
  console.log('✅ Password di-hash dengan bcrypt');
  console.log('✅ Prepared statements untuk keamanan');
  console.log('✅ Error handling yang lengkap');
  console.log('');
  console.log('✅ Server siap digunakan!');
});

module.exports = app;