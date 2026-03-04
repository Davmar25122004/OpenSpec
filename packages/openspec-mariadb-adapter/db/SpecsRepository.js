const pool = require('./pool');

class SpecsRepository {
  async upsert(data) {
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(
        `INSERT INTO specs (change_id, spec_key, content)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE content = VALUES(content)`,
        [data.changeId, data.specKey, data.content]
      );
      return res.insertId;
    } finally {
      if (conn) conn.release();
    }
  }

  async getByChange(changeId) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query('SELECT * FROM specs WHERE change_id = ? ORDER BY spec_key ASC', [changeId]);
    } finally {
      if (conn) conn.release();
    }
  }

  async findByKey(changeId, specKey) {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM specs WHERE change_id = ? AND spec_key = ?', [changeId, specKey]);
      return rows[0] || null;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = new SpecsRepository();
