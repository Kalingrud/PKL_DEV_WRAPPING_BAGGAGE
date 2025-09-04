const ApiLog = require('../models/ApiLog');   //import model apilog dari folder models
const { formatDateTime, formatDuration } = require('../utils/helpers');   //import helper formatDateTime dari folder utils

// Middleware untuk logging semua API request
const apiLogMiddleware = (req, res, next) => {  //mendefinisikan middleware untuk logging semua request API, 
//req → objek request dari client (isi body, params, headers, dll).
//res → objek response yang akan dikirim balik ke client.
//next → fungsi untuk melanjutkan request ke middleware berikutnya atau ke route handler.//

  const startTime           = Date.now();   //mencatat waktu mulai request dalam milidetik
  const incomingTime        = formatDateTime();  //mendapatkan waktu saat request masuk dalam format YYY-MM-DD HH:MM:SS
  //Date.now() → menghasilkan timestamp dalam milidetik (ms).	
  //startTime akan dipakai nanti untuk menghitung berapa lama durasi proses request.
  // Simpan response body asli

  const originalSend    = res.send;  //menyimpan fungsi asli res.send ke dalam variable originalSend, supaya nanti bisa dipanggil lagi setelah selesai override.
  //fungsi res.send adalah fungsi bawaan express untuk mengirim response ke client.
  // override adalah mengganti fungsi asli dengan fungsi baru yang kita buat sendiri.
  let responseBody      = '';        //buat variable kosong untuk menampung body response yang akan dikirim ke client
  
  
  const normalizeHeadersForAgentDetect = (headers) => {    //mendefinisikan fungsi bernama normalizeHeadersForAgentDetect dengan parameter headers
    //tujuannya mengubah format header request agar cocok dipakai untuk deteksi agent (user parsing)
    
    const result = {}; //buat objek kosong result yang nanti akan diisi header yang sudah dinormalisasi
    try {    //memulai blok try catch untuk menangani eror saat mengakses headers
      Object.entries(headers || {}).forEach(([key, value]) => {   //adalah mengubah objek headers menjadi array pasangan
        // [key, value] setiap pasangan header 
        //apa itu header? header adalah informasi tambahan yang dikirim bersama request HTTP, misalnya user-agent, content-type, dll.
        const upperKey = String(key).replace(/-/g, '_').toUpperCase(); //adalah mengubah nama header menjadi format yang diinginkan
        result[`HTTP_${upperKey}`] = value;   //menambahkan properti baru ke objek result dengan nama HTTP_<NAMA_HEADER>
      });
    } catch (_) {} //jika ada eror saat mengakses header, blok catch akan menangkapnya dan mengabaikannya (tidak terjadi eror)
    //kenapa begitu? supaya proses logging tetap jalan walaupun ada masalah pada header.
    return result;  //fungsi nya adalah mengambil objek headers, mengubah format nama header, dan mengembalikan objek baru dengan header yang sudah dinormalisasi.
  };
  
  // Override res.send untuk menangkap response body
  res.send = function(body) {   //mendefiniskan ulang method res.send dengan fungsi baru, parameter body adalah isi response yang akan dikirim ke client
    responseBody = body;        //simpan isi body response ke variable responseBody yang sudah didefinisikan diatas
    originalSend.call(this, body);  //panggil kembali fungsi asli res.send (yang sebelumnya disimpan divariable originalSend) 
    //.call(this, body) memastikan konteks this tetap sama dengan objek res, supaya exxpres tetap bekerja normal.
  };
  
  // Catat log setelah response selesai
  res.on('finish', async () => {   //pasang event listener ke objek res, finish akan otomatis terpanggil saat response sudah selesai dikirim ke client
    try { //memulai blok try catch untuk menangani eror saat menyimpan log
      const endTime           = Date.now();                          //ambil waktu sekarang dalam milidetik, ini menandai waktu selesai request
      const duration          = formatDuration(startTime, endTime);  //htiung lama durasi proses request dalam detik dengan 4 angka desimal
      //startTime → waktu saat request masuk (sudah dicatat sebelumnya).
      //endTime → waktu response selesai.
      //formatDuration() → helper untuk ubah durasi (ms) jadi format yang lebih mudah dibaca, misalnya "123ms" atau "0.12s".
      const outgoingTime      = formatDateTime(); //simpan timestamp saat response selesai dikirim dalam format rapi (2023-10-01 14:30:00)
      //formatDateTime() adalah helper khusus untuk membuat string waktu sesuai kebutuhan logging
      // Data header untuk agent_detect
      const agentHeaders = normalizeHeadersForAgentDetect(req.headers); //ini adalah semua header HTTP yang dikirim client dibrowser/server
      
      // Tambahkan info server dan request (tanpa prefix HTTP_) 
      const serverAddr                  = req.socket?.localAddress || req.connection?.localAddress || '-';    //alamat ip server yang menerima request
      const serverPort                  = req.socket?.localPort || req.connection?.localPort || '-';          //port server yang menerima request
      const remoteAddr                  = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '-';    //alamat ip client yang mengirim request
      const remotePort                  = req.socket?.remotePort || req.connection?.remotePort || '-';        //port client yang mengirim request
      const serverName                  = (req.hostname || req.get('host') || '').toString();                 //hostname dari url request
      const serverProtocol              = (req.protocol || 'http') + '/' + (req.httpVersion || '1.1');
      const requestScheme               = req.protocol || 'http';
      const requestTime                 = Math.floor(Date.now() / 1000);
      const requestTimeFloat            = Date.now() / 1000;
      const requestUri                  = req.originalUrl || req.url || '/';
      const scriptName                  = requestUri;
      
      const serverSignature = `<address>Node/${process.versions.node} (Express) Server at ${serverName || serverAddr} Port ${serverPort}</address>`;
      const serverSoftware = `Node/${process.versions.node} Express`;
      
      const extras = {
        SERVER_SIGNATURE:           serverSignature,
        SERVER_SOFTWARE:            serverSoftware,
        SERVER_NAME:                serverName,
        SERVER_ADDR:                serverAddr,
        SERVER_PORT:                String(serverPort),
        REMOTE_ADDR:                remoteAddr,
        REMOTE_PORT:                String(remotePort),
        REQUEST_SCHEME:             requestScheme,
        SERVER_PROTOCOL:            serverProtocol,
        REQUEST_METHOD:             req.method,
        QUERY_STRING:               req.url?.split('?')[1] || '',
        REQUEST_URI:                requestUri,
        SCRIPT_NAME:                scriptName,
        PHP_SELF:                   scriptName, // kompatibilitas dengan contoh
        REQUEST_TIME_FLOAT:         requestTimeFloat,
        REQUEST_TIME:               requestTime
      };
      
      const agentDetectObject = { ...agentHeaders, ...extras };
      
      // Data untuk logging
      const logData = {
        incoming:                   incomingTime,
        from_ip:                    req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
        duration:                   duration,
        url_method:                 req.method,
        url_hit:                    req.originalUrl || req.url,
        url_full: `                 http://192.168.100.56:4999${req.originalUrl || req.url}`,
        req_post:                   req.method === 'POST' ? (Object.keys(req.body || {}).length > 0 ? JSON.stringify(req.body) : '[]') : null,
        req_get:                    (req.query && Object.keys(req.query).length > 0) ? JSON.stringify(req.query) : '[]',
        outgoing:                   outgoingTime,
        app_response:               typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
        geo_ip:                      '-',
        geo_long:                   req.headers['x-forwarded-for'] || req.geo?.longitude || '-',
        geo_lat:                    req.headers['x-forwarded-for'] || req.geo?.latitude || '-',
        geo_city:                   req.headers['x-forwarded-for'] || req.geo?.city || '-',
        agent_detect:               JSON.stringify(agentDetectObject)
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
