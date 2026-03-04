const pool = require('./pool');

class VacationRequestsRepository {
  async insert({ userId, startDate, endDate }) {
    const sql = 'INSERT INTO vacation_requests (user_id, start_date, end_date) VALUES (?, ?, ?)';
    return await pool.query(sql, [userId, startDate, endDate]);
  }

  async findByWorker(userId) {
    const sql = 'SELECT * FROM vacation_requests WHERE user_id = ? ORDER BY created_at DESC';
    return await pool.query(sql, [userId]);
  }

  async findAllPending() {
    const sql = `
      SELECT vr.*, w.name as worker_name 
      FROM vacation_requests vr
      JOIN workers w ON vr.user_id = w.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at ASC
    `;
    return await pool.query(sql);
  }

  async updateStatus(id, status) {
    const sql = 'UPDATE vacation_requests SET status = ? WHERE id = ?';
    return await pool.query(sql, [status, id]);
  }

  async findById(id) {
    const sql = 'SELECT * FROM vacation_requests WHERE id = ?';
    const rows = await pool.query(sql, [id]);
    return rows[0];
  }
}

module.exports = new VacationRequestsRepository();
