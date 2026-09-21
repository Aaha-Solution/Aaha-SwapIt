const db = require('../../config/db');

const RootCause = {
  async getByRejectionId(rejectionId) {
    const [rows] = await db.query('SELECT * FROM ihlr_root_causes WHERE rejection_id = ?', [rejectionId]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO ihlr_root_causes (rejection_id, five_why_analysis, fishbone_category, root_cause_detail) VALUES (?, ?, ?, ?)',
      [data.rejection_id, JSON.stringify(data.five_why_analysis || {}), data.fishbone_category, data.root_cause_detail]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = RootCause;
