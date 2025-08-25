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
// CREATE USER
// =========================
router.post('/', (req, res) => {
    const { userdesc, username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!userdesc || !username || !pass) {
        return res.status(400).json({ success: false, message: 'userdesc, username, dan password wajib diisi' });
    }

    db.query('SELECT id FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
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

// =========================
// READ USERS
// =========================
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        res.status(200).json({ success: true, data: results });
    });
});

router.get('/username/:username', (req, res) => {
    const { username } = req.params;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, data: results[0] });
    });
});

router.get('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    db.query('SELECT * FROM users WHERE userdesc = ?', [userdesc], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, data: results[0] });
    });
});

router.get('/id/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, data: results[0] });
    });
});

// =========================
// UPDATE USER
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

router.put('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    const { username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username wajib diisi' });

    const { query, values } = buildUpdateQuery({ username, pass, cookie1, usertype, jenisuser, cabang }, "userdesc", userdesc);

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: 'User berhasil diupdate' });
    });
});

router.put('/username/:username', (req, res) => {
    const { username } = req.params;
    const { pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username wajib diisi' });

    const { query, values } = buildUpdateQuery(
        { pass, cookie1, usertype, jenisuser, cabang },
        "username",
        username
    );

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: 'User berhasil diupdate' });
    });
});

router.put('/id/:id', (req, res) => {
    const { id } = req.params;
    const { username, pass, cookie1, usertype, jenisuser, cabang } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username wajib diisi' });

    const { query, values } = buildUpdateQuery({ username, pass, cookie1, usertype, jenisuser, cabang }, "id", id);

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: 'User berhasil diupdate' });
    });
});

// =========================
// DELETE USER
// =========================
router.delete('/userdesc/:userdesc', (req, res) => {
    const { userdesc } = req.params;
    db.query('DELETE FROM users WHERE userdesc = ?', [userdesc], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `User dengan userdesc '${userdesc}' berhasil dihapus` });
    });
});

router.delete('/id/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `User dengan ID '${id}' berhasil dihapus` });
    });
});

router.delete('/username/:username', (req, res) => {
    const { username } = req.params;
    db.query('DELETE FROM users WHERE username = ?', [username], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `User dengan username '${username}' berhasil dihapus` });
    });
});


module.exports = router;
