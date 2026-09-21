const db = require('../../config/db');

const Request = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query(
      'SELECT r.*, u.name as auditor_name FROM process_audit_requests r LEFT JOIN users u ON r.auditor_id = u.id ORDER BY r.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM process_audit_requests WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO process_audit_requests (request_number, department, audit_type, auditor_id, scheduled_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [data.request_number, data.department, data.audit_type, data.auditor_id, data.scheduled_date, data.notes]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = Request;
