const express = require('express');
const ApiLog = require('../models/ApiLog');
const router = express.Router();

// Get recent logs
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const logs = await ApiLog.getRecentLogs(limit);
    
    res.json({
      success: true,
      message: 'Logs berhasil diambil',
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('❌ Error getting logs:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// Get logs by filter
router.get('/filter', async (req, res) => {
  try {
    const filters = req.query;
    const logs = await ApiLog.getLogsByFilter(filters);
    
    res.json({
      success: true,
      message: 'Logs berhasil difilter',
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('❌ Error filtering logs:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// Test connection
router.get('/test', async (req, res) => {
  try {
    const connectionOK = await ApiLog.testConnection();
    
    res.json({
      success: true,
      message: 'Connection test berhasil',
      connection_status: connectionOK ? 'OK' : 'FAILED'
    });
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message,
      connection_status: 'FAILED'
    });
  }
});

module.exports = router;
