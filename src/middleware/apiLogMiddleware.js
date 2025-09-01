const ApiLog = require('../models/ApiLog');
const { formatDateTime, formatDuration } = require('../utils/helpers');

// Middleware untuk logging semua API request
const apiLogMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const incomingTime = formatDateTime();
  
  // Simpan response body asli
  const originalSend = res.send;
  let responseBody = '';
  
  // Override res.send untuk menangkap response body
  res.send = function(body) {
    responseBody = body;
    originalSend.call(this, body);
  };
  
  // Catat log setelah response selesai
  res.on('finish', async () => {
    try {
      const endTime = Date.now();
      const duration = formatDuration(startTime, endTime);
      const outgoingTime = formatDateTime();
      
      // Data untuk logging
      const logData = {
        incoming: incomingTime,
        from_ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
        duration: duration,
        url_method: req.method,
        url_hit: req.originalUrl || req.url,
        url_full: `http://192.168.100.56:4999${req.originalUrl || req.url}`,
        req_post: req.method === 'POST' ? JSON.stringify(req.body) : null,
        req_get: req.method === 'GET' ? (Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '[]') : '[]',
        outgoing: outgoingTime,
        app_response: `[${res.statusCode}] ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`,
        geo_ip: '-',
        geo_long: req.headers['x-forwarded-for'] || req.geo?.longitude || '-',
        geo_lat: req.headers['x-forwarded-for'] || req.geo?.latitude || '-',
        geo_city: req.headers['x-forwarded-for'] || req.geo?.city || '-',
        agent_detect: req.get('User-Agent') || 'unknown'
      };
      
      // Insert ke database
      const logId = await ApiLog.create(logData);
      
      console.log(`📝 API Log tersimpan dengan ID: ${logId}`);
      console.log(`⏰ Incoming: ${logData.incoming} | Outgoing: ${logData.outgoing} | Duration: ${logData.duration}`);
      console.log(`🌐 ${logData.url_method} ${logData.url_hit} dari IP: ${logData.from_ip}`);
      
    } catch (error) {
      console.error('❌ Error saat menyimpan API log:', error);
    }
  });
  
  next();
};

module.exports = apiLogMiddleware;
