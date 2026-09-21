const db = require('../config/db');

const UserRole = {
  async assignRole(userId, roleId) {
    const [result] = await db.query(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
    return result;
  },

  async removeRole(userId, roleId) {
    const [result] = await db.query(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
    return result;
  }
};

module.exports = UserRole;
