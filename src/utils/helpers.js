// Helper functions untuk aplikasi

// Format waktu yang benar (YYYY-MM-DD HH:mm:ss)
const formatDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
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

// Format duration dengan 2 desimal
const formatDuration = (startTime, endTime) => {
  const durationMs = endTime - startTime;
  return `${durationMs.toFixed(2)} ms`;
};

module.exports = {
  formatDateTime,
  getLocalIPAddress,
  formatDuration
};
