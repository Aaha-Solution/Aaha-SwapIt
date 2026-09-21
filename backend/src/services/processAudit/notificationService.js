const db = require('../../config/db');

const notificationService = {
  async getAuditNotifications(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE module = "processAudit" AND (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return rows;
  }
};

module.exports = notificationService;
