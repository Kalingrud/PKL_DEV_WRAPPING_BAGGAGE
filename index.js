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

// ==================== CREATE ENDPOINT ====================
app.post('/api/users/create', async (req, res) => {
  const { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
  
  // Validasi field wajib (sesuai database kecuali cookie1)
  if (!username || !userdesc || !pass || !usertype || !jenisuser || !cabang) {
    return res.status(400).json({ 
      error: 'Field wajib: username, userdesc, pass, usertype, jenisuser, cabang' 
    });
  }
  
  try {
    // CEK APAKAH USERNAME SUDAH ADA
    const checkQuery = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    
    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error('Check username error:', err);
        return res.status(500).json({ error: 'Database error during username check' });
      }
      
      // Jika username sudah ada, tolak request
      if (results[0].count > 0) {
        return res.status(409).json({ 
          error: 'Username sudah ada di database. Gunakan username lain.' 
        });
      }
      
      // Jika username belum ada, lanjutkan proses insert
      try {
        // Hash password sebelum disimpan
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
          parseInt(usertype),
          parseInt(jenisuser),
          parseInt(cabang)
        ];
        
        db.query(insertQuery, values, (insertErr, result) => {
          if (insertErr) {
            console.error('Insert error:', insertErr);
            return res.status(500).json({ error: 'Database error during insert' });
          }
          
          res.json({ 
            message: 'User berhasil dibuat dengan password ter-hash', 
            userId: result.insertId,
            username: username
          });
        });
      } catch (hashError) {
        console.error('Hash error:', hashError);
        res.status(500).json({ error: 'Password hashing failed' });
      }
    });
    
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== READ ENDPOINT ====================
app.post('/api/users/read', (req, res) => {
  const { id, username, userdesc, usertype, jenisuser, cabang } = req.body;
  
  let query = 'SELECT * FROM users WHERE 1=1';
  let params = [];
  
  // Build dynamic WHERE clause berdasarkan parameter yang dikirim
  if (id) {
    query += ' AND id = ?';
    params.push(parseInt(id));
  }
  
  if (username) {
    query += ' AND username = ?';
    params.push(username);
  }
  
  if (userdesc) {
    query += ' AND userdesc = ?';
    params.push(userdesc);
  }
  
  if (usertype) {
    query += ' AND usertype = ?';
    params.push(parseInt(usertype));
  }
  
  if (jenisuser) {
    query += ' AND jenisuser = ?';
    params.push(parseInt(jenisuser));
  }
  
  if (cabang) {
    query += ' AND cabang = ?';
    params.push(parseInt(cabang));
  }
  
  console.log('=== DEBUG READ ===');
  console.log('Request Body:', req.body);
  console.log('Final Query:', query);
  console.log('Parameters:', params);
  console.log('==================');
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    
    res.json({ 
      message: 'Data berhasil ditemukan', 
      data: results 
    });
  });
});

// ==================== UPDATE ENDPOINT ====================
app.post('/api/users/update', async (req, res) => {
  const { id, username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
  
  // Cek ada identifier atau tidak (minimal harus ada id)
  if (!id) {
    return res.status(400).json({ 
      error: 'ID wajib untuk update data' 
    });
  }
  
  try {
    // Build query UPDATE dinamis
    let updateFields = [];
    let updateValues = [];
    
    // Cek field mana saja yang ada di request body untuk diupdate
    if (req.body.hasOwnProperty('username') && username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (req.body.hasOwnProperty('userdesc') && userdesc) {
      updateFields.push('userdesc = ?');
      updateValues.push(userdesc);
    }
    
    if (req.body.hasOwnProperty('pass') && pass) {
      // Hash password baru jika ada
      const hashedPassword = await bcrypt.hash(pass, 10);
      updateFields.push('pass = ?');
      updateValues.push(hashedPassword);
    }
    
    if (req.body.hasOwnProperty('usertype')) {
      updateFields.push('usertype = ?');
      updateValues.push(parseInt(usertype));
    }
    
    if (req.body.hasOwnProperty('jenisuser')) {
      updateFields.push('jenisuser = ?');
      updateValues.push(parseInt(jenisuser));
    }
    
    if (req.body.hasOwnProperty('cabang')) {
      updateFields.push('cabang = ?');
      updateValues.push(parseInt(cabang));
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Tidak ada field yang akan diupdate' 
      });
    }
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const params = [...updateValues, parseInt(id)];
    
    console.log('=== DEBUG UPDATE ===');
    console.log('Request Body:', req.body);
    console.log('Update Fields:', updateFields);
    console.log('Update Values:', updateValues);
    console.log('Final Query:', query);
    console.log('Final Params:', params);
    console.log('====================');
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Data dengan ID tersebut tidak ditemukan' });
      }
      
      res.json({ 
        message: 'Data berhasil diupdate', 
        affectedRows: result.affectedRows 
      });
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update process failed' });
  }
});

// ==================== DELETE ENDPOINT ====================
app.post('/api/users/delete', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      error: 'ID wajib untuk delete data' 
    });
  }
  
  const query = 'DELETE FROM users WHERE id = ?';
  const params = [parseInt(id)];
  
  console.log('=== DEBUG DELETE ===');
  console.log('Request Body:', req.body);
  console.log('Query:', query);
  console.log('Params:', params);
  console.log('====================');
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data dengan ID tersebut tidak ditemukan' });
    }
    
    res.json({ 
      message: 'Data berhasil dihapus', 
      affectedRows: result.affectedRows 
    });
  });
});

// Start server
const PORT = process.env.PORT || 3999;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 CREATE Endpoint: POST http://localhost:${PORT}/api/users/create`);
  console.log(`📡 READ Endpoint: POST http://localhost:${PORT}/api/users/read`);
  console.log(`📡 UPDATE Endpoint: POST http://localhost:${PORT}/api/users/update`);
  console.log(`📡 DELETE Endpoint: POST http://localhost:${PORT}/api/users/delete`);
});

/* 
=== PANDUAN PENGGUNAAN DI POSTMAN ===

🔹 1. CREATE USER
URL: POST http://localhost:3999/api/users/create
Body Type: x-www-form-urlencoded

Key-Value:
username = johndoe
userdesc = John Doe Admin  
pass = password123
usertype = 2
jenisuser = 2
cabang = 2

🔹 2. READ DATA (BISA PAKAI SEMUA PARAMETER)
URL: POST http://localhost:3999/api/users/read
Body Type: x-www-form-urlencoded

a) Semua data (tanpa parameter):
   (tidak perlu key-value, kirim body kosong)

b) Berdasarkan ID:
   id = 18

c) Berdasarkan username:
   username = bagaswisnu

d) Berdasarkan userdesc:
   userdesc = bagaswisnu

e) Berdasarkan usertype:
   usertype = 2

f) Berdasarkan jenisuser:
   jenisuser = 2

g) Berdasarkan cabang:
   cabang = 2

h) Kombinasi parameter:
   usertype = 2
   cabang = 2

🔹 3. UPDATE DATA
URL: POST http://localhost:3999/api/users/update
Body Type: x-www-form-urlencoded

Key-Value (ID wajib):
id = 18
username = johnsmith
userdesc = John Smith Updated
pass = newpassword456
usertype = 1
jenisuser = 1
cabang = 1

🔹 4. DELETE DATA
URL: POST http://localhost:3999/api/users/delete
Body Type: x-www-form-urlencoded

Key-Value:
id = 18

=== REVISI YANG TELAH DILAKUKAN ===

✅ Endpoint terpisah untuk setiap operasi CRUD
✅ Parameter sama dengan database (id, username, userdesc, pass, usertype, jenisuser, cabang)
✅ Cookie1 tidak digunakan sesuai permintaan
✅ READ bisa menggunakan semua parameter dan kombinasinya
✅ Password tetap dienkripsi dengan bcrypt
✅ Validasi data yang proper
✅ Error handling yang baik
✅ Debug logging untuk troubleshooting

=== CARA SETUP ===

1. Ganti file users.js atau index.js dengan kode ini
2. Pastikan dependencies sudah terinstall: npm install express mysql2 bcrypt
3. Jalankan: node index.js atau nodemon index.js
4. Test di Postman dengan endpoint dan parameter di atas

Sekarang API sudah sesuai dengan requirement guru Anda! 🎉
*/