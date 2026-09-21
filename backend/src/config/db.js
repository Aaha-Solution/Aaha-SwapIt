const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0
});

pool.getConnection()
  .then((conn) => {
    console.log('[DB] Connected to MySQL database successfully.');
    conn.release();
  })
  .catch((err) => {
    console.warn('[DB Warning] MySQL connection failed. Please ensure MySQL is running: ' + err.message);
  });

module.exports = pool;
