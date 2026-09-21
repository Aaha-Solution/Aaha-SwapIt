const db = require('../../config/db');

const Scrap = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query('SELECT * FROM ihlr_scraps ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO ihlr_scraps (scrap_code, part_number, quantity, cost, notes) VALUES (?, ?, ?, ?, ?)',
      [data.scrap_code, data.part_number, data.quantity, data.cost, data.notes]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = Scrap;
