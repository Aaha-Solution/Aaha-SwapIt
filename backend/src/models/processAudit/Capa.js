const db = require('../../config/db');

const Capa = {
  async getByObservationId(observationId) {
    const [rows] = await db.query('SELECT * FROM process_audit_capas WHERE observation_id = ?', [observationId]);
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO process_audit_capas (observation_id, root_cause, corrective_action, preventive_action, assigned_to, target_date) VALUES (?, ?, ?, ?, ?, ?)',
      [data.observation_id, data.root_cause, data.corrective_action, data.preventive_action, data.assigned_to, data.target_date]
    );
    return { id: result.insertId, ...data };
  }
};

module.exports = Capa;
