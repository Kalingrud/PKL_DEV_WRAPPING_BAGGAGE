const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Function to hash password using SHA256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Create new user
router.post('/', (req, res) => {
    const { username, userdesc, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    
    // Validation
    if (!username || !pass) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username dan password wajib diisi' 
        });
    }

    // Validate username length
    if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username harus antara 3-50 karakter' 
        });
    }

    // Check if username already exists
    db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal memeriksa username', 
                error: err.message 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username sudah digunakan' 
            });
        }

        // Hash password
        const hashedPassword = hashPassword(pass);
        
        const query = 'INSERT INTO users (username, userdesc, pass, cookie1, usertype, jenisuser, cabang) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(query, [
            username, 
            userdesc || null, 
            hashedPassword, 
            cookie1 || null, 
            usertype || 0, 
            jenisuser || 0, 
            cabang || 0
        ], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gagal menambahkan user', 
                    error: err.message 
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'User berhasil ditambahkan',
                data: { 
                    id: result.insertId, 
                    username, 
                    userdesc: userdesc || null, 
                    usertype: usertype || 0, 
                    jenisuser: jenisuser || 0,
                    cabang: cabang || 0
                }
            });
        });
    });
});

// 2. Get all users with pagination and search
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const usertype = req.query.usertype || '';
    
    const offset = (page - 1) * limit;
    
    // Build query with search and filter
    let query = 'SELECT id, username, userdesc, cookie1, usertype, jenisuser, cabang FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const queryParams = [];
    const countParams = [];
    
    if (search) {
        query += ' AND (username LIKE ? OR userdesc LIKE ?)';
        countQuery += ' AND (username LIKE ? OR userdesc LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
    }
    
    if (usertype !== '') {
        query += ' AND usertype = ?';
        countQuery += ' AND usertype = ?';
        queryParams.push(parseInt(usertype));
        countParams.push(parseInt(usertype));
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Get total count first
    db.query(countQuery, countParams, (err, countResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data user', 
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
                    message: 'Gagal mengambil data user', 
                    error: err.message 
                });
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'Data user berhasil diambil', 
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


router.get('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    
    // Validate userdesc
    if (!userdesc || userdesc.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            message: 'Userdesc tidak valid atau kosong' 
        });
    }
    
    db.query('SELECT id, username, userdesc, cookie1, usertype, jenisuser, cabang FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data user', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User dengan userdesc tersebut tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Data user berhasil diambil',
            data: results[0] 
        });
    });
});

// 4. Get user by username - ROUTE BARU
router.get('/username/:username', (req, res) => {
    const { username } = req.params;
    
    // Validate username
    if (!username || username.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            message: 'Username tidak valid atau kosong' 
        });
    }
    
    db.query('SELECT id, username, userdesc, cookie1, usertype, jenisuser, cabang FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data user', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User dengan username tersebut tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Data user berhasil diambil',
            data: results[0] 
        });
    });
});



// 3. Get user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID user tidak valid' 
        });
    }
    
    db.query('SELECT id, username, userdesc, cookie1, usertype, jenisuser, cabang FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil data user', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Data user berhasil diambil',
            data: results[0] 
        });
    });
});

// 4. Update user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { username, userdesc, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID user tidak valid' 
        });
    }
    
    // Validation
    if (!username) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username wajib diisi' 
        });
    }

    // Validate username length
    if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username harus antara 3-50 karakter' 
        });
    }
    
    // Check if user exists first
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengupdate user', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Check if username already exists (except current user)
        db.query('SELECT username FROM users WHERE username = ? AND id != ?', [username, id], (err, usernameResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gagal memeriksa username', 
                    error: err.message 
                });
            }

            if (usernameResults.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username sudah digunakan' 
                });
            }

            // Prepare update query
            let updateQuery;
            let updateParams;

            if (pass) {
                // Update with new password
                const hashedPassword = hashPassword(pass);
                updateQuery = 'UPDATE users SET username = ?, userdesc = ?, pass = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? WHERE id = ?';
                updateParams = [username, userdesc || null, hashedPassword, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, id];
            } else {
                // Update without changing password
                updateQuery = 'UPDATE users SET username = ?, userdesc = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? WHERE id = ?';
                updateParams = [username, userdesc || null, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, id];
            }

            db.query(updateQuery, updateParams, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Gagal mengupdate user', 
                        error: err.message 
                    });
                }
                
                res.status(200).json({ 
                    success: true, 
                    message: 'User berhasil diupdate', 
                    data: { 
                        id: parseInt(id), 
                        username, 
                        userdesc: userdesc || null, 
                        usertype: usertype || 0, 
                        jenisuser: jenisuser || 0,
                        cabang: cabang || 0
                    } 
                });
            });
        });
    });
});

// 5. Delete user
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID user tidak valid' 
        });
    }
    
    // Check if user exists first
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus user', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        const userData = results[0];
        
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Gagal menghapus user', 
                    error: err.message 
                });
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'User berhasil dihapus',
                deleted_data: {
                    id: userData.id,
                    username: userData.username
                }
            });
        });
    });
});

// 6. Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username dan password wajib diisi' 
        });
    }

    const hashedPassword = hashPassword(password);
    
    db.query('SELECT id, username, userdesc, usertype, jenisuser, cabang FROM users WHERE username = ? AND pass = ?', 
    [username, hashedPassword], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal melakukan login', 
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Login berhasil',
            data: results[0]
        });
    });
});

// 7. BONUS: Get users count by usertype (Statistics)
router.get('/stats/usertype', (req, res) => {
    const query = `
        SELECT 
            usertype, 
            COUNT(*) as total_users 
        FROM users 
        GROUP BY usertype 
        ORDER BY total_users DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil statistik usertype', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Statistik usertype berhasil diambil',
            data: results
        });
    });
});

// 8. BONUS: Bulk delete users
router.post('/bulk-delete', (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Array IDs user diperlukan' 
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
    const query = `DELETE FROM users WHERE id IN (${placeholders})`;
    
    db.query(query, validIds, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus users', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `${result.affectedRows} users berhasil dihapus`,
            deleted_count: result.affectedRows,
            requested_ids: ids
        });
    });
});

module.exports = router;