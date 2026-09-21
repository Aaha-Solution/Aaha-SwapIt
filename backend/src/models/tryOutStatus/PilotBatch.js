const db = require('../../config/db');

const PilotBatch = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query('SELECT * FROM tryout_pilot_batches ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO tryout_pilot_batches (pilot_code, trial_run_id, batch_size, production_line, yield_percentage) VALUES (?, ?, ?, ?, ?)',
      [data.pilot_code, data.trial_run_id, data.batch_size, data.production_line, data.yield_percentage]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = PilotBatch;
