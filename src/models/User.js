const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Check username exists
  static async checkUsernameExists(username, excludeId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id FROM users WHERE username = ?';
      let params = [username];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }

  // Get user by username for login
  static async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, userdesc, pass, usertype, jenisuser, cabang, cookie1 FROM users WHERE username = ?';
      
      db.query(query, [username], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      });
    });
  }

  // Create new user
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, userdesc, pass, usertype, jenisuser, cabang } = userData;
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);
        
        const insertQuery = `
          INSERT INTO users (username, userdesc, pass, usertype, jenisuser, cabang) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          username, 
          userdesc, 
          hashedPassword, 
          usertype,
          parseInt(jenisuser),
          parseInt(cabang)
        ];
        
        db.query(insertQuery, values, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: result.insertId,
              username,
              userdesc,
              usertype,
              jenisuser,
              cabang
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Read users with filters
  static async read(filters = {}) {
    return new Promise((resolve, reject) => {
      const { id, username, userdesc, usertype, jenisuser, cabang } = filters;
      
      let query = 'SELECT id, username, userdesc, usertype, jenisuser, cabang FROM users WHERE 1=1';
      let queryParams = [];
      
      if (id) {
        query += ' AND id = ?';
        queryParams.push(parseInt(id));
      }
      
      if (username) {
        query += ' AND username LIKE ?';
        queryParams.push('%' + username + '%');
      }
      
      if (userdesc) {
        query += ' AND userdesc LIKE ?';
        queryParams.push('%' + userdesc + '%');
      }
      
      if (usertype) {
        query += ' AND usertype = ?';
        queryParams.push(usertype);
      }
      
      if (jenisuser !== undefined) {
        query += ' AND jenisuser = ?';
        queryParams.push(parseInt(jenisuser));
      }
      
      if (cabang) {
        query += ' AND cabang = ?';
        queryParams.push(parseInt(cabang));
      }
      
      query += ' ORDER BY username ASC';
      
      db.query(query, queryParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Update user
  static async update(id, userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, userdesc, pass, usertype, jenisuser, cabang } = userData;
        
        let updateFields = [];
        let values = [];
        
        if (username !== undefined) {
          updateFields.push('username = ?');
          values.push(username);
        }
        
        if (userdesc !== undefined) {
          updateFields.push('userdesc = ?');
          values.push(userdesc);
        }
        
        if (pass !== undefined) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(pass, saltRounds);
          updateFields.push('pass = ?');
          values.push(hashedPassword);
        }
        
        if (usertype !== undefined) {
          updateFields.push('usertype = ?');
          values.push(usertype);
        }
        
        if (jenisuser !== undefined) {
          updateFields.push('jenisuser = ?');
          values.push(parseInt(jenisuser));
        }
        
        if (cabang !== undefined) {
          updateFields.push('cabang = ?');
          values.push(parseInt(cabang));
        }
        
        if (updateFields.length === 0) {
          reject(new Error('No fields to update'));
          return;
        }
        
        values.push(parseInt(id));
        
        const updateQuery = `
          UPDATE users 
          SET ${updateFields.join(', ')} 
          WHERE id = ?
        `;
        
        db.query(updateQuery, values, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ id, affectedRows: result.affectedRows });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Delete user by ID
  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      
      db.query(deleteQuery, [parseInt(id)], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id, affectedRows: result.affectedRows });
        }
      });
    });
  }

  // Delete user by username
  static async deleteByUsername(username) {
    return new Promise((resolve, reject) => {
      const deleteQuery = 'DELETE FROM users WHERE username = ?';
      
      db.query(deleteQuery, [username], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ username, affectedRows: result.affectedRows });
        }
      });
    });
  }

  // Delete user (flexible - by ID or username)
  static async delete(identifier) {
    // Check if identifier is numeric (ID) or string (username)
    if (!isNaN(identifier) && parseInt(identifier) > 0) {
      return this.deleteById(parseInt(identifier));
    } else {
      return this.deleteByUsername(identifier);
    }
  }
}

module.exports = User;
