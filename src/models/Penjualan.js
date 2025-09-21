const db = require('../config/database');

class Penjualan {
  // Create penjualan record
  static async create(data) {
    // Build dynamic INSERT so unspecified columns use DB defaults
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((key) => data[key]);

    const query = `INSERT INTO penjualan (${columns.join(', ')}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`));
        }
        resolve({ id: result.insertId, ...data });
      });
    });
  }

  // Read penjualan records
  static async read(filters = {}) {
    let query = 'SELECT * FROM penjualan WHERE 1=1';
    const values = [];

    if (filters.id) {
      query += ' AND id = ?';
      values.push(filters.id);
    }

    if (filters.trx_code) {
      query += ' AND trx_code = ?';
      values.push(filters.trx_code);
    }

    if (filters.shift_code) {
      query += ' AND shift_code = ?';
      values.push(filters.shift_code);
    }

    query += ' ORDER BY id DESC';

    try {
      const [rows] = await db.execute(query, values);
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Update penjualan record
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE penjualan SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Delete penjualan record
  static async delete(id) {
    const query = 'DELETE FROM penjualan WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Check if QRCode already exists
  static async checkQRCodeExists(qrCode) {
    const query = 'SELECT id FROM penjualan WHERE trx_code = ? LIMIT 1';
    
    return new Promise((resolve, reject) => {
      db.query(query, [qrCode], (err, results) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`));
        }
        resolve(results.length > 0);
      });
    });
  }

  // Check if parent_code already exists with end_trx = 'y' (menggunakan req_post)
  static async checkParentCodeWithEndTrxY(parentCode) {
    const query = 'SELECT id FROM penjualan WHERE parent_code = ? AND req_post LIKE ? LIMIT 1';
    
    return new Promise((resolve, reject) => {
      // Mencari pattern "end_trx":"y" dalam JSON req_post
      db.query(query, [parentCode, '%end_trx":"y%'], (err, results) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`));
        }
        resolve(results.length > 0);
      });
    });
  }

}

module.exports = Penjualan;
