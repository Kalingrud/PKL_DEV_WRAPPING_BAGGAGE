const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const siswaRoutes = require('./routes/siswa');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use('/api/siswa', siswaRoutes);

// Import database connection
const db = require('./db');

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Gagal koneksi ke database:", err.message);
    } else {
        console.log("Berhasil koneksi ke database MySQL");
        connection.release();
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('API Siswa berjalan!');
});

// CRUD Create Operations

// 1. Create new student (siswa)
app.post('/api/siswa', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    
    // Validation
    if (!nama || !asal_sekolah) {
        return res.status(400).json({
            success: false,
            message: 'Nama dan asal_sekolah wajib diisi'
        });
    }
    
    const query = 'INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    
    db.query(query, [nama, asal_sekolah, jurusan || null, hobby || null], (err, result) => {
        if (err) {
            console.error('Error creating siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan siswa',
                error: err.message
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Siswa berhasil ditambahkan',
            data: {
                id: result.insertId,
                nama,
                asal_sekolah,
                jurusan,
                hobby
            }
        });
    });
});

// 2. Get all students (for testing purposes)
app.get('/api/siswa', (req, res) => {
    const query = 'SELECT * FROM siswa ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil data siswa',
                error: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Data siswa berhasil diambil',
            data: results,
            count: results.length
        });
    });
});

// 3. Get student by ID
app.get('/api/siswa/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'SELECT * FROM siswa WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching siswa by ID:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil data siswa',
                error: err.message
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Data siswa berhasil diambil',
            data: results[0]
        });
    });
});

// 4. Bulk create students
app.post('/api/siswa/bulk', (req, res) => {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Data students harus berupa array dan tidak boleh kosong'
        });
    }
    
    // Validate each student
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (!student.nama || !student.asal_sekolah) {
            return res.status(400).json({
                success: false,
                message: `Student ke-${i + 1}: Nama dan asal_sekolah wajib diisi`
            });
        }
    }
    
    const query = 'INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) VALUES ?';
    const values = students.map(student => [
        student.nama,
        student.asal_sekolah,
        student.jurusan || null,
        student.hobby || null,
        new Date(),
        new Date()
    ]);
    
    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error bulk creating siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan siswa secara bulk',
                error: err.message
            });
        }
        
        res.status(201).json({
            success: true,
            message: `${result.affectedRows} siswa berhasil ditambahkan`,
            data: {
                insertedCount: result.affectedRows,
                firstInsertId: result.insertId
            }
        });
    });
});

// 5. Create student with validation and check duplicates
app.post('/api/siswa/advanced', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    
    // Enhanced validation
    if (!nama || !asal_sekolah) {
        return res.status(400).json({
            success: false,
            message: 'Nama dan asal_sekolah wajib diisi'
        });
    }
    
    if (nama.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Nama minimal 2 karakter'
        });
    }
    
    // Check if student with same name and asal_sekolah already exists
    const checkQuery = 'SELECT id FROM siswa WHERE nama = ? AND asal_sekolah = ?';
    
    db.query(checkQuery, [nama, asal_sekolah], (err, existing) => {
        if (err) {
            console.error('Error checking existing siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal memeriksa data siswa',
                error: err.message
            });
        }
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Siswa dengan nama dan asal sekolah yang sama sudah ada'
            });
        }
        
        // Insert new student
        const insertQuery = 'INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
        
        db.query(insertQuery, [nama, asal_sekolah, jurusan || null, hobby || null], (err, result) => {
            if (err) {
                console.error('Error creating siswa:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Gagal menambahkan siswa',
                    error: err.message
                });
            }
            
            // Get the created student
            const getQuery = 'SELECT * FROM siswa WHERE id = ?';
            db.query(getQuery, [result.insertId], (err, createdStudent) => {
                if (err) {
                    console.error('Error fetching created siswa:', err);
                }
                
                res.status(201).json({
                    success: true,
                    message: 'Siswa berhasil ditambahkan dengan validasi lengkap',
                    data: createdStudent ? createdStudent[0] : {
                        id: result.insertId,
                        nama,
                        asal_sekolah,
                        jurusan,
                        hobby
                    }
                });
            });
        });
    });
});

// 6. Update student (bonus CRUD Update)
app.put('/api/siswa/:id', (req, res) => {
    const { id } = req.params;
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    
    // Validation
    if (!nama || !asal_sekolah) {
        return res.status(400).json({
            success: false,
            message: 'Nama dan asal_sekolah wajib diisi'
        });
    }
    
    // Check if student exists
    const checkQuery = 'SELECT id FROM siswa WHERE id = ?';
    
    db.query(checkQuery, [id], (err, existing) => {
        if (err) {
            console.error('Error checking existing siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal memeriksa data siswa',
                error: err.message
            });
        }
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }
        
        const updateQuery = 'UPDATE siswa SET nama = ?, asal_sekolah = ?, jurusan = ?, hobby = ?, updated_at = NOW() WHERE id = ?';
        
        db.query(updateQuery, [nama, asal_sekolah, jurusan || null, hobby || null, id], (err, result) => {
            if (err) {
                console.error('Error updating siswa:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Gagal mengupdate siswa',
                    error: err.message
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Siswa berhasil diupdate',
                data: {
                    id: parseInt(id),
                    nama,
                    asal_sekolah,
                    jurusan,
                    hobby
                }
            });
        });
    });
});

// 7. Delete student (bonus CRUD Delete)
app.delete('/api/siswa/:id', (req, res) => {
    const { id } = req.params;
    
    // Check if student exists first
    const checkQuery = 'SELECT * FROM siswa WHERE id = ?';
    
    db.query(checkQuery, [id], (err, existing) => {
        if (err) {
            console.error('Error checking existing siswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Gagal memeriksa data siswa',
                error: err.message
            });
        }
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }
        
        const deleteQuery = 'DELETE FROM siswa WHERE id = ?';
        
        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting siswa:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Gagal menghapus siswa',
                    error: err.message
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Siswa berhasil dihapus',
                data: existing[0]
            });
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan'
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});