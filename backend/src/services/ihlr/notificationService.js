const db = require('../../config/db');

const notificationService = {
  async getIhlrNotifications(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE module = "ihlr" AND (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return rows;
  }
};

module.exports = notificationService;
