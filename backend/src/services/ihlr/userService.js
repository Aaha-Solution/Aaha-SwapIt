const db = require('../../config/db');

const userService = {
  async getLineEngineers() {
    const [rows] = await db.query(
      'SELECT u.id, u.name, u.email FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE r.name = "LineEngineer"'
    );
    return rows;
  }
};

module.exports = userService;
