const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, location, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, phone, passwordHash, location }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, location) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, passwordHash, location || 'Chennai']
    );
    return { id: result.insertId, name, email, phone, location };
  },

  async getAll({ limit = 10, offset = 0 } = {}) {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, location, status, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }
};

module.exports = User;
