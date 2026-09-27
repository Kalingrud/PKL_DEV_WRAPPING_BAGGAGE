// Kill koneksi MySQL yang idle terlalu lama
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'pkl_wrapping',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  connectTimeout: 10000
});

console.log('🧹 Cleaning up idle MySQL connections...\n');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connected!\n');
  
  // Get processlist
  connection.query('SHOW PROCESSLIST', (err, results) => {
    if (err) {
      console.error('Error:', err.message);
      connection.end();
      process.exit(1);
    }
    
    // Filter koneksi yang sleep > 60 detik dan user pkl_dev
    const idleConnections = results.filter(row => 
      row.Command === 'Sleep' && 
      row.Time > 60 && 
      row.User === 'pkl_dev' &&
      row.Id !== connection.threadId // Jangan kill koneksi kita sendiri
    );
    
    console.log(`Found ${idleConnections.length} idle connections (> 60s)\n`);
    
    if (idleConnections.length === 0) {
      console.log('✅ No idle connections to kill');
      connection.end();
      process.exit(0);
      return;
    }
    
    console.log('Will kill these connections:');
    idleConnections.forEach(row => {
      console.log(`- ID: ${row.Id}, Idle for: ${row.Time}s (${Math.floor(row.Time/60)} minutes)`);
    });
    
    console.log('\nKilling connections...');
    
    let killed = 0;
    let errors = 0;
    
    // Kill each connection
    idleConnections.forEach((row, index) => {
      connection.query(`KILL ${row.Id}`, (err) => {
        if (err) {
          console.log(`❌ Failed to kill ${row.Id}:`, err.message);
          errors++;
        } else {
          console.log(`✅ Killed connection ${row.Id}`);
          killed++;
        }
        
        // Check if done
        if (index === idleConnections.length - 1) {
          console.log(`\n📊 Summary:`);
          console.log(`   ✅ Killed: ${killed}`);
          console.log(`   ❌ Failed: ${errors}`);
          console.log(`\n🎉 Cleanup complete!`);
          
          connection.end();
          process.exit(0);
        }
      });
    });
  });
});

