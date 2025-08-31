const app = require('./app');
const { getLocalIPAddress } = require('./utils/helpers');

const PORT = process.env.PORT || 4999;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIPs = getLocalIPAddress();
  
  console.log('');
  console.log('🚀 ===============================================');
  console.log('🔥 SERVER STARTED WITH CLEAN ARCHITECTURE!');
  console.log('🔥 Setiap request HARUS tercatat di api_log');
  console.log('===============================================');
  console.log('');
  console.log('🌐 ACCESS URLs:');
  console.log(`📍 Localhost: http://localhost:${PORT}`);
  console.log(`📍 Local Network: http://127.0.0.1:${PORT}`);
  
  if (localIPs.length > 0) {
    console.log('📍 Local IP Addresses:');
    localIPs.forEach(ip => {
      console.log(`   🔗 http://${ip}:${PORT}`);
    });
  }
  
  console.log('');
  console.log('🧪 TEST ENDPOINTS:');
  console.log(`1. GET  http://localhost:${PORT}/test/log`);
  console.log(`2. GET  http://localhost:${PORT}/test/unauthorized (Status 401)`);
  console.log(`3. POST http://localhost:${PORT}/test/unauthorized (Status 401)`);
  console.log('');
  console.log('👥 USER CRUD ENDPOINTS:');
  console.log(`1. POST http://localhost:${PORT}/users/create`);
  console.log(`2. GET  http://localhost:${PORT}/users/read`);
  console.log(`3. POST http://localhost:${PORT}/users/read`);
  console.log(`4. POST http://localhost:${PORT}/users/update`);
  console.log(`5. POST http://localhost:${PORT}/users/delete`);
  console.log(`6. POST http://localhost:${PORT}/users/login`);
  console.log('');
  console.log('📊 LOGGING ENDPOINTS:');
  console.log(`1. GET  http://localhost:${PORT}/api/logs/recent`);
  console.log(`2. GET  http://localhost:${PORT}/api/logs/filter`);
  console.log(`3. GET  http://localhost:${PORT}/api/logs/test`);
  console.log('');
  console.log('📊 YANG HARUS TERCATAT OTOMATIS:');
  console.log('✅ incoming: tanggal-bulan-tahun jam:menit:detik');
  console.log('✅ from_ip: IP address user');
  console.log('✅ agent_detect: User-Agent string');
  console.log('✅ url_method: GET/POST/PUT/DELETE');
  console.log('✅ duration: waktu response dalam ms (format: X.XX ms)');
  console.log('✅ app_response: [status_code] isi response JSON');
  console.log('✅ geo fields: semua berisi "-"');
  console.log('===============================================');
});
