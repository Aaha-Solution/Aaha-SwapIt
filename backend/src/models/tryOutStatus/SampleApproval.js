const db = require('../../config/db');

const SampleApproval = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query('SELECT * FROM tryout_sample_approvals ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO tryout_sample_approvals (sample_code, pilot_batch_id, customer_or_dept, inspection_result, approved_by, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [data.sample_code, data.pilot_batch_id, data.customer_or_dept, data.inspection_result, data.approved_by, data.remarks]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = SampleApproval;
