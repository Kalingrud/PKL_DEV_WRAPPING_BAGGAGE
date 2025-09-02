const ApiLog = require('../models/ApiLog');
const { formatDateTime, formatDuration } = require('../utils/helpers');

// Middleware untuk logging semua API request
const apiLogMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const incomingTime = formatDateTime();
  
  // Simpan response body asli
  const originalSend = res.send;
  let responseBody = '';
  
  // Helper: normalisasi headers agar mirip format di README (HTTP_*, UPPERCASE)
  const normalizeHeadersForAgentDetect = (headers) => {
    const result = {};
    try {
      Object.entries(headers || {}).forEach(([key, value]) => {
        const upperKey = String(key).replace(/-/g, '_').toUpperCase();
        result[`HTTP_${upperKey}`] = value;
      });
    } catch (_) {}
    return result;
  };
  
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
      
      // Data header untuk agent_detect
      const agentHeaders = normalizeHeadersForAgentDetect(req.headers);
      
      // Tambahkan info server dan request (tanpa prefix HTTP_) agar mirip contoh README
      const serverAddr = req.socket?.localAddress || req.connection?.localAddress || '-';
      const serverPort = req.socket?.localPort || req.connection?.localPort || '-';
      const remoteAddr = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '-';
      const remotePort = req.socket?.remotePort || req.connection?.remotePort || '-';
      const serverName = (req.hostname || req.get('host') || '').toString();
      const serverProtocol = (req.protocol || 'http') + '/' + (req.httpVersion || '1.1');
      const requestScheme = req.protocol || 'http';
      const requestTime = Math.floor(Date.now() / 1000);
      const requestTimeFloat = Date.now() / 1000;
      const requestUri = req.originalUrl || req.url || '/';
      const scriptName = requestUri;
      
      const serverSignature = `<address>Node/${process.versions.node} (Express) Server at ${serverName || serverAddr} Port ${serverPort}</address>`;
      const serverSoftware = `Node/${process.versions.node} Express`;
      
      const extras = {
        SERVER_SIGNATURE: serverSignature,
        SERVER_SOFTWARE: serverSoftware,
        SERVER_NAME: serverName,
        SERVER_ADDR: serverAddr,
        SERVER_PORT: String(serverPort),
        REMOTE_ADDR: remoteAddr,
        REMOTE_PORT: String(remotePort),
        REQUEST_SCHEME: requestScheme,
        SERVER_PROTOCOL: serverProtocol,
        REQUEST_METHOD: req.method,
        QUERY_STRING: req.url?.split('?')[1] || '',
        REQUEST_URI: requestUri,
        SCRIPT_NAME: scriptName,
        PHP_SELF: scriptName, // kompatibilitas dengan contoh
        REQUEST_TIME_FLOAT: requestTimeFloat,
        REQUEST_TIME: requestTime
      };
      
      const agentDetectObject = { ...agentHeaders, ...extras };
      
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
        agent_detect: JSON.stringify(agentDetectObject)
      };
      
      // Insert ke database
      const logId = await ApiLog.create(logData);
      
      console.log(`Log saved: ${logId}`);
      console.log(`${logData.url_method} ${logData.url_hit} - ${logData.duration}`);
      
    } catch (error) {
      console.error('Error saving log:', error.message);
    }
  });
  
  next();
};

module.exports = apiLogMiddleware;
