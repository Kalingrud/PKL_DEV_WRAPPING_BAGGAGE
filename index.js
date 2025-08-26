const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const usersRoutes = require('./routes/users'); // Tetap siswa.js karena file route bernama siswa.js
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007; // Sesuai dengan port di screenshot

// Middleware untuk parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Ini penting untuk x-www-form-urlencoded

// CORS middleware (untuk testing di Postman)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Body:', req.body); // Debug untuk melihat body request
    next();
});

// Routes
app.use('/api/users', usersRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Users berjalan!',
        server_info: {
            name: 'Users API',
            version: '1.0.0',
            port: PORT,
            database: process.env.DB_NAME || 'devfuwiqhip_wrapping'
        },
        endpoints: {
            users: {
                'POST /api/users': 'Create new user (body: username, userdesc, pass, cookie1, usertype, jenisuser, cabang)',
                'POST /api/users/get-all': 'Get all users',
                'POST /api/users/get-by-id': 'Get user by ID (body: id)',
                'POST /api/users/get-by-userdesc': 'Get user by userdesc (body: userdesc)',
                'POST /api/users/get-by-username': 'Get user by username (body: username)',
                'POST /api/users/update-by-userdesc': 'Update user by userdesc',
                'POST /api/users/update-by-username': 'Update user by username',
                'POST /api/users/update-by-id': 'Update user by ID',
                'POST /api/users/delete-by-userdesc': 'Delete user by userdesc (body: userdesc)',
                'POST /api/users/delete-by-id': 'Delete user by ID (body: id)',
                'POST /api/users/delete-by-username': 'Delete user by username (body: username)',
                'POST /api/users/login': 'Login user (body: username, password)'
            },
            system: {
                'GET /': 'API documentation',
                'GET /health': 'Health check'
            }
        },
        note: 'Semua endpoint menggunakan POST method dengan x-www-form-urlencoded body'
    });
});

// Health check route
app.get('/health', (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: err.message,
                timestamp: new Date().toISOString()
            });
        } else {
            connection.release();
            res.status(200).json({
                success: true,
                message: 'API and Database are healthy',
                database: process.env.DB_NAME || 'devfuwiqhip_wrapping',
                server_uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan',
        requested_url: req.originalUrl,
        method: req.method,
        available_routes: [
            'GET /',
            'GET /health',
            'POST /api/users',
            'POST /api/users/get-all',
            'POST /api/users/get-by-id',
            'POST /api/users/get-by-userdesc',
            'POST /api/users/get-by-username',
            'POST /api/users/update-by-userdesc',
            'POST /api/users/update-by-username', 
            'POST /api/users/update-by-id',
            'POST /api/users/delete-by-userdesc',
            'POST /api/users/delete-by-id',
            'POST /api/users/delete-by-username',
            'POST /api/users/login'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('================================🚀');
    console.log(` Server berjalan di http://localhost:${PORT}`);
    console.log(` API Documentation: http://localhost:${PORT}/`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(`  Database: ${process.env.DB_NAME || 'devfuwiqhip_wrapping'}`);
    console.log(' Note: Semua API endpoint menggunakan POST method');
    console.log('================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});