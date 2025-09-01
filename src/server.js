const app = require('./app');
const { getLocalIPAddress } = require('./utils/helpers');

const PORT = process.env.PORT || 4999;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIPs = getLocalIPAddress();
  
  console.log('Server started on port', PORT);
  console.log('');
  console.log('Access URLs:');
  console.log(`Localhost: http://localhost:${PORT}`);
  console.log(`Local Network: http://127.0.0.1:${PORT}`);
  
  if (localIPs.length > 0) {
    localIPs.forEach(ip => {
      console.log(`Local IP: http://${ip}:${PORT}`);
    });
  }
  
  console.log('');
  console.log('User CRUD Endpoints:');
  console.log(`POST /users/create`);
  console.log(`GET  /users/read`);
  console.log(`POST /users/read`);
  console.log(`POST /users/update`);
  console.log(`POST /users/delete`);
});
