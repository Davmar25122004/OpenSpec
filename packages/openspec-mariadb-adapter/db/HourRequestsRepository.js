const pool = require('./pool');

class HourRequestsRepository {
  async insert({ userId, date, startTime, endTime, type }) {
    const sql = 'INSERT INTO hour_requests (user_id, date, start_time, end_time, type) VALUES (?, ?, ?, ?, ?)';
    return await pool.query(sql, [userId, date, startTime, endTime, type]);
  }

  async findByWorker(userId) {
    const sql = 'SELECT * FROM hour_requests WHERE user_id = ? ORDER BY created_at DESC';
    return await pool.query(sql, [userId]);
  }

  async findAllPending() {
    const sql = `
      SELECT hr.*, w.name as worker_name 
      FROM hour_requests hr
      JOIN workers w ON hr.user_id = w.id
      WHERE hr.status = 'pending'
      ORDER BY hr.created_at ASC
    `;
    return await pool.query(sql);
  }

  async updateStatus(id, status) {
    const sql = 'UPDATE hour_requests SET status = ? WHERE id = ?';
    return await pool.query(sql, [status, id]);
  }

  async findById(id) {
    const sql = 'SELECT * FROM hour_requests WHERE id = ?';
    const rows = await pool.query(sql, [id]);
    return rows[0];
  }
}

module.exports = new HourRequestsRepository();
