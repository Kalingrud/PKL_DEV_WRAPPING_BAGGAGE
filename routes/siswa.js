const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE
router.post('/', (req, res) => {
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    const sql = "INSERT INTO siswa (nama, asal_sekolah, jurusan, hobby) VALUES (?, ?, ?, ?)";
    db.query(sql, [nama, asal_sekolah, jurusan, hobby], (err, result) => {
        if(err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Siswa berhasil ditambahkan", id: result.insertId });
    });
});

// READ ALL
router.get('/', (req, res) => {
    db.query("SELECT * FROM siswa", (err, results) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM siswa WHERE id = ?", [id], (err, results) => {
        if(err) return res.status(500).json({ error: err.message });
        if(results.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        res.json(results[0]);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nama, asal_sekolah, jurusan, hobby } = req.body;
    const sql = "UPDATE siswa SET nama=?, asal_sekolah=?, jurusan=?, hobby=? WHERE id=?";
    db.query(sql, [nama, asal_sekolah, jurusan, hobby, id], (err, result) => {
        if(err) return res.status(500).json({ error: err.message });
        if(result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        res.json({ message: "Siswa berhasil diupdate" });
    });
});

// DELETE
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM siswa WHERE id=?", [id], (err, result) => {
        if(err) return res.status(500).json({ error: err.message });
        if(result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        res.json({ message: "Siswa berhasil dihapus" });
    });
});

module.exports = router;
