const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Create new student
router.post('/', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;

    if (!nama || !asal_sekolah) {
        return res.status(400).json({ success: false, message: 'Nama dan asal_sekolah wajib diisi' });
    }

    const query = 'INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';

    db.query(query, [nama, asal_sekolah, jurusan || null, hobby || null], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menambahkan siswa', error: err.message });

        res.status(201).json({
            success: true,
            message: 'Siswa berhasil ditambahkan',
            data: { id: result.insertId, nama, asal_sekolah, jurusan, hobby }
        });
    });
});

// 2. Get all students
router.get('/', (req, res) => {
    const query = 'SELECT * FROM siswa ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengambil data siswa', error: err.message });

        res.status(200).json({ success: true, message: 'Data siswa berhasil diambil', data: results, count: results.length });
    });
});

// 3. Get student by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM siswa WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengambil data siswa', error: err.message });

        if (results.length === 0) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });

        res.status(200).json({ success: true, data: results[0] });
    });
});

// 4. Update student
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nama, asal_sekolah, jurusan, hobby } = req.body;

    if (!nama || !asal_sekolah) {
        return res.status(400).json({ success: false, message: 'Nama dan asal_sekolah wajib diisi' });
    }

    const updateQuery = 'UPDATE siswa SET nama = ?, asal_sekolah = ?, jurusan = ?, hobby = ?, updated_at = NOW() WHERE id = ?';
    db.query(updateQuery, [nama, asal_sekolah, jurusan || null, hobby || null, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal mengupdate siswa', error: err.message });

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });

        res.status(200).json({ success: true, message: 'Siswa berhasil diupdate', data: { id, nama, asal_sekolah, jurusan, hobby } });
    });
});

// 5. Delete student
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM siswa WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus siswa', error: err.message });

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });

        res.status(200).json({ success: true, message: 'Siswa berhasil dihapus' });
    });
});

module.exports = router;
