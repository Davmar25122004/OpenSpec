const pool = require('./pool');

class ChangesRepository {
  async findById(id) {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM changes WHERE id = ?', [id]);
      return rows[0] || null;
    } finally {
      if (conn) conn.release();
    }
  }

  async create(data) {
    let conn;
    try {
      conn = await pool.getConnection();
      const meta = data.meta ? JSON.stringify(data.meta) : null;
      await conn.query(
        `INSERT INTO changes (id, name, schema_name, schema_version, status, created_by, meta)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name=VALUES(name), status=VALUES(status), meta=VALUES(meta)`,
        [data.id, data.name, data.schema_name || 'spec-driven', data.schema_version || '1.0', data.status || 'open', data.created_by, meta]
      );
    } finally {
      if (conn) conn.release();
    }
  }

  async updateStatus(id, status) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query('UPDATE changes SET status = ? WHERE id = ?', [status, id]);
    } finally {
      if (conn) conn.release();
    }
  }

  async archive(id) {
    return this.updateStatus(id, 'archived');
  }

  async list() {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query('SELECT * FROM changes ORDER BY created_at DESC');
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = new ChangesRepository();
