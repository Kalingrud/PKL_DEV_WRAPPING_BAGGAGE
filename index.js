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
  
  // Validasi field wajib (cookie1 boleh kosong)
  if (!username || !userdesc || !pass || !usertype || !jenisuser || !cabang) {
    return res.status(400).json({ 
      error: 'Field wajib: username, userdesc, pass, usertype, jenisuser, cabang' 
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
    
    // cookie1 bisa null jika tidak dikirim
    const cookieValue = cookie1 || null;
    
    db.query(query, [username, userdesc, hashedPassword, cookieValue, usertype, jenisuser, cabang], (err, result) => {
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
    params = [id];
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
  
  // Cek ada identifier atau tidak (id, username, atau userdesc)
  if (!id && !username && !userdesc) {
    return res.status(400).json({ 
      error: 'Butuh id, username, atau userdesc untuk update' 
    });
  }
  
  try {
    // Build query UPDATE dinamis - hanya field yang dikirim di body
    let updateFields = [];
    let updateValues = [];
    
    // Cek field mana saja yang ada di request body (bukan identifier)
    if (req.body.hasOwnProperty('pass') && pass) {
      // Hash password baru jika ada
      const hashedPassword = await bcrypt.hash(pass, 10);
      updateFields.push('pass = ?');
      updateValues.push(hashedPassword);
    }
    
    if (req.body.hasOwnProperty('cookie1')) {
      updateFields.push('cookie1 = ?');
      updateValues.push(cookie1 || null);
    }
    
    if (req.body.hasOwnProperty('usertype')) {
      updateFields.push('usertype = ?');
      updateValues.push(usertype);
    }
    
    if (req.body.hasOwnProperty('jenisuser')) {
      updateFields.push('jenisuser = ?');
      updateValues.push(jenisuser);
    }
    
    if (req.body.hasOwnProperty('cabang')) {
      updateFields.push('cabang = ?');
      updateValues.push(cabang);
    }
    
    // Update username/userdesc hanya jika bukan dipakai sebagai identifier
    if (req.body.hasOwnProperty('username') && !username) {
      updateFields.push('username = ?');
      updateValues.push(req.body.username);
    }
    
    if (req.body.hasOwnProperty('userdesc') && !userdesc) {
      updateFields.push('userdesc = ?');
      updateValues.push(req.body.userdesc);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Tidak ada field yang akan diupdate' 
      });
    }
    
    // Tentukan WHERE clause
    let whereClause;
    let whereValue;
    
    if (id) {
      whereClause = 'id = ?';
      whereValue = id;
    } else if (username) {
      whereClause = 'username = ?';
      whereValue = username;
    } else {
      whereClause = 'userdesc = ?';
      whereValue = userdesc;
    }
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE ${whereClause}`;
    const params = [...updateValues, whereValue];
    
    console.log('=== DEBUG UPDATE ===');
    console.log('Request Body:', req.body);
    console.log('ID:', id);
    console.log('Update Fields:', updateFields);
    console.log('Update Values:', updateValues);
    console.log('Where Value:', whereValue);
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
        message: 'Data berhasil diupdate dengan password ter-hash', 
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
    params = [id];
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
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 CRUD Endpoint: POST http://localhost:${PORT}/api/users`);
  console.log(`📝 Gunakan parameter 'type' di body untuk operasi CRUD`);
});

/* 
=== CARA SETUP ===

1. Copy kode ini ke file index.js di root folder project kamu

2. Install dependencies:
   npm install express mysql2 bcrypt

3. Buat tabel users di database devfuwiqhip_wrapping:
   USE devfuwiqhip_wrapping;
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     username VARCHAR(255) NOT NULL,
     userdesc VARCHAR(255) NOT NULL,
     pass VARCHAR(255) NOT NULL,
     cookie1 VARCHAR(255) NULL,          -- NULL diizinkan
     usertype INT NOT NULL,
     jenisuser VARCHAR(255) NOT NULL,
     cabang VARCHAR(255) NOT NULL
   );

4. Jalankan server:
   node index.js
   atau
   nodemon index.js (jika sudah install nodemon)

5. Test di Postman:
   POST http://localhost:3000/api/users
   Body: x-www-form-urlencoded

=== STRUKTUR FOLDER SETELAH SETUP ===
📁 WRAPPING-NODE/
├── 📁 config/
├── 📁 controllers/
├── 📁 models/
├── 📁 routes/
├── 📄 index.js          ← COPY KODE INI KESINI
├── 📄 package.json
└── 📄 README.md
*/