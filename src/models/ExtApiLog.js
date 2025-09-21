const db = require('../config/database');

class ExtApiLog {
  static async create(row) {
    const columns = [
      'trx_code',
      'from_ip',
      'trx_req',
      'duration',
      'trx_resp',
      'api_target',
      'target_get',
      'target_post',
      'target_header',
      'response',
      'flag'
    ];

    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((c) => row[c] ?? null);

    const sql = `INSERT INTO extapi_log (${columns.join(', ')}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      try {
        db.query(sql, values, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result.insertId);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = ExtApiLog;


