const db = require('../config/database');  //import konfigurasi database dari folder config

class ApiLog {  //membuat kelas apilog untuk mengelola logging API
  
  static async create(logData) { //sederhana nya adalah method create untuk menambahkan log baru ke table api_log
    return new Promise((resolve, reject) => {     //membuat promise baru untuk oprasi database
      //apa itu promise? promise adalah cara untuk menangani oprasi asinkron di javascript
      //apa itu asinkron? asinkron adalah oprasi yang tidak langsung selesai, misalnya oprasi database.
      
      // Timeout mechanism untuk prevent hanging queries (30 detik untuk logging)
      const timeout = setTimeout(() => {
        reject(new Error('ApiLog query timeout after 30 seconds'));
      }, 30000); // 30 detik timeout (lebih lama karena logging non-critical)
      
      const insertQuery = `
        INSERT INTO api_log (
          incoming, from_ip, duration, url_method, url_hit, url_full,
          req_post, req_get, outgoing, app_response, geo_ip, geo_long, geo_lat, geo_city, agent_detect
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [        //buat array values yang isinya data dari logData yang akan dimasukan ke database
        logData.incoming,
        logData.from_ip,
        logData.duration,
        logData.url_method,
        logData.url_hit,
        logData.url_full,
        logData.req_post,
        logData.req_get,
        logData.outgoing,
        logData.app_response,
        logData.geo_ip,
        logData.geo_long,
        logData.geo_lat,
        logData.geo_city,
        logData.agent_detect
      ];
      
      db.query(insertQuery, values, (err, result) => {     //menjalankan query sql ke database menggunakan db.query
      //insertQuery = string query SQL yang tadi kita bikin (INSERT INTO api_log ...).
      //values = array data yang akan menggantikan tanda ? di query.
      //(err, result) => { ... } = callback yang dijalankan setelah query selesai.
        clearTimeout(timeout); // Clear timeout jika query selesai
        
        if (err) {  // memeriksa apakah ada eror saat menjalankan query
          reject(err);   //kalo ada eror, Promise akan dianggap gagal (rejected) dan eror nya diteruskan ke catch
        } else {   //kalo ga ada eror, promise dianggap berhasil(solved)
          resolve(result.insertId);  //mengembalikan id dari row yang baru dimasukan ke table api_log
        }
      });
    });
  }

  
  static async getRecentLogs(limit = 10) {    //method ini berfungsi untuk mengambil log terbaru dari table api_log
  //static → method ini milik kelas, bukan instance; dipanggil dengan NamaKelas.getRecentLogs(...).
  //async → method mengembalikan Promise dan bisa dipakai dengan await.
  //getRecentLogs → nama method, tujuan: mengambil log terbaru.
  //(limit = 10) → parameter limit punya nilai default 10 jika pemanggil tidak mengirim argumen. Ini menentukan berapa baris log yang diambil.
    
    return new Promise((resolve, reject) => {  //membuat promise baru untuk oprasi database   
  //resolve → dipanggil kalau query berhasil, untuk mengembalikan hasilnya.
  //reject → dipanggil kalau query gagal, untuk mengembalikan error.    

      const query = `
        SELECT * FROM api_log
        ORDER BY id DESC
        LIMIT ?
      `;
      
      db.query(query, [limit], (err, results) => {    //method untuk menjalankan sql query ke database mysql
        if (err) {  //memeriksa apakah ada eror saat menjalankan query
          reject(err);  //jika ada eror, promise akan dianggap gagal (rejected) dan eror nya diteruskan ke catch
        } else {       //kalo ga ada eror, promise dianggap berhasil(solved)
          resolve(results); //promise dianggap berhasil, hasil query dikembalikan ke pemanggil await ApiLog.
        }
      });
    });
  }

  // Get logs by filter
  static async getLogsByFilter(filters = {}) {   //
    //static → method milik kelas, dipanggil langsung lewat nama class (ApiLog.getLogsByFilter(...)) tanpa buat objek dulu.
    //async → method ini bisa dipanggil dengan await karena isinya akan mengembalikan Promise.
    //getLogsByFilter → nama method, fungsinya: ambil log dari tabel api_log dengan kondisi filter tertentu.
    //(filters = {}) → parameter filters berupa object, default-nya {} (kosong). Misalnya bisa berisi { username: "andi", ip: "127.0.0.1" }.
    
    return new Promise((resolve, reject) => {  //membuat dan mengembalikan promise baru untuk oprasi database
      //resolve dipanggil kalau query sukses → mengembalikan hasil.
      //reject dipanggil kalau query gagal → mengembalikan error.

      let query = 'SELECT * FROM api_log WHERE 1=1';  //inisialisasi variable query dengan string  SQL standar
      let params = [];                                //inisialisasi variable params (parameter) sebagai array kosong
      
      if (filters.from_ip) {  
      //Mengecek apakah object filters punya properti from_ip dan nilainya tidak kosong.
      //Artinya: hanya jika user memberi filter berdasarkan from_ip, maka kondisi tambahan akan dimasukkan ke query SQL.

        query += ' AND from_ip LIKE ?';       //menambahkan kondisi ke query SQL dasar. += artinya menempelkan string baru ke query, LIKE dipakai agar pencarian lebih fleksibel
        params.push(`%${filters.from_ip}%`);  //menambahkan nilai parameter ke array params. 
      }
      
      if (filters.url_method) {
        query += ' AND url_method = ?';
        params.push(filters.url_method);
      }
      
      if (filters.url_hit) {
        query += ' AND url_hit LIKE ?';
        params.push(`%${filters.url_hit}%`);
      }
      
      if (filters.date_from) {
        query += ' AND DATE(incoming) >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        query += ' AND DATE(incoming) <= ?';
        params.push(filters.date_to);
      }
      
      query += ' ORDER BY id DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Test database connection
  static async testConnection() {
    return new Promise((resolve) => {
      db.query('SELECT 1', (err) => {
        resolve(!err);
      });
    });
  }
}

module.exports = ApiLog;
