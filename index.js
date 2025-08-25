const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const usersRoutes = require('./routes/siswa'); // GANTI dari siswa.js ke users.js
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007; // Sesuai dengan port di screenshot

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
                'GET /api/users': 'Get all users with pagination (query: page, limit, search, usertype)',
                'GET /api/users/:id': 'Get user by ID',
                'GET /api/users/userdesc/:userdesc': 'Get user by userdesc',
                'GET /api/users/username/:username': 'Get user by username',
                'GET /api/users/userdesc/:userdesc': 'Get user by userdesc',
                'GET /api/users/username/:username': 'Get user by username',
                'POST /api/users': 'Create new user (body: username, userdesc, pass, cookie1, usertype, jenisuser, cabang)',
                'PUT /api/users/:id': 'Update user by ID',
                'DELETE /api/users/:id': 'Delete user by ID',
                'POST /api/users/login': 'Login user (body: username, password)',
                'GET /api/users/stats/usertype': 'Get users statistics by usertype',
                'POST /api/users/bulk-delete': 'Bulk delete users (body: {ids: [1,2,3]})'
            },
            system: {
                'GET /': 'API documentation',
                'GET /health': 'Health check'
            }
        }
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
            'GET /api/users',
            'POST /api/users',
            'GET /api/users/:id',
            'GET /api/users/userdesc/:userdesc',
            'GET /api/users/username/:username',
            'GET /api/users/userdesc/:userdesc',
            'GET /api/users/username/:username',
            'PUT /api/users/:id',
            'DELETE /api/users/:id',
            'POST /api/users/login',
            'GET /api/users/stats/usertype',
            'POST /api/users/bulk-delete'
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