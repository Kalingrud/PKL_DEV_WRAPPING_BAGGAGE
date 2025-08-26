const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// =========================
// Utility: Hash password (SHA-256)
// =========================
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// =========================
// CREATE USER - POST METHOD
// =========================
router.post('/', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { userdesc, username, user, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    
    // Use 'user' if provided, otherwise use 'username'
    const finalUsername = user || username;

    if (!userdesc || !finalUsername || !pass) {
        return res.status(400).json({ 
            success: false, 
            message: 'userdesc, username, dan password wajib diisi' 
        });
    }

    // Check if userdesc already exists
    db.query('SELECT id FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
                error: err.message 
            });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Userdesc sudah digunakan' 
            });
        }

        const hashedPassword = hashPassword(pass);
        
        db.query(
            `INSERT INTO users (userdesc, username, pass, cookie1, usertype, jenisuser, cabang) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userdesc, finalUsername, hashedPassword, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0],
            (err, result) => {
                if (err) {
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
                        userdesc, 
                        username: finalUsername 
                    }
                });
            }
        );
    });
});

// =========================
// GET ALL USERS - POST METHOD
// =========================
router.post('/get-all', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: results 
        });
    });
});

// =========================
// GET USER BY USERNAME - POST METHOD
// =========================
router.post('/get-by-username', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { username, user } = req.body;
    const finalUsername = user || username;
    
    if (!finalUsername) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username wajib diisi' 
        });
    }

    db.query('SELECT * FROM users WHERE username = ?', [finalUsername], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
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
            data: results[0] 
        });
    });
});

// =========================
// GET USER BY USERDESC - POST METHOD
// =========================
router.post('/get-by-userdesc', (req, res) => {
    const { userdesc } = req.body;
    
    if (!userdesc) {
        return res.status(400).json({ 
            success: false, 
            message: 'Userdesc wajib diisi' 
        });
    }

    db.query('SELECT * FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
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
            data: results[0] 
        });
    });
});

// =========================
// GET USER BY ID - POST METHOD
// =========================
router.post('/get-by-id', (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID wajib diisi' 
        });
    }

    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
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
            data: results[0] 
        });
    });
});

// =========================
// UPDATE USER FUNCTIONS
// =========================
function buildUpdateQuery(fields, whereClause, whereValue) {
    const setClauses = [];
    const values = [];

    if (fields.username) {
        setClauses.push("username = ?");
        values.push(fields.username);
    }

    if (fields.pass) {
        setClauses.push("pass = ?");
        values.push(hashPassword(fields.pass));
    }

    if (fields.cookie1 !== undefined) {
        setClauses.push("cookie1 = ?");
        values.push(fields.cookie1 || null);
    }

    if (fields.usertype !== undefined) {
        setClauses.push("usertype = ?");
        values.push(fields.usertype || 0);
    }

    if (fields.jenisuser !== undefined) {
        setClauses.push("jenisuser = ?");
        values.push(fields.jenisuser || 0);
    }

    if (fields.cabang !== undefined) {
        setClauses.push("cabang = ?");
        values.push(fields.cabang || 0);
    }

    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE ${whereClause} = ?`;
    values.push(whereValue);

    return { query, values };
}

// =========================
// UPDATE USER BY USERDESC - POST METHOD
// =========================
router.post('/update-by-userdesc', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { userdesc, username, user, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    const finalUsername = user || username;

    if (!userdesc) {
        return res.status(400).json({ 
            success: false, 
            message: 'Userdesc wajib diisi' 
        });
    }

    if (!finalUsername && !pass && cookie1 === undefined && usertype === undefined && jenisuser === undefined && cabang === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Minimal satu field harus diisi untuk update' 
        });
    }

    const { query, values } = buildUpdateQuery(
        { username: finalUsername, pass, cookie1, usertype, jenisuser, cabang }, 
        "userdesc", 
        userdesc
    );

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengupdate user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User berhasil diupdate' 
        });
    });
});

// =========================
// UPDATE USER BY USERNAME - POST METHOD
// =========================
router.post('/update-by-username', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { username, user, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    const finalUsername = user || username;

    if (!finalUsername) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username wajib diisi' 
        });
    }

    if (!pass && cookie1 === undefined && usertype === undefined && jenisuser === undefined && cabang === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Minimal satu field harus diisi untuk update' 
        });
    }

    const { query, values } = buildUpdateQuery(
        { pass, cookie1, usertype, jenisuser, cabang },
        "username",
        finalUsername
    );

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengupdate user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User berhasil diupdate' 
        });
    });
});

// =========================
// UPDATE USER BY ID - POST METHOD
// =========================
router.post('/update-by-id', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { id, username, user, pass, cookie1, usertype, jenisuser, cabang } = req.body;
    const finalUsername = user || username;

    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID wajib diisi' 
        });
    }

    if (!finalUsername && !pass && cookie1 === undefined && usertype === undefined && jenisuser === undefined && cabang === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Minimal satu field harus diisi untuk update' 
        });
    }

    const { query, values } = buildUpdateQuery(
        { username: finalUsername, pass, cookie1, usertype, jenisuser, cabang }, 
        "id", 
        id
    );

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal mengupdate user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User berhasil diupdate' 
        });
    });
});

// =========================
// DELETE USER BY USERDESC - POST METHOD
// =========================
router.post('/delete-by-userdesc', (req, res) => {
    const { userdesc } = req.body;
    
    if (!userdesc) {
        return res.status(400).json({ 
            success: false, 
            message: 'Userdesc wajib diisi' 
        });
    }

    db.query('DELETE FROM users WHERE userdesc = ?', [userdesc], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `User dengan userdesc '${userdesc}' berhasil dihapus` 
        });
    });
});

// =========================
// DELETE USER BY ID - POST METHOD
// =========================
router.post('/delete-by-id', (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID wajib diisi' 
        });
    }

    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `User dengan ID '${id}' berhasil dihapus` 
        });
    });
});

// =========================
// DELETE USER BY USERNAME - POST METHOD
// =========================
router.post('/delete-by-username', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { username, user } = req.body;
    const finalUsername = user || username;
    
    if (!finalUsername) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username wajib diisi' 
        });
    }

    db.query('DELETE FROM users WHERE username = ?', [finalUsername], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Gagal menghapus user', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `User dengan username '${finalUsername}' berhasil dihapus` 
        });
    });
});

// =========================
// LOGIN USER - POST METHOD
// =========================
router.post('/login', (req, res) => {
    // Support both 'user' and 'username' parameter names
    const { username, user, password } = req.body;
    const finalUsername = user || username;

    if (!finalUsername || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username dan password wajib diisi' 
        });
    }

    const hashedPassword = hashPassword(password);

    db.query(
        'SELECT * FROM users WHERE username = ? AND pass = ?', 
        [finalUsername, hashedPassword], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error', 
                    error: err.message 
                });
            }

            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Username atau password salah' 
                });
            }

            const userData = results[0];
            // Jangan tampilkan password di response
            delete userData.pass;

            res.status(200).json({
                success: true,
                message: 'Login berhasil',
                data: userData
            });
        }
    );
});

module.exports = router;