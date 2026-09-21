const db = require('../../config/db');

const userService = {
  async getAuditors() {
    const [rows] = await db.query(
      'SELECT u.id, u.name, u.email FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE r.name = "Auditor"'
    );
    return rows;
  }
};

module.exports = userService;
