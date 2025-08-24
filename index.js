const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const siswaRoutes = require('./routes/siswa'); // semua CRUD siswa di sini
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// Routes
app.use('/api/siswa', siswaRoutes);

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Gagal koneksi ke database:", err.message);
    } else {
        console.log("Berhasil koneksi ke database MySQL");
        connection.release();
    }
});

// Basic routes for testing
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Siswa berjalan!',
        timestamp: new Date(),
        endpoints: [
            'GET /',
            'GET /test',
            'GET /api/siswa',
            'GET /api/siswa/test',
            'POST /api/siswa',
            'GET /api/siswa/:id',
            'PUT /api/siswa/:id',
            'DELETE /api/siswa/:id'
        ]
    });
});

// Simple test route
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server test berhasil!',
        server_time: new Date(),
        client_ip: req.ip,
        user_agent: req.get('User-Agent')
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
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
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan',
        requested: {
            method: req.method,
            url: req.url,
            timestamp: new Date()
        },
        available_routes: [
            'GET /',
            'GET /test',
            'GET /health',
            'GET /api/siswa',
            'POST /api/siswa',
            'GET /api/siswa/:id',
            'PUT /api/siswa/:id',
            'DELETE /api/siswa/:id'
        ]
    });
});

// ✅ PENTING: Bind ke 0.0.0.0 agar bisa diakses dari luar
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================`);
    console.log(`🚀 Server berjalan di:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log(`=================================`);
    console.log(`📅 Started at: ${new Date()}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});