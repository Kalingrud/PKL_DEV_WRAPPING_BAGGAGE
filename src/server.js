const app = require('./app');
const { getLocalIPAddress } = require('./utils/helpers');

const PORT = process.env.PORT || 4999;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIPs = getLocalIPAddress();
  
  console.log('Server started on port', PORT);
  console.log('Access: http://localhost:' + PORT);
});
