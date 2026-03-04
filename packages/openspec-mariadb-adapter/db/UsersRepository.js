const pool = require('./pool');

class UsersRepository {
  async findByUsername(username) {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  async create({ username, hash, companyId, role = 'admin' }) {
    const sql = 'INSERT INTO users (username, hash, company_id, role) VALUES (?, ?, ?, ?)';
    return await pool.query(sql, [username, hash, companyId, role]);
  }
}

module.exports = new UsersRepository();
