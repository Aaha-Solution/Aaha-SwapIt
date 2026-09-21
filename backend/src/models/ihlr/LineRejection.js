const db = require('../../config/db');

const LineRejection = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query('SELECT * FROM ihlr_line_rejections ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO ihlr_line_rejections (part_number, part_name, line_name, rejection_qty, reason, shift, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.part_number, data.part_name, data.line_name, data.rejection_qty, data.reason, data.shift, data.reported_by]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = LineRejection;
