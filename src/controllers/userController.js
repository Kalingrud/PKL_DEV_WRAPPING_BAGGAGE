const User = require('../models/User');
const { validateRequiredFields, validateFieldSecurity, sanitizeInput } = require('../utils/security');

class UserController {
  // Create user
  static async create(req, res) {
    try {
      console.log('CREATE endpoint accessed');
      
      const requiredFields = ['username', 'userdesc', 'pass', 'usertype', 'jenisuser', 'cabang'];
      if (!validateRequiredFields(req, res, requiredFields)) {
        return;
      }
      
      let { username, userdesc, pass, usertype, jenisuser, cabang } = req.body;
      
      // Sanitize input
      username = sanitizeInput(username);
      userdesc = sanitizeInput(userdesc);
      pass = sanitizeInput(pass);
      
      // Check username exists
      const usernameExists = await User.checkUsernameExists(username);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }
      
      // Validate username pattern
      const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
      if (!usernamePattern.test(username)) {
        return res.status(400).json({
          success: false,
          message: 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)'
        });
      }
      
      // Create user
      const newUser = await User.create({
        username, userdesc, pass, usertype, jenisuser, cabang
      });
      
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: newUser
      });
      
    } catch (error) {
      console.error('Create error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Read users
  static async read(req, res) {
    try {
      console.log('READ endpoint accessed');
      
      const params = req.method === 'GET' ? req.query : req.body;
      
      // Validate input security
      for (const [key, value] of Object.entries(params || {})) {
        if (value && typeof value === 'string') {
          const sanitizedValue = sanitizeInput(value);
          if (sanitizedValue !== value) {
            return res.status(400).json({
              success: false,
              message: `${key} tidak boleh mengandung karakter berbahaya`
            });
          }
        }
      }
      
      // Get users with filters
      const users = await User.read(params);
      
      res.json({
        success: true,
        message: 'Data berhasil diambil',
        data: users,
        count: users.length
      });
      
    } catch (error) {
      console.error('Read error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Update user
  static async update(req, res) {
    try {
      console.log('UPDATE endpoint accessed');
      
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mohon isi id terlebih dahulu'
        });
      }
      
      if (!validateFieldSecurity(req, res)) {
        return;
      }
      
      // Check if user exists
      const existingUsers = await User.read({ id });
      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      // Check username uniqueness if updating username
      if (req.body.username) {
        const usernameExists = await User.checkUsernameExists(req.body.username, id);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan'
          });
        }
      }
      
      // Update user
      const result = await User.update(id, req.body);
      
      res.json({
        success: true,
        message: 'User berhasil diupdate',
        data: result
      });
      
    } catch (error) {
      console.error('Update error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
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
          data: null,
          success: false,
          code_message: 'Bad Request'
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
          data: null,
          success: false,
          error_code: 'USERNAME_NOT_FOUND',
          code_message: 'Unauthorized'
        });
      }
      
      // Verifikasi password menggunakan bcrypt
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.pass);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          code: 401,
          message: 'Password salah',
          data: null,
          success: false,
          error_code: 'INVALID_PASSWORD',
          code_message: 'Unauthorized'
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
        message: 'Login berhasil',
        data: userData,
        code_message: 'OK',
        success: true,
        login_time: new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({
        code: 500,
        message: 'Terjadi kesalahan server',
        data: null,
        success: false,
        code_message: 'Internal Server Error'
      });
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
          success: false,
          message: 'Mohon isi id atau username terlebih dahulu'
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
          success: false,
          message: `User dengan ${searchField} "${identifier}" tidak ditemukan`
        });
      }
      
      // Delete user
      const result = await User.delete(identifier);
      
      res.json({
        success: true,
        message: `User dengan ${searchField} "${identifier}" berhasil dihapus`,
        data: result,
        deleted_user: existingUsers[0]
      });
      
    } catch (error) {
      console.error('Delete error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = UserController;
