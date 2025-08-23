const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Create new student
router.post('/', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    
    // Validation
    if (!nama || !asal_sekolah) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nama dan asal_sekolah wajib diisi' 
        });
    }

    // Validate nama length
    if (nama.length < 2 || nama.length > 100) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nama harus antara 2-100 karakter' 
        });
    }
    
    const query = 'INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    
    db.query(query, [nama, asal_sekolah, jurusan || null, hobby || null], (err, result) => {
        if (err) {
            console.error('Database error:', err);
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
                jurusan: jurusan || null, 
                hobby: hobby || null,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    });
});

// 2. Get all students with pagination and search
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const jurusan = req.query.jurusan || '';
    
    const offset = (page - 1) * limit;
    
    // Build query with search and filter
    let query = 'SELECT * FROM siswa WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM siswa WHERE 1=1';
    const queryParams = [];
    const countParams = [];
    
    if (search) {
        query += ' AND (nama LIKE ? OR asal_sekolah LIKE ? OR hobby LIKE ?)';
        countQuery += ' AND (nama LIKE ? OR asal_sekolah LIKE ? OR hobby LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam, searchParam);
        countParams.push(searchParam, searchParam, searchParam);
    }
    
    if (jurusan) {
        query += ' AND jurusan = ?';
        countQuery += ' AND jurusan = ?';
        queryParams.push(jurusan);
        countParams.push(jurusan);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Get total count first
    db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data siswa', 
                error: err.message 
            });
        }
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        // Get actual data
        db.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Database error:', err);
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
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            });
        });
    });
});

// 3. Get student by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID siswa tidak valid' 
        });
    }
    
    db.query('SELECT * FROM siswa WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
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

// 4. Update student
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID siswa tidak valid' 
        });
    }
    
    // Validation
    if (!nama || !asal_sekolah) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nama dan asal_sekolah wajib diisi' 
        });
    }

    // Validate nama length
    if (nama.length < 2 || nama.length > 100) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nama harus antara 2-100 karakter' 
        });
    }
    
    // Check if student exists first
    db.query('SELECT * FROM siswa WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengupdate siswa', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Siswa tidak ditemukan' 
            });
        }
        
        const updateQuery = 'UPDATE siswa SET nama = ?, asal_sekolah = ?, jurusan = ?, hobby = ?, updated_at = NOW() WHERE id = ?';
        db.query(updateQuery, [nama, asal_sekolah, jurusan || null, hobby || null, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
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
                    jurusan: jurusan || null, 
                    hobby: hobby || null,
                    updated_at: new Date()
                } 
            });
        });
    });
});

// 5. Delete student
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID siswa tidak valid' 
        });
    }
    
    // Check if student exists first
    db.query('SELECT * FROM siswa WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus siswa', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Siswa tidak ditemukan' 
            });
        }
        
        const studentData = results[0];
        
        db.query('DELETE FROM siswa WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gagal menghapus siswa', 
                    error: err.message 
                });
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'Siswa berhasil dihapus',
                deleted_data: {
                    id: studentData.id,
                    nama: studentData.nama
                }
            });
        });
    });
});

// 6. BONUS: Get students count by jurusan (Statistics)
router.get('/stats/jurusan', (req, res) => {
    const query = `
        SELECT 
            jurusan, 
            COUNT(*) as total_siswa 
        FROM siswa 
        WHERE jurusan IS NOT NULL 
        GROUP BY jurusan 
        ORDER BY total_siswa DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil statistik jurusan', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Statistik jurusan berhasil diambil',
            data: results
        });
    });
});

// 7. BONUS: Bulk delete students
router.post('/bulk-delete', (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Array IDs siswa diperlukan' 
        });
    }
    
    // Validate all IDs are numbers
    const validIds = ids.filter(id => !isNaN(id) && id > 0);
    if (validIds.length !== ids.length) {
        return res.status(400).json({ 
            success: false, 
            message: 'Semua ID harus berupa angka yang valid' 
        });
    }
    
    const placeholders = validIds.map(() => '?').join(',');
    const query = `DELETE FROM siswa WHERE id IN (${placeholders})`;
    
    db.query(query, validIds, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus siswa', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `${result.affectedRows} siswa berhasil dihapus`,
            deleted_count: result.affectedRows,
            requested_ids: ids
        });
    });
});

module.exports = router;