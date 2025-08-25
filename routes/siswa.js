const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Utility hash password (SHA-256)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/* =========================
   CREATE USER
========================= */
router.post('/', (req, res) => {
    const { userdesc, username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!userdesc || !username || !pass) {
        return res.status(400).json({ success: false, message: 'userdesc, username, dan password wajib diisi' });
    }

    // Cek apakah userdesc sudah ada
    db.query('SELECT * FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Userdesc sudah digunakan' });
        }

        const hashedPassword = hashPassword(pass);
        db.query(
            `INSERT INTO users (userdesc, username, pass, cookie1, usertype, jenisuser, cabang) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userdesc, username, hashedPassword, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0],
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: 'Gagal menambahkan user', error: err.message });
                res.status(201).json({
                    success: true,
                    message: 'User berhasil ditambahkan',
                    data: { id: result.insertId, userdesc, username }
                });
            }
        );
    });
});

/* =========================
   READ USERS
========================= */
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        res.status(200).json({ success: true, data: results });
    });
});

// Read by userdesc (letakkan duluan biar tidak bentrok)
router.get('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    db.query('SELECT * FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, data: results[0] });
    });
});

// Read by ID
router.get('/id/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, data: results[0] });
    });
});

/* =========================
   UPDATE USER
========================= */
// Update by userdesc (letakkan duluan biar tidak bentrok)
router.put('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    const { username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username wajib diisi' });

    db.query('SELECT * FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        let updateQuery, updateParams;

        if (pass) {
            const hashedPassword = hashPassword(pass);
            updateQuery = `UPDATE users 
                           SET username = ?, pass = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? 
                           WHERE userdesc = ?`;
            updateParams = [username, hashedPassword, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, userdesc];
        } else {
            updateQuery = `UPDATE users 
                           SET username = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? 
                           WHERE userdesc = ?`;
            updateParams = [username, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, userdesc];
        }

        db.query(updateQuery, updateParams, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: err.message });
            res.status(200).json({ success: true, message: 'User berhasil diupdate' });
        });
    });
});

// Update by ID
router.put('/id/:id', (req, res) => {
    const { id } = req.params;
    const { username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username wajib diisi' });

    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        let updateQuery, updateParams;

        if (pass) {
            const hashedPassword = hashPassword(pass);
            updateQuery = `UPDATE users 
                           SET username = ?, pass = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? 
                           WHERE id = ?`;
            updateParams = [username, hashedPassword, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, id];
        } else {
            updateQuery = `UPDATE users 
                           SET username = ?, cookie1 = ?, usertype = ?, jenisuser = ?, cabang = ? 
                           WHERE id = ?`;
            updateParams = [username, cookie1 || null, usertype || 0, jenisuser || 0, cabang || 0, id];
        }

        db.query(updateQuery, updateParams, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: err.message });
            res.status(200).json({ success: true, message: 'User berhasil diupdate' });
        });
    });
});

/* =========================
   DELETE USER
========================= */
// Delete by userdesc (letakkan duluan biar tidak bentrok)
router.delete('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    db.query('DELETE FROM users WHERE userdesc = ?', [userdesc], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `User dengan userdesc '${userdesc}' berhasil dihapus` });
    });
});

// Delete by ID
router.delete('/id/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `User dengan ID '${id}' berhasil dihapus` });
    });
});

module.exports = router;
