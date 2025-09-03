const User = require('../models/User'); //model yang berisi query mysql untuk CRUD TABLE USERS

const { validateRequiredFields, validateFieldSecurity, sanitizeInput } = require('../utils/security');
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
      const result = await User.update(id, req.body);
      
      res.json({
        code: 200,
        message: 'OK',
        data: [result]
      });
      
    } catch (error) {
      console.error('Update error:', error.message);
      res.status(500).json({
        code: 500,
        message: 'Terjadi kesalahan server',
        data: []
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      console.log('🔥 LOGIN ENDPOINT DIAKSES');
      
      const { username, pass } = req.body;
      
      // Validasi input
      if (!username || !pass) {
        return res.status(400).json({
          code: 400,
          message: 'Username dan password harus diisi',
          data: []
        });
      }
      
      // Sanitize input
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(pass);
      
      // Cek apakah username ada di database
      const user = await User.getUserByUsername(sanitizedUsername);
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: 'Username tidak ditemukan',
          data: []
        });
      }
      
      // Verifikasi password menggunakan bcrypt
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.pass);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          code: 401,
          message: 'Password salah',
          data: []
        });
      }
      
      // Login berhasil - tampilkan data user (tanpa password)
      const userData = {
        id: user.id,
        username: user.username,
        userdesc: user.userdesc,
        usertype: user.usertype,
        jenisuser: user.jenisuser,
        cabang: user.cabang,
        cookie1: user.cookie1
      };
      
      return res.status(200).json({
        code: 200,
        message: 'OK',
        data: [userData],
        login_time: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json(errorResponse(500, 'Terjadi kesalahan server'));
    }
  }

  // Delete user
  static async delete(req, res) {
    try {
      console.log('DELETE endpoint accessed');
      
      const { id, username } = req.body;
      
      // Bisa delete berdasarkan ID atau username
      if (!id && !username) {
        return res.status(400).json({
          code: 400,
          message: 'Mohon isi id atau username terlebih dahulu',
          data: []
        });
      }
      
      let identifier = id || username;
      let searchField = id ? 'id' : 'username';
      
      // Check if user exists
      let existingUsers;
      if (searchField === 'id') {
        existingUsers = await User.read({ id: identifier });
      } else {
        existingUsers = await User.read({ username: identifier });
      }
      
      if (existingUsers.length === 0) {
        return res.status(404).json({
          code: 404,
          message: `User dengan ${searchField} "${identifier}" tidak ditemukan`,
          data: []
        });
      }
      
      // Delete user
      const result = await User.delete(identifier);
      
      res.json({
        code: 200,
        message: 'OK',
        data: [result],
        deleted_user: existingUsers[0]
      });
      
    } catch (error) {
      console.error('Delete error:', error.message);
      res.status(500).json({
        code: 500,
        message: 'Terjadi kesalahan server',
        data: []
      });
    }
  }
}

module.exports = UserController;
