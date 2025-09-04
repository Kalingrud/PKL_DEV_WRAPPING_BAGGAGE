const express = require('express');
const cors = require('cors');
const { getLocalIPAddress } = require('./utils/helpers');

// Import middleware
const apiLogMiddleware = require('./middleware/apiLogMiddleware');

// Import routes
const userRoutes = require('./routes/userRoutes');
const apiLogRoutes = require('./routes/apiLogRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Set trust proxy untuk mendapatkan IP yang benar
app.set('trust proxy', true);

// Middleware untuk parsing data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip || 'unknown'}`);
  next();
});

// API Logging middleware
app.use(apiLogMiddleware);

// Routes
app.use('/users', userRoutes);
app.use('/api/logs', apiLogRoutes);

// Root endpoint
app.get('/', (req, res) => {
  const localIPs = getLocalIPAddress();
  const serverInfo = {
    message: '🔥 User Management API Server with AUTO LOGGING',
    version: '1.0.0',
    timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
    logging_status: '🔥 ACTIVE - Semua request tercatat otomatis di api_log',
    server_info: {
      port: process.env.PORT || 4999
    },
    endpoints: {
      users: {
        create:       'POST /users/create',
        read_get:     'GET /users/read',
        read_post:    'POST /users/read',
        update:       'POST /users/update',
        delete:       'POST /users/delete',
        login: '       POST /users/login'
      },
      logs: {
        recent:        'GET /api/logs/recent',
        filter:        'GET /api/logs/filter',
        test:          'GET /api/logs/test'
      }
    }
  };
  
  res.json({ code: 200, message: 'OK', data: serverInfo });
});

// Test endpoints
app.get('/test/log', (req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    data: [{
      success: true,
      message: '🔥 Test logging endpoint berhasil diakses!',
      info: 'Endpoint ini dibuat khusus untuk test apakah logging berjalan',
      timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
      should_be_logged: true,
      client_info: {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        method: req.method,
        path: req.path,
        query: req.query
      }
    }]
  });
});

app.get('/test/unauthorized', (req, res) => {
  res.status(401).json({
success: false,
message: 'Unauthorized access - Token tidak valid atau expired',
error_code: 'UNAUTHORIZED_ACCESS',
timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
required_auth: 'Bearer token atau API key'
  });
});

app.post('/test/unauthorized', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Unauthorized access - Invalid credentials',
    error_code: 'INVALID_CREDENTIALS',
    timestamp: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}),
    required_auth: 'Valid username dan password'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl || req.url
  });
});

module.exports = app;
