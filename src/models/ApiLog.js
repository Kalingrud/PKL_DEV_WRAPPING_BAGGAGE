const db = require('../config/database');

class ApiLog {
  // Create new log entry
  static async create(logData) {
    return new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO api_log (
          incoming, from_ip, duration, url_method, url_hit, url_full,
          req_post, req_get, outgoing, app_response, geo_ip, geo_long, geo_lat, geo_city, agent_detect
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
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
      
      db.query(insertQuery, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      });
    });
  }

  // Get recent logs
  static async getRecentLogs(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM api_log 
        ORDER BY id DESC 
        LIMIT ?
      `;
      
      db.query(query, [limit], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get logs by filter
  static async getLogsByFilter(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM api_log WHERE 1=1';
      let params = [];
      
      if (filters.from_ip) {
        query += ' AND from_ip LIKE ?';
        params.push(`%${filters.from_ip}%`);
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
