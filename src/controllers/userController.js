const User = require('../models/User'); //model yang berisi query mysql untuk CRUD TABLE USERS
const { createExtApiClient } = require('../utils/extApiClient');

const { validateRequiredFields, validateFieldSecurity, sanitizeInput } = require('../utils/security');
const Penjualan = require('../models/Penjualan');
const db = require('../config/database');
//ngecek field yang wajib diisi, ngecek apakah input tidak ada karakter berbahaya, bersihin input dari karakter berbahaya XXS.

class UserController { //controller yang berisi logika untuk CRUD TABLE USERS
  // Create user
  static async create(req, res) { //tujuan menambahkan user baru ke database
    try { //try catch untuk menangani error
      console.log('CREATE endpoint accessed'); //log untuk debugging
      const requiredFields = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang']; //daftar field yang wajib diisi kalau mau bikin user baru
      if (!validateRequiredFields(req, res, requiredFields)) { //kalo field wajib diisi ada yang kosong, hasil nya false, kalau false langsung return//
        return; //kalo false lgsung return, supaya proses berhenti dan tidak lanjut ke query database
      }
      
      let { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;  //kalo berhasil, ambil isi data yang dikirim orang yang tadi
      //lalu simpan di filed nya masing, ibarat ngisi formulir terus data nya disusun di masing masing kotak sesuai isi nya.
      
      // Sanitize input
      username = sanitizeInput(username); //buat bersihin karakter yang jahat, lalu hasil nya disimpen lagi ke variabel username
      userdesc = sanitizeInput(userdesc); // buat bersihin karakter yang jahat, lalu hasil nya disimpen lagi ke variable userdesc
      pass = sanitizeInput(pass); //buat bersihin karakter yang jahat, lalu hasilnya disimpen lagi ke variable pass
      
      // Check username exists
      const usernameExists = await User.checkUsernameExists(username); //buat periksa kalo ada username yang sama//
      if (usernameExists) { //kalo ketauan nama user nya udh kepake
        return res.status(400).json({ //kasih aja eror 400 bang gitu katanye
          code: 400,                        //http eror
          message: 'Username sudah digunakan',  //jangan lupa kasih tau, bagen bocah nya kaga bingung
          data: []  //kosong, karena kaga ada yang harus dikasih tau ke bocahan nya
        });
      }
      
      // Validate username pattern
      const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;  //intinye rules biar username aman lolos masuk ke database
      if (!usernamePattern.test(username)) { //bakal ngecek username, cocok kaga sama rules diatas, kalo ga cocok, berarti user invalid.
        return res.status(400).json({  //kalo udah ketauan kaga cocok, kasih http eror 400 (bad request)
          code: 400, //HTTP ERROR NYA yang disampein ke user
          message: 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)', //jangan lupa dikasih text bagen orang kaga bingung
          data: [] //kosoing bae, kaga ada yang perlu ditampilin juga
        });
      }
      
      // Create user
      const newUser = await User.create({ //kalo yang tadi semua nya udah cocok, dan udah enak buat dimasukin ke database, masukin dah ke database user.
        username, userdesc, pass, usertype, jenisuser, cabang //field yang di isi kalo udah bener semua yg diatas sono
      });
      
      res.status(200).json({ //kalo udah berhasil semua, jangan lupa kasih http eror 200
        code: 200, //http eror nya 200
        message: 'OK',  //text nya jangan lupa bagen ora bingung nanti orang.
        data: [newUser] //ngirim data user nya bentuk array, meski cuma 1 user  
      });
      
    } catch (error) {  //nangkep semua eror 
      console.error('Create error:', error.message);  //tulis eror ke console supaya orang tau kendala nya dimane
      res.status(500).json({    //kirimin http eror 500, artinye server lgi ora danta
        code: 500,  //code nye
        message: 'Terjadi kesalahan server',  //pesan nye bakal orang ora bingung
        data: []  //kosongin bae
      });
    }
  }

  // Read users
  static async read(req, res) { //bikin function read, buat membaca data dari database
    try { //coba jalanin endpoint nya, kalo server nya eror, pasti ditangkep sama catch yang tadi.
      console.log('READ endpoint accessed');    //kasih info dikonsol endpoint "read" dipanggil buat ngecek request masuk
      
      const params = req.method === 'GET' ? req.query : req.body; //ambil parameter request GET dari url req.query, sedangkan POST/PUT asalnye dari req/body
      
      // Validate input security
      for (const [key, value] of Object.entries(params || {})) {  //loop semua parameter yang dikirim client, key=nama parameter, value=nilai nya
        if (value && typeof value === 'string') { //bakal ngecek kalo parameter ada isinya dan tipe data nya string
          const sanitizedValue = sanitizeInput(value); //bersihin input dari karakter berbahaya
          if (sanitizedValue !== value) {  //kalo input berubah setelah dibershin, berarti ada karakter berbahaya
            return res.status(400).json({   //kasih http eror 400 bad request ke client kasih tau parameter yang bermasalah / data nya kosong
              code: 400, //code http eror nya
              message: `${key} tidak boleh mengandung karakter berbahaya`,  //pesan nya ketauan pake karakter bahaya
              data: [] //gada emang kosong
            });
          }
        }
      }
      
      // Get users with filters
      const users = await User.read(params);  //panggil fungsi read buat ambil data user dari database, 
      //params berisi filter, misal username=andi, supaya cuma ambil user tertentu.
      //await = tunggu sampe data kelar diambil
      
      // Check if any users found
      if (users.length === 0) {  //cek apakah array users kosong (tidak ada data)
        return res.status(404).json({  //kalo kosong kirim http eror 404
          code: 404,  //code nya 404
          message: 'Data tidak ditemukan',  //pesan nya data tidak ditemukan
          data: []  //kosongin karena ga ada data
        });
      }
      
      res.json({ //kirim response ke client dalam format json
        code: 200,  //kasih code http eror 200 kalo sukses
        message: 'OK',  //kasih messege simple aja bagen ora bingung
        data: users  //isinya field orang yang dicari
      });
      
    } catch (error) {   //tangkap semua eror
      console.error('Read error:', error.message);  //kasih console eror
      res.status(500).json({ //kirim response ke client dengan status 500, artinye kesalahan server
        code: 500,  //code nya 500
        message: 'Terjadi kesalahan server',  //jangan lupa kasih text bagen ora bingung
        data: []   //kosongin karena ga ketemu mau baca apaan emang nya, org server nya kendala
      }); 
    }
  }

  // Update user
  static async update(req, res) {  //bikin fungsi update buat ubah data user di database
    try {  //coba jalanin endpoint nya, kalo eror server, nanti di tangkep sama catch.
      console.log('UPDATE endpoint accessed'); //tulis di konsol log endpoint update dipanggil bos//
      
      const { id } = req.body;  //ambil parameter id dari body request
      if (!id) { //cek apakah id ada apa kosong. karena jika id kosong maka update ga bisa jalan.
        return res.status(400).json({ //kalo id kosong kirim http eror 400 bad request ke client.
          code: 400, //code nya
          message: 'Mohon isi id terlebih dahulu', //pesan nya bagen ora bingung
          data: []  //kosongin bae kan eror 
        });
      }
      
      if (!validateFieldSecurity(req, res)) {  //panggil fungsi untuk cek inputan update aman kaga, req=data request dari client 
      // res=untuk kirim respon eror kalo ora aman. 
        return; //kalo ketauan ora aman, hentikan fungsi sekarang, 
      }
      
      // BAKAL LOGIN
      const existingUsers = await User.read({ id }); //panggil user read buat ambil data berdasarkan id, await= tunggu sampai data diambil,
      //lalu hasil nya disimpen di existinguser
      if (existingUsers.length === 0) {  //cek apakah array existinguser kosong
        return res.status(404).json({ //kalo kosong kirimin http 404 bae gitu
          code: 404, //cdoe nya
          message: 'User tidak ditemukan',  //pesan eror nya data tidak ditemukan
          data: []  //hasil ny
        });
      }
        
      // bakal cek usernam unik kalo user mau update username.
      if (req.body.username) {  //cek apa user ngirim field username dibody requst
        const usernameExists = await User.checkUsernameExists(req.body.username, id);  //panggil fungsi usernameexist untuk cek username
        //nya udah dipake orang apa belom
        if (usernameExists) { //cek hasil nya, kalo true username udah dipake orang
          return res.status(400).json({ //kalo udah dipake orang, kirimin status 400
            code: 400, //400
            message: 'Username sudah digunakan',  //pesan nya username sudah digunakan
            data: []
          });
        }
      }
      
      // Update user
      const result = await User.update(id, req.body);  //menjalankan User.update() untuk mengupdate data user di database
      
      res.json({          //respon json
        code: 200,        //http eror code jika sukses kirimkan 200
        message: 'OK',   //pesan jika sukses
        data: [result]   //hasil update dimasukan ke dalam array
      });
      
    } catch (error) {    //eror handling pada saat, await User.update()
      console.error('Update error:', error.message);  //jika ada eror, eror nya akan dikirim ke consol dengan tulisan Update error
      res.status(500).json({   //jika eror kirimkan code http eror 500, terjadi kesalahan server
        code: 500,   //code nya
        message: 'Terjadi kesalahan server',        //pesan nya kesalahan server
        data: []         //kosong karena oprasi gagal
      });
    }
  }

  // Login user
  static async login(req, res) {  //mendefiniskan method statis login didalam class controler
    try {                         //mulai blok untuk menangkap eror yang terjadi
      console.log('🔥 LOGIN ENDPOINT DIAKSES');   //mencetak log diterminal saat endpoint dipanggil
      
      const { username, pass } = req.body;  //req.body untuk ambil input yang dikirim client
      
      // Validasi input
      if (!username || !pass) {    //kalo username tidak di isi dan password tidak diisi masuk ke blok ini
        return res.status(400).json({    //kembalikan respon http 400 bad request dan hentikan eksekusi fungsi (return)
          code: 400,                //kirimin respon 400 bad request
          message: 'Username dan password harus diisi',        //pesan eror nya dikasih liat
          data: []                                     //string kosong karena eksekusi gagal
        });
      }
      
      // Sanitize input        //keamanan input dari xss
      const sanitizedUsername = sanitizeInput(username);         //memanggil fungsi sanitizedInput untuk membersihkan username dari html berahaya
      const sanitizedPassword = sanitizeInput(pass);             //memanggil fungsi sanitizedInput untuk membersihkan password dari html berahaya
      
      // Cek apakah username ada di database
      const user = await User.getUserByUsername(sanitizedUsername);   //memanggil fungsi async User.getUsernameByUsername() untuk mengambil data user dari database
      
      if (!user) {             //mengecek apakah query tidak menemukan user
        return res.status(401).json({          //jika user tidak ditemukan langsunng kasih http eror 401
          code: 401,                            //code eror nya 401
          message: 'Username tidak ditemukan',   //pesan eror nya username tidak ditemukan
          data: []                                //string kosong karena oprasi tidak berhasil
        });
      }
      
      // Verifikasi password menggunakan bcrypt 
      const bcrypt = require('bcryptjs');          //mengimport library bcrypt.js
      const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.pass);    //membandingkan sanitizedPasword = password yang diketik user saat login
      //user.pass = password enkripsi yang disimpan didatabase
      
      if (!isPasswordValid) {          //ngecek apakah password salah
        return res.status(401).json({               //kalo salah kirimin eror 401 dan return = oprasi langsung terhenti
          code: 401,                      //code http eror nya
          message: 'Password salah',          //pesan nya password salah
          data: []               //string kosong karena oprasi gagal
        });
      }
      
      // Login berhasil - tampilkan data user (tanpa password) 
      const userData = {        //membuat objek baru bernamaa userData tujuannya agar, hanya field tertentu dari database user
        //yang di[ilih, semacam filter bukan langsung kirim semua objek user
        id: user.id,       //ambil id user dari database
        username: user.username,   //ambil username user
        userdesc: user.userdesc,   //ambil deskripsi user
        usertype: user.usertype,   //ambil tipe user
        jenisuser: user.jenisuser, //ambil jenis user
        cabang: user.cabang,          //ambil cabang
        cookie1: user.cookie1     //ambil cookie1 
      };
      
      // Panggil API eksternal dan otomatis catat ke extapi_log
      try {
        const http = createExtApiClient();
        const now = new Date();
        const trxCode = `LOGIN-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${user.username}`;
        const originIp = (req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '').toString();
        console.log('[extapi] calling GET https://api.restful-api.dev/objects with trx:', trxCode);
        await http.get('https://api.restful-api.dev/objects', {
          headers: {
            'x-trx-code': trxCode,
            'x-origin-ip': originIp
          }
        });
        console.log('[extapi] done');
      } catch (_) {
        // abaikan error eksternal agar tidak mengganggu proses login
        try { console.error('[extapi] error (ignored):', _.message); } catch(e) {}
      }

      return res.status(200).json({   //kasih status http 200 ok, jika berhasil
        code: 200,    //kasih code http eror 200
        message: 'OK',   //kasih pesan ok jika berhasil
        data: [userData],        //array yang berisi objek Userdata
        login_time: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})  //tambahin login_time untuk menampilkan waktu login user
        //format tanggal waktu dan regional
      });
      
    } catch (error) {     //menangkap eror apa pun saat login diproses
      console.error('❌ Login error:', error);   //tulis eror ke consol server, dengan prefix login eror.
      return res.status(500).json(errorResponse(500, 'Terjadi kesalahan server'));   //mengirim respon client dengan status http 500
      //internal server eror, 
    }
  }
  
  // Delete user
  static async delete(req, res) {   //mendefinisikan method statis delete didalam controler, req = objek request dari client berisi body params, res = objek response yang digunakan untuk kirim jawaban ke client
    try {     //awal dari blok try catch. semua eror saat proses delete akan ditangani di catch
      console.log('DELETE endpoint accessed');    //log ke console saat endpoint delete diakses client, 
      
      const { id, username } = req.body;   //ambil id dan username yang dikirim client dari req.body 
      
      // Bisa delete berdasarkan ID atau username      
      if (!id && !username) {                  //kondisi pengecekan id dan username di wajib di isi
        return res.status(400).json({        //return = langsung menghentikan fungsi jika id dan username tidak di isi,
          code: 400,                         //kasih code http eror 400
          message: 'Mohon isi id atau username terlebih dahulu',      //pesan nya yang dikirmkan ke console
          data: []            //string kosong karena oprasi gagal
        });
      }
      
      let identifier = id || username;      //membuat variable identifier untuk menyimpan nilai unik yang akan dipakai menghapus user.
      let searchField = id ? 'id' : 'username';   //membuat variable searchField untuk menentukan kolom mana yang dipakai query delet
      
      // Check if user exists
      let existingUsers;      //mendefinisikan variable existingUsers tanpa nilai awal
      if (searchField === 'id') {      //mengecek apakah pencarian user akan berdasarkan id
        //searchField sebelum nya sudah di isi id atau username
        existingUsers = await User.read({ id: identifier });  //memanggil method di model user untuk membaca data user berdasarkan id
      } else {
        existingUsers = await User.read({ username: identifier });  //memanggil method dimodel user untuk membaca data user berdasarkan username
      }
      
      if (existingUsers.length === 0) { //memeriksa apakah user dengan id atau username yang diberikan kosong (tidak ada didatabase)
        return res.status(404).json({ //kalo kosong kirim http eror 404 
          code: 404,  //code http eror nya
          message: `User dengan ${searchField} "${identifier}" tidak ditemukan`,  //kasih pesan user dengan searchfield id/username "identifier" tidak ditemukan
          data: [] //string kosong karena oprasi gagal
        });
      }
      
      // Delete user
      const result = await User.delete(identifier);  //memanggil method delete dari model user untuk menghapus user berdasarkan id atau username
      
      res.json({   //kirim response ke clien dalam format json
        code: 200,   //code http eror nya 200 jika sukses
        message: 'OK',   //pesan nya jika berhasil kirimkan ke user
        data: [result],   //hasil delete dimasukan ke dalam array
        deleted_user: existingUsers[0]  //menambahkan informasi tentang user yang dihapus, diambil dari existingUsers
      });
      
    } catch (error) {    //menangkap semua eror yang terjadi selama proses delete
      console.error('Delete error:', error.message);  //tulis eror ke console dengan informasi delete eror
      res.status(500).json({   //kirim response ke client dengan status http eror 500 
        code: 500,  //code nya 500
        message: 'Terjadi kesalahan server',   //pesan nya kesalahan server
        data: []    //string kosong karena oprasi gagal
      });
    }
  }
}

module.exports = UserController;

// Penjualan Iffat - Save Transaction (dengan validasi relasi)
UserController.penjualan_iffat = async (req, res) => {
  try {
    console.log('🔥 PENJUALAN_IFFAT (Save_Trx) endpoint accessed');

    const requiredFields = [
      'TrxType', 'Termcode', 'ShiftCode', 'LoginCode', 'EngineCode',
      'qty', 'QRCode', 'pack_type', 'payment_type', 'payment_reff',
      'parent_code', 'end_trx'
    ];
    if (!validateRequiredFields(req, res, requiredFields)) {
      return;
    }

    let {
      TrxType,
      Termcode,
      ShiftCode,
      LoginCode,
      EngineCode,
      qty,
      QRCode,
      pack_type,
      payment_type,
      payment_reff,
      parent_code,
      end_trx
    } = req.body;

    // Sanitize
    TrxType = sanitizeInput(TrxType);
    Termcode = sanitizeInput(Termcode);
    ShiftCode = sanitizeInput(ShiftCode);
    LoginCode = sanitizeInput(LoginCode);
    EngineCode = sanitizeInput(EngineCode);
    qty = sanitizeInput(qty);
    QRCode = sanitizeInput(QRCode);
    pack_type = sanitizeInput(pack_type);
    payment_type = sanitizeInput(payment_type);
    payment_reff = sanitizeInput(payment_reff);
    parent_code = sanitizeInput(parent_code);
    end_trx = sanitizeInput(end_trx);

    // Siapkan timestamp untuk response error (YYYY-MM-DD HH:mm:ss)
    const _errNow = new Date();
    const _ey = _errNow.getFullYear();
    const _em = String(_errNow.getMonth() + 1).padStart(2, '0');
    const _ed = String(_errNow.getDate()).padStart(2, '0');
    const _eh = String(_errNow.getHours()).padStart(2, '0');
    const _eM = String(_errNow.getMinutes()).padStart(2, '0');
    const _es = String(_errNow.getSeconds()).padStart(2, '0');
    const formattedErrorDateTime = `${_ey}-${_em}-${_ed} ${_eh}:${_eM}:${_es}`;

    // Validasi QRCode tidak boleh mengandung simbol khusus
    const symbolPattern = /[@#$%&*()+=\[\]{}|\\:";'<>?,./~`!]/;
    if (symbolPattern.test(QRCode)) {
      return res.status(400).json({
        code: "400",
        message: `tidak boleh mengandung simbol Tgl : ${formattedErrorDateTime}`,
        data: []
      });
    }

    // Validasi QRCode unik - cek apakah QRCode sudah pernah digunakan
    const qrCodeExists = await Penjualan.checkQRCodeExists(QRCode);
    if (qrCodeExists) {
      return res.status(400).json({
        code: "400",
        message: `transaksi kode sudah di gunakan Tgl : ${formattedErrorDateTime}`,
        data: []
      });
    }

    // Validasi parent_code berdasarkan end_trx
    // Jika end_trx = 'y' atau 'n', maka parent_code tidak boleh sama dengan yang sudah pernah digunakan dengan end_trx = 'y'
    // Menggunakan req_post untuk mengecek end_trx karena kolom end_trx tidak ada di database
    if (end_trx === 'y' || end_trx === 'n') {
      const parentCodeExists = await Penjualan.checkParentCodeWithEndTrxY(parent_code);
      if (parentCodeExists) {
        return res.status(400).json({
          code: "400",
          message: `Transaksi sudah selesai Tgl : ${formattedErrorDateTime}`,
          data: []
        });
      }
    }

    if (isNaN(qty) || parseInt(qty) <= 0) {
      return res.status(400).json({ code: 400, message: 'qty harus lebih besar dari 0', data: [] });
    }

    // Validasi TrxType dan EngineCode tidak boleh negatif
    if (isNaN(TrxType) || parseInt(TrxType) < 0) {
      return res.status(400).json({ code: 400, message: 'TrxType tidak boleh bernilai negatif', data: [] });
    }
    if (isNaN(EngineCode) || parseInt(EngineCode) < 0) {
      return res.status(400).json({ code: 400, message: 'EngineCode tidak boleh bernilai negatif', data: [] });
    }

    // Ambil angka dari ShiftCode (contoh: "Shift 01" -> 1)
    const shiftNumMatch = (ShiftCode || '').match(/\d+/);
    const shiftInt = shiftNumMatch ? parseInt(shiftNumMatch[0], 10) : null;
    if (shiftInt === null) {
      return res.status(400).json({ code: 400, message: 'ShiftCode tidak valid: harus mengandung angka shift', data: [] });
    }

    // Helper query
    const runQuery = (sql, params) => new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Validasi relasi
    const locationOk = await runQuery('SELECT 1 FROM location WHERE code = ? AND flag = "open" LIMIT 1', [Termcode]);
    if (locationOk.length === 0) return res.status(400).json({ code: 400, message: 'Termcode tidak ditemukan / tidak open', data: [] });

    const shiftOk = await runQuery('SELECT 1 FROM empshift WHERE code = ? AND flag = "open" LIMIT 1', [ShiftCode]);
    if (shiftOk.length === 0) return res.status(400).json({ code: 400, message: 'ShiftCode tidak valid / tidak open', data: [] });

    const userOk = await runQuery('SELECT 1 FROM users WHERE username = ? LIMIT 1', [LoginCode]);
    if (userOk.length === 0) return res.status(400).json({ code: 400, message: 'data tidak ditemukan', data: [] });

    const priceRows = await runQuery('SELECT price, name FROM wrap_price WHERE terminal_code = ? AND pack_type = ? AND flag = "open" LIMIT 1', [Termcode, pack_type]);
    if (priceRows.length === 0) return res.status(400).json({ code: 400, message: `pack_type tidak tersedia untuk terminal ${Termcode}`, data: [] });
    const unitPrice = parseInt(priceRows[0].price, 10) || 0;
    const packTypeName = priceRows[0].name || pack_type;
    const uangCalc = (parseInt(qty, 10) || 0) * unitPrice;

    const payOk = await runQuery('SELECT 1 FROM cfg_payment WHERE code = ? AND flag = "open" LIMIT 1', [payment_type]);
    if (payOk.length === 0) return res.status(400).json({ code: 400, message: 'payment_type tidak valid / tidak open', data: [] });

    // Data insert sesuai mapping yang diminta (kolom lain dibiarkan default)
    // Gunakan parent_code dari request body, bukan generate otomatis
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedParentCode = `PC${y}${m}${d}${hh}${mm}${ss}${ms}-${rand}`;
    
    // Gunakan parent_code dari request body untuk validasi dan penyimpanan
    const finalParentCode = parent_code || generatedParentCode;

    // Cari no_trans terakhir secara global (tidak berdasarkan parent_code)
    const lastTrxRows = await runQuery('SELECT no_trans FROM penjualan ORDER BY CAST(no_trans AS UNSIGNED) DESC LIMIT 1');
    const nextTrxNo = lastTrxRows.length > 0 ? parseInt(lastTrxRows[0].no_trans) + 1 : 1;

    // Format waktu untuk kolom tanggal
    const formattedDateTime = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;   // YYYY-MM-DD HH:mm:ss
    const formattedDateOnly = `${y}-${m}-${d}`;                    // YYYY-MM-DD

    // Build req_server (server-only info like in api_log agent_detect)
    const serverAddr  = req.socket?.localAddress || req.connection?.localAddress || '-';
    const serverPort  = req.socket?.localPort || req.connection?.localPort || '-';
    const serverName  = (req.hostname || req.get('host') || '').toString();
    const serverSig   = `<address>Node/${process.versions.node} (Express) Server at ${serverName || serverAddr} Port ${serverPort}</address>`;
    const serverSoft  = `Node/${process.versions.node} Express`;
    const reqServerObj = {
      SERVER_SIGNATURE: serverSig,
      SERVER_SOFTWARE:  serverSoft,
      SERVER_NAME:      serverName,
      SERVER_ADDR:      serverAddr,
      SERVER_PORT:      String(serverPort)
    };

    const penjualanData = {
      trx_type: TrxType,
      location_code: Termcode,
      shift_code: ShiftCode,
      shift: shiftInt,
      operator: LoginCode,
      user_code: LoginCode,
      engine_code: EngineCode,
      qty: parseInt(qty),
      trx_code: QRCode,
      pack_type: pack_type,
      payment_type: payment_type,
      payment_reff: payment_reff,
      parent_code: finalParentCode,
      tgl: formattedDateTime,
      upload_date: formattedDateTime,
      shift_date: formattedDateOnly,
      reprint: 1,
      uang: uangCalc,
      // req_get/req_post mengikuti format di api_log
      req_get: (req.query && Object.keys(req.query).length > 0) ? JSON.stringify(req.query) : '{}',
      req_post: req.method === 'POST' ? (Object.keys(req.body || {}).length > 0 ? JSON.stringify(req.body) : '{}') : '{}',
      req_server: JSON.stringify(reqServerObj)
    };

    const saved = await Penjualan.create(penjualanData);

    // Set no_trans dengan trx_no yang sudah dihitung
    await new Promise((resolve, reject) => {
      db.query('UPDATE penjualan SET no_trans = ? WHERE id = ?', [String(nextTrxNo), saved.id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Ambil detail_data berdasarkan parent_code yang sama
    const detailRows = await runQuery(`
      SELECT 
        p.pack_type,
        COUNT(*) as total_qty,
        wp.name as name_wrapping,
        wp.price as base_price_wrapping,
        (COUNT(*) * wp.price) as total_amount
      FROM penjualan p
      JOIN wrap_price wp ON p.pack_type = wp.pack_type AND p.location_code = wp.terminal_code
      WHERE p.parent_code = ? AND wp.flag = 'open'
      GROUP BY p.pack_type, wp.name, wp.price
      ORDER BY p.pack_type
    `, [finalParentCode]);

    const detailData = detailRows.map(row => ({
      total_amount: row.total_amount.toString(),
      total_qty: row.total_qty.toString(),
      pack_type: row.pack_type,
      name_wrapping: row.name_wrapping,
      base_price_wrapping: row.base_price_wrapping
    }));

    const responseData = {
      date_server: formattedDateOnly,
      trx_no: nextTrxNo,
      trx_code: QRCode,
      qty: `   ${parseInt(qty)}`,
      price: `     ${unitPrice.toLocaleString('id-ID')}`,
      total: `       ${uangCalc.toLocaleString('id-ID')}`,
      pack_type_name: packTypeName,
      payment_type: payment_type,
      payment_reff: payment_reff,
      parent_code: finalParentCode,
      detail_data: detailData
    };

    return res.status(200).json({ 
      code: "200", 
      message: "Success", 
      data: responseData 
    });
  } catch (error) {
    console.error('❌ Penjualan Iffat error:', error.message);
    return res.status(500).json({ code: 500, message: 'Terjadi kesalahan server', data: [] });
  }
};

// Universal CRUD - CRUD ke semua tabel atau 1 tabel
UserController.universalCrud = async (req, res) => {
  try {
    console.log('🔥 UNIVERSAL CRUD endpoint accessed');
    
    const { table_name, operation } = req.body;
    
    // Validasi parameter wajib
    if (!table_name || !operation) {
      return res.status(400).json({
        code: "400",
        message: "Mohon isi table_name dan operation terlebih dahulu",
        data: []
      });
    }
    
    // Validasi operation (support multiple operations separated by comma)
    const operations = operation.split(',').map(op => op.trim());
    const allowedOperations = ['create', 'read', 'update', 'delete'];
    const invalidOps = operations.filter(op => !allowedOperations.includes(op));
    if (invalidOps.length > 0) {
      return res.status(400).json({
        code: "400",
        message: `Invalid operation(s): ${invalidOps.join(', ')}. Allowed operations: create, read, update, delete`,
        data: []
      });
    }
    
    // Daftar tabel yang diizinkan
    const allowedTables = ['cfg_payment', 'empshift', 'engine', 'location', 'webconfig', 'wrap_price'];
    
    // Tentukan tabel yang akan diproses
    let tablesToProcess = [];
    if (table_name === 'all') {
      tablesToProcess = allowedTables;
    } else {
      if (!allowedTables.includes(table_name)) {
        return res.status(400).json({
          code: "400",
          message: `Table not allowed. Allowed tables: ${allowedTables.join(', ')}`,
          data: []
        });
      }
      tablesToProcess = [table_name];
    }
    
    // Sanitize input
    for (const [key, value] of Object.entries(req.body || {})) {
      if (value && typeof value === 'string') {
        const sanitizedValue = sanitizeInput(value);
        if (sanitizedValue !== value) {
          return res.status(400).json({
            code: 400,
            message: `${key} tidak boleh mengandung karakter berbahaya`,
            data: []
          });
        }
      }
    }

    // Validate: no empty values for provided parameters (checked params with empty value)
    const emptyParams = Object.entries(req.body || {})
      .filter(([k, v]) => k !== 'table_name' && k !== 'operation')
      .filter(([, v]) => v === undefined || v === null || (typeof v === 'string' && v.trim() === ''))
      .map(([k]) => k);

    if (emptyParams.length > 0) {
      return res.status(400).json({
        code: 400,
        message: `Parameter berikut tidak boleh kosong: ${emptyParams.join(', ')}`,
        data: []
      });
    }

    // Duplicate validation for CREATE operation (early rejection) - separated per table
    if (operations.includes('create')) {
      const run = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
      
      // location: check code uniqueness
      if (table_name === 'location' || table_name === 'all') {
        if (req.body.location_code) {
          const locationCodeExists = await run('SELECT 1 FROM location WHERE code = ? LIMIT 1', [req.body.location_code]);
          if (locationCodeExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'code bandara sudah digunakan',
              data: []
            });
          }
        }
      }
      
      // location: check name uniqueness
      if (table_name === 'location' || table_name === 'all') {
        if (req.body.location_name) {
          const locationNameExists = await run('SELECT 1 FROM location WHERE name = ? LIMIT 1', [req.body.location_name]);
          if (locationNameExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'nama lokasi sudah digunakan',
              data: []
            });
          }
        }
      }
      
      
      // cfg_payment: check code uniqueness (case-insensitive, trimmed)
      if (table_name === 'cfg_payment' || table_name === 'all') {
        if (req.body.cfg_payment_code) {
          const val = String(req.body.cfg_payment_code).trim();
          const cfgPaymentCodeExists = await run('SELECT 1 FROM cfg_payment WHERE LOWER(TRIM(code)) = LOWER(TRIM(?)) LIMIT 1', [val]);
          if (cfgPaymentCodeExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'kode pembayaran sudah digunakan',
              data: []
            });
          }
        }
      }
      
      // cfg_payment: check name uniqueness
      if (table_name === 'cfg_payment' || table_name === 'all') {
        if (req.body.cfg_payment_name) {
          const cfgPaymentNameExists = await run('SELECT 1 FROM cfg_payment WHERE name = ? LIMIT 1', [req.body.cfg_payment_name]);
          if (cfgPaymentNameExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'nama pembayaran sudah digunakan',
              data: []
            });
          }
        }
      }
      
      // empshift: validate work_in tidak bentrok dan harus terusan dari shift dengan work_out terbesar
      if (table_name === 'empshift' || table_name === 'all') {
        if (req.body.empshift_work_in) {
          const normalize = (raw) => {
            const v = String(raw || '').trim();
            if (/^\d{6}$/.test(v)) {
              return `${v.slice(0,2)}:${v.slice(2,4)}:${v.slice(4,6)}`;
            }
            if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v;
            return v;
          };
          const toSec = (t) => {
            const [hh, mm, ss] = (t || '00:00:00').split(':').map(n => parseInt(n, 10) || 0);
            return (hh * 3600) + (mm * 60) + ss;
          };
          
          const provided = normalize(req.body.empshift_work_in);
          const providedSec = toSec(provided);
          
          // 1. Cek bentrok dengan semua shift yang sudah ada
          const existingShifts = await run('SELECT code, TIME_FORMAT(work_in, "%H:%i:%s") AS work_in, TIME_FORMAT(work_out, "%H:%i:%s") AS work_out FROM empshift', []);
          
          for (const shift of existingShifts) {
            const workInSec = toSec(shift.work_in);
            const workOutSec = toSec(shift.work_out);
            
            // Cek apakah work_in baru berada dalam rentang shift yang sudah ada
            if (providedSec >= workInSec && providedSec <= workOutSec) {
              return res.status(400).json({
                code: '400',
                message: `jadwal tersebut sudah tersedia pada ${shift.code}`,
                data: []
              });
            }
          }
          
          // 2. Cek apakah work_in harus terusan dari work_out shift dengan waktu terbesar
          const latestShift = await run('SELECT code, TIME_FORMAT(work_out, "%H:%i:%s") AS work_out FROM empshift ORDER BY work_out DESC LIMIT 1', []);
          if (latestShift.length > 0) {
            const latestWorkOutSec = toSec(latestShift[0].work_out);
            if (providedSec <= latestWorkOutSec) {
              return res.status(400).json({
                code: '400',
                message: 'waktu masuk harus setelah waktu keluar shift terakhir',
                data: []
              });
            }
          }
        }
      }

      // engine: duplicates allowed for engine_code (no uniqueness check)
      
      // wrap_price: check pack_type uniqueness (case-insensitive, trimmed, scoped by terminal_code if provided)
      if (table_name === 'wrap_price' || table_name === 'all') {
        // Validasi: jika wrap_price_pack_type diisi, maka wrap_price_price wajib diisi
        if (req.body.wrap_price_pack_type) {
          if (!req.body.wrap_price_price || req.body.wrap_price_price === '') {
            return res.status(400).json({
              code: '400',
              message: 'harga pack belum di isi',
              data: []
            });
          }
        }
        
        if (req.body.wrap_price_pack_type) {
          const val = String(req.body.wrap_price_pack_type).trim();
          const terminal = req.body.wrap_price_terminal_code || req.body.terminal_code || null;
          
          let sql = 'SELECT 1 FROM wrap_price WHERE LOWER(TRIM(pack_type)) = LOWER(TRIM(?))';
          const params = [val];
          if (terminal) { 
            sql += ' AND terminal_code = ?'; 
            params.push(terminal); 
          }
          sql += ' LIMIT 1';
          
          const wrapPricePackTypeExists = await run(sql, params);
          if (wrapPricePackTypeExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'pack type sudah digunakan',
              data: []
            });
          }
        }
      }
      
      // wrap_price: check name uniqueness (scoped by terminal_code if provided)
      if (table_name === 'wrap_price' || table_name === 'all') {
        if (req.body.wrap_price_name) {
          const terminal = req.body.wrap_price_terminal_code || req.body.terminal_code || null;
          
          let sql = 'SELECT 1 FROM wrap_price WHERE name = ?';
          const params = [req.body.wrap_price_name];
          if (terminal) { 
            sql += ' AND terminal_code = ?'; 
            params.push(terminal); 
          }
          sql += ' LIMIT 1';
          
          const wrapPriceNameExists = await run(sql, params);
          if (wrapPriceNameExists.length > 0) {
            return res.status(400).json({
              code: '400',
              message: 'nama wrap price sudah digunakan',
              data: []
            });
          }
        }
      }
    }

    // Duplicate validation untuk UPDATE - separated per table
    if (operations.includes('update')) {
      const run = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });

      // cfg_payment: check code uniqueness (case-insensitive, trimmed), exclude self
      if (table_name === 'cfg_payment' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.cfg_payment_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.cfg_payment_code) {
            const val = String(req.body.cfg_payment_code).trim();
            const cfgPaymentCodeExists = await run('SELECT 1 FROM cfg_payment WHERE LOWER(TRIM(code)) = LOWER(TRIM(?)) AND id <> ? LIMIT 1', [val, idUpdate]);
            if (cfgPaymentCodeExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'kode pembayaran sudah digunakan',
                data: []
              });
            }
          }
        }
      }

      // cfg_payment: check name uniqueness, exclude self
      if (table_name === 'cfg_payment' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.cfg_payment_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.cfg_payment_name) {
            const cfgPaymentNameExists = await run('SELECT 1 FROM cfg_payment WHERE name = ? AND id <> ? LIMIT 1', [req.body.cfg_payment_name, idUpdate]);
            if (cfgPaymentNameExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'nama pembayaran sudah digunakan',
                data: []
              });
            }
          }
        }
      }

      // empshift: validate work_in tidak bentrok dan harus terusan dari shift dengan work_out terbesar, exclude self
      if (table_name === 'empshift' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.empshift_id;
        if (req.body.empshift_work_in && idUpdate) {
          const normalize = (raw) => {
            const v = String(raw || '').trim();
            if (/^\d{6}$/.test(v)) {
              return `${v.slice(0,2)}:${v.slice(2,4)}:${v.slice(4,6)}`;
            }
            if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v;
            return v;
          };
          const toSec = (t) => {
            const [hh, mm, ss] = (t || '00:00:00').split(':').map(n => parseInt(n, 10) || 0);
            return (hh * 3600) + (mm * 60) + ss;
          };
          
          const provided = normalize(req.body.empshift_work_in);
          const providedSec = toSec(provided);
          
          // 1. Cek bentrok dengan semua shift yang sudah ada (kecuali yang sedang diupdate)
          const existingShifts = await new Promise((resolve, reject) => {
            db.query('SELECT code, TIME_FORMAT(work_in, "%H:%i:%s") AS work_in, TIME_FORMAT(work_out, "%H:%i:%s") AS work_out FROM empshift WHERE id <> ?', [idUpdate], (err, rows) => {
              if (err) return reject(err);
              resolve(rows || []);
            });
          });
          
          for (const shift of existingShifts) {
            const workInSec = toSec(shift.work_in);
            const workOutSec = toSec(shift.work_out);
            
            // Cek apakah work_in baru berada dalam rentang shift yang sudah ada
            if (providedSec >= workInSec && providedSec <= workOutSec) {
              return res.status(400).json({
                code: '400',
                message: `jadwal tersebut sudah tersedia pada ${shift.code}`,
                data: []
              });
            }
          }
          
          // 2. Cek apakah work_in harus terusan dari work_out shift dengan waktu terbesar (kecuali yang sedang diupdate)
          const latestShift = await new Promise((resolve, reject) => {
            db.query('SELECT code, TIME_FORMAT(work_out, "%H:%i:%s") AS work_out FROM empshift WHERE id <> ? ORDER BY work_out DESC LIMIT 1', [idUpdate], (err, rows) => {
              if (err) return reject(err);
              resolve(rows || []);
            });
          });
          if (latestShift.length > 0) {
            const latestWorkOutSec = toSec(latestShift[0].work_out);
            if (providedSec <= latestWorkOutSec) {
              return res.status(400).json({
                code: '400',
                message: 'waktu masuk harus setelah waktu keluar shift terakhir',
                data: []
              });
            }
          }
        }
      }

      // location: check code uniqueness, exclude self
      if (table_name === 'location' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.location_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.location_code) {
            const locationCodeExists = await run('SELECT 1 FROM location WHERE code = ? AND id <> ? LIMIT 1', [req.body.location_code, idUpdate]);
            if (locationCodeExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'location_code sudah digunakan',
                data: []
              });
            }
          }
        }
      }

      // location: check name uniqueness, exclude self
      if (table_name === 'location' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.location_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.location_name) {
            const locationNameExists = await run('SELECT 1 FROM location WHERE name = ? AND id <> ? LIMIT 1', [req.body.location_name, idUpdate]);
            if (locationNameExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'location_name sudah digunakan',
                data: []
              });
            }
          }
        }
      }


      // wrap_price: check pack_type uniqueness (case-insensitive, trimmed, scoped by terminal_code if provided), exclude self
      if (table_name === 'wrap_price' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.wrap_price_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.wrap_price_pack_type) {
            const val = String(req.body.wrap_price_pack_type).trim();
            const terminal = req.body.wrap_price_terminal_code || req.body.terminal_code || null;
            
            let sql = 'SELECT 1 FROM wrap_price WHERE LOWER(TRIM(pack_type)) = LOWER(TRIM(?)) AND id <> ?';
            const params = [val, idUpdate];
            if (terminal) { 
              sql += ' AND terminal_code = ?'; 
              params.push(terminal); 
            }
            sql += ' LIMIT 1';
            
            const wrapPricePackTypeExists = await run(sql, params);
            if (wrapPricePackTypeExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'pack type sudah digunakan',
                data: []
              });
            }
          }
        }
      }

      // wrap_price: check name uniqueness (scoped by terminal_code if provided), exclude self
      if (table_name === 'wrap_price' || table_name === 'all') {
        const idUpdate = req.body.id || req.body.wrap_price_id;
        if (!idUpdate) {
          // validasi update sudah memastikan wajib ada id, jadi ini hanya guard
        } else {
          if (req.body.wrap_price_name) {
            const terminal = req.body.wrap_price_terminal_code || req.body.terminal_code || null;
            
            let sql = 'SELECT 1 FROM wrap_price WHERE name = ? AND id <> ?';
            const params = [req.body.wrap_price_name, idUpdate];
            if (terminal) { 
              sql += ' AND terminal_code = ?'; 
              params.push(terminal); 
            }
            sql += ' LIMIT 1';
            
            const wrapPriceNameExists = await run(sql, params);
            if (wrapPriceNameExists.length > 0) {
              return res.status(400).json({
                code: '400',
                message: 'nama wrap price sudah digunakan',
                data: []
              });
            }
          }
        }
      }
    }

    // Additional validation for single-table operations
    if (table_name !== 'all') {
      const tableSchemas = {
        cfg_payment: ['id', 'code', 'name', 'flag'],
        empshift: ['id', 'code', 'work_in', 'work_out', 'flag'],
        engine: ['id', 'code', 'location_code', 'engine_count'],
        location: ['id', 'code', 'name', 'airport', 'store_id', 'flag'],
        webconfig: ['id', 'code', 'name', 'type', 'text_data', 'text_url', 'amount', 'seq', 'date_update', 'user_update', 'flag'],
        wrap_price: ['id', 'terminal_code', 'pack_type', 'name', 'price', 'flag']
      };

      const schema = tableSchemas[table_name];
      const prefixed = (field) => `${table_name}_${field}`;

      // Ensure required data presence based on operation
      if (operation === 'create') {
        const hasDataField = Object.keys(req.body).some(k => schema.includes(k) || schema.includes(k.replace(`${table_name}_`, '')));
        if (!hasDataField) {
          return res.status(400).json({
            code: 400,
            message: `Tidak ada data yang dikirim untuk operasi create pada tabel ${table_name}`,
            data: []
          });
        }
      }

      if (operation === 'update') {
        const hasWhere = ('id' in req.body) || (prefixed('id') in req.body);
        const hasData = Object.keys(req.body).some(k => {
          const unpref = k.replace(`${table_name}_`, '');
          return schema.includes(unpref) && unpref !== 'id';
        });
        if (!hasWhere) {
          return res.status(400).json({
            code: 400,
            message: `Mohon isi parameter id (WHERE) untuk operasi update pada tabel ${table_name}`,
            data: []
          });
        }
        if (!hasData) {
          return res.status(400).json({
            code: 400,
            message: `Mohon isi minimal satu field data untuk operasi update pada tabel ${table_name}`,
            data: []
          });
        }
      }

      if (operation === 'delete' || operation === 'read') {
        const hasWhere = Object.keys(req.body).some(k => {
          if (k === 'operation' || k === 'table_name') return false;
          const unpref = k.replace(`${table_name}_`, '');
          return schema.includes(unpref);
        });
        // For READ single-table: allow no filter to fetch all rows
        if (operation === 'delete' && !hasWhere) {
          return res.status(400).json({
            code: 400,
            message: `Mohon isi minimal satu parameter filter (WHERE) untuk operasi ${operation} pada tabel ${table_name}`,
            data: []
          });
        }
      }
    }
    
    // Helper function untuk build query
    const buildQuery = (table, operation, data, where, valueSearch) => {
      const tableSchemas = {
        cfg_payment: ['id', 'code', 'name', 'flag'],
        empshift: ['id', 'code', 'work_in', 'work_out', 'flag'],
        engine: ['id', 'code', 'location_code', 'engine_count'],
        location: ['id', 'code', 'name', 'airport', 'store_id', 'flag'],
        webconfig: ['id', 'code', 'name', 'type', 'text_data', 'text_url', 'amount', 'seq', 'date_update', 'user_update', 'flag'],
        wrap_price: ['id', 'terminal_code', 'pack_type', 'name', 'price', 'flag']
      };
      
      const schema = tableSchemas[table];
      if (!schema) return null;
      
      let query = '';
      let params = [];
      
      switch (operation) {
        case 'create':
          // Auto set date_update for webconfig if not provided
          if (table === 'webconfig' && data.date_update === undefined) {
            data.date_update = new Date();
          }
          const createFields = Object.keys(data).filter(field => schema.includes(field));
          if (createFields.length === 0) return null;
          
          // Tambahkan flag = 'open' otomatis untuk tabel yang memiliki kolom flag
          if (schema.includes('flag') && !createFields.includes('flag')) {
            createFields.push('flag');
            data.flag = 'open';
          }
          
          query = `INSERT INTO ${table} (${createFields.join(', ')}) VALUES (${createFields.map(() => '?').join(', ')})`;
          params = createFields.map(field => data[field]);
          break;
          
        case 'read':
          query = `SELECT * FROM ${table}`;
          const clauses = [];
          if (where && Object.keys(where).length > 0) {
            const whereFields = Object.keys(where).filter(field => schema.includes(field));
            whereFields.forEach(field => {
              // Text-like columns use LIKE, others exact
              if (['code','name','type','text_data','text_url','seq','user_update','airport','store_id','pack_type','terminal_code','flag'].includes(field)) {
                clauses.push(`${field} LIKE ?`);
                params.push(`%${where[field]}%`);
              } else {
                clauses.push(`${field} = ?`);
                params.push(where[field]);
              }
            });
          }
          if (valueSearch !== undefined && valueSearch !== null && String(valueSearch).trim() !== '') {
            const orClauses = [];
            // text-like columns
            ['code','name','type','text_data','text_url','seq','user_update','airport','store_id','pack_type','terminal_code','flag']
              .filter(col => schema.includes(col))
              .forEach(col => {
                orClauses.push(`${col} LIKE ?`);
                params.push(`%${valueSearch}%`);
              });
            // numeric columns equals
            const numericVal = parseFloat(valueSearch);
            if (!isNaN(numericVal)) {
              ['id','engine_count','price','amount']
                .filter(col => schema.includes(col))
                .forEach(col => {
                  orClauses.push(`${col} = ?`);
                  params.push(numericVal);
                });
            }
            if (orClauses.length > 0) {
              clauses.push(`(${orClauses.join(' OR ')})`);
            }
          }
          if (clauses.length > 0) {
            query += ` WHERE ${clauses.join(' AND ')}`;
          }
          break;
          
        case 'update':
          const updateFields = Object.keys(data).filter(field => schema.includes(field));
          if (updateFields.length === 0) return null;
          
          // Tambahkan flag = 'open' otomatis untuk tabel yang memiliki kolom flag
          if (schema.includes('flag') && !updateFields.includes('flag')) {
            updateFields.push('flag');
            data.flag = 'open';
          }
          
          query = `UPDATE ${table} SET ${updateFields.map(field => `${field} = ?`).join(', ')}`;
          params = updateFields.map(field => data[field]);
          
          if (where && Object.keys(where).length > 0) {
            const whereFields = Object.keys(where).filter(field => schema.includes(field));
            if (whereFields.length > 0) {
              query += ` WHERE ${whereFields.map(field => `${field} = ?`).join(' AND ')}`;
              params = params.concat(whereFields.map(field => where[field]));
            }
          }
          break;
          
        case 'delete':
          if (!where || Object.keys(where).length === 0) return null;
          
          const deleteFields = Object.keys(where).filter(field => schema.includes(field));
          if (deleteFields.length === 0) return null;
          
          query = `DELETE FROM ${table} WHERE ${deleteFields.map(field => `${field} = ?`).join(' AND ')}`;
          params = deleteFields.map(field => where[field]);
          break;
      }
      
      return { query, params };
    };
    
    // Helper function untuk extract data berdasarkan prefix
    const extractTableData = (body, table, operation) => {
      const data = {};
      const where = {};
      
      // 1) Ambil yang prefixed lebih dulu (prioritas prefixed)
      for (const [key, value] of Object.entries(body)) {
        if (!key.startsWith(`${table}_`)) continue;
        const field = key.replace(`${table}_`, '');
        if (operation === 'read' || operation === 'delete') {
          where[field] = value;
        } else if (operation === 'update') {
          if (field === 'id') {
            where[field] = value;
          } else {
            data[field] = value;
          }
        } else {
          data[field] = value;
        }
      }
      
      // 2) Untuk single table, ambil juga non-prefixed jika belum terisi oleh prefixed
      if (table_name !== 'all') {
        for (const [key, value] of Object.entries(body)) {
          if (key === 'table_name' || key === 'operation' || key.startsWith(`${table}_`)) continue;
          if (operation === 'read' || operation === 'delete') {
            if (where[key] === undefined) where[key] = value;
          } else if (operation === 'update') {
            if (key === 'id') {
              if (where[key] === undefined) where[key] = value;
            } else if (data[key] === undefined) {
              data[key] = value;
            }
          } else {
            if (data[key] === undefined) data[key] = value;
          }
        }
      }
      
      return { data, where };
    };
    
    // Proses setiap tabel dengan delay untuk menghindari connection overload
    const results = [];
    const skippedTables = [];
    
    for (let i = 0; i < tablesToProcess.length; i++) {
      const table = tablesToProcess[i];
      
      // Add small delay between queries to prevent connection overload
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      }
      
      try {
        console.log(`Processing table: ${table} (${i + 1}/${tablesToProcess.length})`);
        
        // Determine operation for this table based on presence of id
        let tableOperation = operation;
        if (operations.includes('create') && operations.includes('update')) {
          // Mixed mode: check if table has id to determine operation
          const hasId = req.body[`${table}_id`] || req.body.id;
          if (hasId) {
            tableOperation = 'update';
          } else {
            // Check if table has any data fields
            const hasData = Object.keys(req.body).some(key => 
              key.startsWith(`${table}_`) && key !== `${table}_id`
            );
            if (hasData) {
              tableOperation = 'create';
            } else {
              // Skip this table if no data and no id
              skippedTables.push({
                table,
                reason: 'No data provided and no id for mixed operation'
              });
              continue;
            }
          }
        }
        
        const { data, where } = extractTableData(req.body, table, tableOperation);
        console.log(`Table ${table} - Operation: ${tableOperation} - Data:`, data, 'Where:', where);
        
        // Skip jika tidak ada data untuk operasi create/update
        if ((tableOperation === 'create' || tableOperation === 'update') && Object.keys(data).length === 0) {
          skippedTables.push({
            table,
            reason: `No data provided for ${tableOperation} operation`
          });
          continue;
        }
        
        // Skip jika tidak ada where condition untuk operasi read/delete
        if ((tableOperation === 'read' || tableOperation === 'delete') && Object.keys(where).length === 0 && table_name === 'all') {
          skippedTables.push({
            table,
            reason: `No where condition provided for ${tableOperation} operation`
          });
          continue;
        }
        
        const valueSearch = req.body.value || req.body[`${table}_value`];
        const queryInfo = buildQuery(table, tableOperation, data, where, valueSearch);
        if (!queryInfo) {
          skippedTables.push({
            table,
            reason: `No valid fields found for ${operation} operation`
          });
          continue;
        }
        
        // Execute query with connection retry
        let queryResult;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            queryResult = await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Query timeout'));
              }, 10000); // 10 second timeout
              
              db.query(queryInfo.query, queryInfo.params, (err, result) => {
                clearTimeout(timeout);
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
            break; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
              throw error; // Max retries reached
            }
            console.log(`Retry ${retryCount}/${maxRetries} for table ${table}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
        
        // Format result
        let result = {
          table,
          operation: tableOperation,
          affected_rows: queryResult.affectedRows || 0,
          fields_used: Object.keys(data).length > 0 ? Object.keys(data) : Object.keys(where)
        };
        
        if (tableOperation === 'create' && queryResult.insertId) {
          result.insert_id = queryResult.insertId;
        }
        
        if (tableOperation === 'read') {
          result.record_count = queryResult.length;
          result.data = queryResult;
        }
        
        if (tableOperation === 'update' && Object.keys(where).length > 0) {
          result.updated_condition = Object.entries(where).map(([k, v]) => `${k} = '${v}'`).join(' AND ');
        }
        
        if (tableOperation === 'delete' && Object.keys(where).length > 0) {
          result.deleted_condition = Object.entries(where).map(([k, v]) => `${k} = '${v}'`).join(' AND ');
        }
        
        results.push(result);
        
      } catch (error) {
        console.error(`Error processing table ${table}:`, error.message);
        
        // More specific error messages
        let errorMessage = error.message;
        if (error.message.includes('ECONNRESET')) {
          errorMessage = 'Database connection lost, please try again';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Query timeout, please try again';
        } else if (error.message.includes('ER_LOCK_WAIT_TIMEOUT')) {
          errorMessage = 'Database locked, please try again later';
        }
        
        skippedTables.push({
          table,
          reason: errorMessage
        });
      }
    }
    
    // Format response - simplified
    const response = {
      code: "200",
      message: "Success",
      data: {}
    };
    
    if (operations.includes('read')) {
      // Simplified READ response
      const allData = {};
      let totalRecords = 0;
      
      results.forEach(result => {
        allData[result.table] = {
          count: result.record_count || 0,
          data: result.data || []
        };
        totalRecords += result.record_count || 0;
      });
      
      response.data = {
        total_records: totalRecords,
        tables: allData
      };
      
      
    } else {
      // Simplified CREATE/UPDATE/DELETE response
      const summary = {};
      let totalAffected = 0;
      
      results.forEach(result => {
        summary[result.table] = {
          affected_rows: result.affected_rows || 0,
          operation: result.operation
        };
        totalAffected += result.affected_rows || 0;
        
        if (result.insert_id) {
          summary[result.table].insert_id = result.insert_id;
        }
      });
      
      response.data = {
        total_affected_rows: totalAffected,
        summary: summary
      };
      
    }
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Universal CRUD error:', error.message);
    return res.status(500).json({
      code: 500,
      message: 'Terjadi kesalahan server',
      data: []
    });
  }
};
