const db = require('../../config/db');

const notificationService = {
  async getTryOutNotifications(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE module = "tryOutStatus" AND (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return rows;
  }
};

module.exports = notificationService;
