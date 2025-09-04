// Helper functions untuk aplikasi

// Format waktu yang benar (YYYY-MM-DD HH:mm:ss)
const formatDateTime = () => {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = String(now.getMonth() + 1).padStart(2, '0');
  const day         = String(now.getDate()).padStart(2, '0');
  const hours       = String(now.getHours()).padStart(2, '0');
  const minutes     = String(now.getMinutes()).padStart(2, '0');
  const seconds     = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Get local IP address
const getLocalIPAddress = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  return results;
};

// Format duration dengan angka desimal (dalam detik)
const formatDuration = (startTime, endTime) => {
  const durationMs = endTime - startTime;
  const durationSeconds = durationMs / 1000;
  return durationSeconds.toFixed(4); // 4 desimal untuk presisi yang cukup
};

// Mapping HTTP status code ke message
const getHttpStatusMessage = (code) => {
  const statusMessages = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusMessages[code] || 'Unknown';
};

// Helper function untuk response sukses (menggunakan HTTP status message)
const successResponse = (message, data = null, additionalFields = {}) => {
  const response = {
    code: 200,
    message: getHttpStatusMessage(200), // "OK" dari HTTP status
    data: data ? [data] : []
  };

  // Tambahkan field tambahan jika ada
  Object.keys(additionalFields).forEach(key => {
    response[key] = additionalFields[key];
  });

  return response;
};

// Helper function untuk response error (menggunakan message dari aplikasi)
const errorResponse = (code, appMessage, data = null, additionalFields = {}) => {
  const response = {
    code: code,
    message: appMessage, // Message dari aplikasi
    data: data ? [data] : []
  };

  // Tambahkan field tambahan jika ada
  Object.keys(additionalFields).forEach(key => {
    response[key] = additionalFields[key];
  });

  return response;
};

module.exports = {
  formatDateTime,
  getLocalIPAddress,
  formatDuration,
  getHttpStatusMessage,
  successResponse,
  errorResponse
};
