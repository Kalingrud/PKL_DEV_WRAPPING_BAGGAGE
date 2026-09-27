const db = require('../config/database');

class WrapPrice {
  // Get price list by terminal code
  static getByTerminalCode(terminal_code, callback) {
    const query = `
      SELECT id, terminal_code, pack_type, name, price, flag 
      FROM wrap_price 
      WHERE terminal_code = ?
    `;
    
    db.query(query, [terminal_code], callback);
  }

  // Get all prices
  static getAll(callback) {
    const query = `
      SELECT id, terminal_code, pack_type, name, price, flag 
      FROM wrap_price
    `;
    
    db.query(query, callback);
  }
}

module.exports = WrapPrice;

