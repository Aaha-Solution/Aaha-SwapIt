const db = require('../../config/db');

const TrialRun = {
  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query('SELECT * FROM tryout_trial_runs ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO tryout_trial_runs (trial_code, tool_mold_number, component_name, parameters, result, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.trial_code, data.tool_mold_number, data.component_name, JSON.stringify(data.parameters || {}), data.result, data.status]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = TrialRun;
