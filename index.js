const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));

// Middleware untuk JSON parsing (opsional, jika nanti butuh)
app.use(express.json());

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // ganti dengan username MySQL kamu
  password: '',           // ganti dengan password MySQL kamu (kosong jika default)
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

// ENDPOINT UTAMA - Satu endpoint untuk semua operasi CRUD
app.post('/api/users', (req, res) => {
  const { type } = req.body;
  
  // Logika penentuan operasi berdasarkan parameter 'type'
  switch (type) {
    case 'create':
      handleCreate(req, res);
      break;
    case 'read':
      handleRead(req, res);
      break;
    case 'update':
      handleUpdate(req, res);
      break;
    case 'delete':
      handleDelete(req, res);
      break;
    default:
      res.status(400).json({ 
        error: 'Invalid type. Use: create, read, update, or delete' 
      });
  }
});

// FUNGSI CREATE - Insert data baru
async function handleCreate(req, res) {
  const { username, userdesc, pass, cookie1, usertype, jenisuser, cabang } = req.body;
  
  // Validasi field wajib
  if (!username || !pass) {
    return res.status(400).json({ 
      error: 'Field wajib: username, pass' 
    });
  }
  
  try {
    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);
    
    const query = `
      INSERT INTO users (username, userdesc, pass, cookie1, usertype, jenisuser, cabang) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Konversi ke tipe yang sesuai dengan database
    const values = [
      username,
      userdesc || null,
      hashedPassword,
      cookie1 || null,
      parseInt(usertype) || 0,
      parseInt(jenisuser) || 0,
      parseInt(cabang) || 1
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Create error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        message: 'User berhasil dibuat dengan password ter-hash', 
        userId: result.insertId 
      });
    });
  } catch (error) {
    console.error('Hash error:', error);
    res.status(500).json({ error: 'Password hashing failed' });
  }
}

// FUNGSI READ - Cari data berdasarkan id, username, atau userdesc
function handleRead(req, res) {
  const { id, username, userdesc } = req.body;
  
  let query;
  let params = [];
  
  if (id) {
    query = 'SELECT * FROM users WHERE id = ?';
    params = [parseInt(id)];
  } else if (username) {
    query = 'SELECT * FROM users WHERE username = ?';
    params = [username];
  } else if (userdesc) {
    query = 'SELECT * FROM users WHERE userdesc = ?';
    params = [userdesc];
  } else {
    // Jika tidak ada parameter, ambil semua data
    query = 'SELECT * FROM users';
  }
  
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
}

// FUNGSI UPDATE - Update data berdasarkan id, username, atau userdesc
async function handleUpdate(req, res) {
  const { id, username, userdesc, pass, cookie1, usertype, jenisuser, cabang } = req.body;
  
  // Cek ada identifier atau tidak
  if (!id && !username && !userdesc) {
    return res.status(400).json({ 
      error: 'Butuh id, username, atau userdesc untuk update' 
    });
  }
  
  try {
    // Build query UPDATE dinamis
    let updateFields = [];
    let updateValues = [];
    
    // Tentukan identifier yang digunakan
    let whereClause;
    let whereValue;
    
    if (id) {
      whereClause = 'id = ?';
      whereValue = parseInt(id);
    } else if (username) {
      whereClause = 'username = ?';
      whereValue = username;
    } else {
      whereClause = 'userdesc = ?';
      whereValue = userdesc;
    }
    
    // Cek field mana saja yang ada di request body untuk diupdate
    // SEMUA field bisa diupdate, termasuk username dan userdesc
    if (req.body.hasOwnProperty('username') && req.body.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(req.body.username);
    }
    
    if (req.body.hasOwnProperty('userdesc')) {
      updateFields.push('userdesc = ?');
      updateValues.push(req.body.userdesc || null);
    }
    
    if (req.body.hasOwnProperty('pass') && req.body.pass) {
      // Hash password baru jika ada
      const hashedPassword = await bcrypt.hash(req.body.pass, 10);
      updateFields.push('pass = ?');
      updateValues.push(hashedPassword);
    }
    
    if (req.body.hasOwnProperty('cookie1')) {
      updateFields.push('cookie1 = ?');
      updateValues.push(req.body.cookie1 || null);
    }
    
    if (req.body.hasOwnProperty('usertype')) {
      updateFields.push('usertype = ?');
      updateValues.push(parseInt(req.body.usertype) || 0);
    }
    
    if (req.body.hasOwnProperty('jenisuser')) {
      updateFields.push('jenisuser = ?');
      updateValues.push(parseInt(req.body.jenisuser) || 0);
    }
    
    if (req.body.hasOwnProperty('cabang')) {
      updateFields.push('cabang = ?');
      updateValues.push(parseInt(req.body.cabang) || 1);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Tidak ada field yang akan diupdate' 
      });
    }
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE ${whereClause}`;
    const params = [...updateValues, whereValue];
    
    console.log('=== DEBUG UPDATE ===');
    console.log('Request Body:', req.body);
    console.log('Where Clause:', whereClause);
    console.log('Where Value:', whereValue);
    console.log('Update Fields:', updateFields);
    console.log('Update Values:', updateValues);
    console.log('Final Query:', query);
    console.log('Final Params:', params);
    console.log('=====================');
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
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
}

// FUNGSI DELETE - Hapus data berdasarkan id, username, atau userdesc
function handleDelete(req, res) {
  const { id, username, userdesc } = req.body;
  
  if (!id && !username && !userdesc) {
    return res.status(400).json({ 
      error: 'Butuh id, username, atau userdesc untuk delete' 
    });
  }
  
  let query;
  let params;
  
  if (id) {
    query = 'DELETE FROM users WHERE id = ?';
    params = [parseInt(id)];
  } else if (username) {
    query = 'DELETE FROM users WHERE username = ?';
    params = [username];
  } else {
    query = 'DELETE FROM users WHERE userdesc = ?';
    params = [userdesc];
  }
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    
    res.json({ 
      message: 'Data berhasil dihapus', 
      affectedRows: result.affectedRows 
    });
  });
}

// Start server
const PORT = process.env.PORT || 3999;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 CRUD Endpoint: POST http://localhost:${PORT}/api/users`);
  console.log(`📝 Gunakan parameter 'type' di body untuk operasi CRUD`);
});

/* 
=== CONTOH PENGGUNAAN DI POSTMAN ===

URL: POST http://localhost:3999/api/users
Method: POST
Body Type: x-www-form-urlencoded

1. CREATE (Buat user baru):
   Key-Value:
   type = create
   username = johndoe
   userdesc = John Doe Admin
   pass = password123
   cookie1 = abc123session
   usertype = 1
   jenisuser = 2
   cabang = 3

2. READ (Baca data):
   a) Semua data:
      type = read
   
   b) Berdasarkan ID:
      type = read
      id = 1
   
   c) Berdasarkan username:
      type = read
      username = johndoe
   
   d) Berdasarkan userdesc:
      type = read
      userdesc = John Doe Admin

3. UPDATE (Update data):
   a) Update berdasarkan ID (bisa update semua field termasuk username/userdesc):
      type = update
      id = 1
      username = johnsmith
      userdesc = John Smith Manager
      pass = newpassword456
      usertype = 2
      jenisuser = 1
      cabang = 5
   
   b) Update berdasarkan username:
      type = update
      username = johndoe
      userdesc = Updated Description
      usertype = 3
   
   c) Update berdasarkan userdesc:
      type = update
      userdesc = John Doe Admin
      pass = changedpassword
      cabang = 2

4. DELETE (Hapus data):
   a) Berdasarkan ID:
      type = delete
      id = 1
   
   b) Berdasarkan username:
      type = delete
      username = johndoe
   
   c) Berdasarkan userdesc:
      type = delete
      userdesc = John Doe Admin

=== PERBAIKAN YANG DILAKUKAN ===

1. ✅ UPDATE sekarang bisa mengubah SEMUA field termasuk username dan userdesc
2. ✅ Menyesuaikan tipe data dengan struktur database (INT untuk usertype, jenisuser, cabang)
3. ✅ Menambahkan parsing parseInt() untuk field numerik
4. ✅ Menangani nilai NULL dengan benar sesuai struktur database
5. ✅ Mempertahankan logika identifier yang fleksibel
6. ✅ Prepared statement untuk keamanan SQL injection
7. ✅ Password hashing dengan bcrypt
8. ✅ Error handling yang komprehensif
9. ✅ Debug logging untuk troubleshooting

=== CARA SETUP ===

1. Pastikan tabel sudah sesuai struktur yang Anda berikan
2. npm install express mysql2 bcrypt
3. node index.js
4. Test di Postman dengan contoh di atas

Sekarang UPDATE akan bekerja dengan sempurna untuk semua field!
*/