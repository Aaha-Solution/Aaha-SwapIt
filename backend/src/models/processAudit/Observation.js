const db = require('../../config/db');

const Observation = {
  async getByRequestId(requestId) {
    const [rows] = await db.query('SELECT * FROM process_audit_observations WHERE request_id = ?', [requestId]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO process_audit_observations (request_id, category, severity, description, photo_url) VALUES (?, ?, ?, ?, ?)',
      [data.request_id, data.category, data.severity, data.description, data.photo_url]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = Observation;
