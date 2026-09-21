const db = require('../config/db');

const Permission = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM permissions');
    return rows;
  },

  async getRolePermissions(roleId) {
    const [rows] = await db.query(
      'SELECT p.* FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?',
      [roleId]
    );
    return rows;
  }
};

module.exports = Permission;
