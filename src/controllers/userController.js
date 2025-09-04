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
