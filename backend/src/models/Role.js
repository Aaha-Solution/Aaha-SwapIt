const db = require('../config/db');

const Role = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM roles');
    return rows;
  },

  async findByName(name) {
    const [rows] = await db.query('SELECT * FROM roles WHERE name = ?', [name]);
    return rows[0] || null;
  },

  async getUserRoles(userId) {
    const [rows] = await db.query(
      'SELECT r.* FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      [userId]
    );
    return rows;
  }
};

module.exports = Role;
