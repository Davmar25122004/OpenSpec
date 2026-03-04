const pool = require('./pool');

class ClockEventsRepository {
  async create({ user_id, event_type, timestamp, device_id, location_lat, location_lng }) {
    const sql = `
      INSERT INTO clock_events (user_id, event_type, timestamp, device_id, location_lat, location_lng)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await pool.query(sql, [
      user_id,
      event_type,
      timestamp || new Date(),
      device_id,
      location_lat,
      location_lng
    ]);
    return result;
  }

  async getLastEventForUser(user_id) {
    const sql = `
      SELECT * FROM clock_events
      WHERE user_id = ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 1
    `;
    const rows = await pool.query(sql, [user_id]);
    return rows[0];
  }

  async getLatestEvents(user_id, limit = 2) {
    const sql = `
      SELECT * FROM clock_events
      WHERE user_id = ?
      ORDER BY timestamp DESC, id DESC
      LIMIT ?
    `;
    const rows = await pool.query(sql, [user_id, limit]);
    return rows;
  }

  async getLatestForWorkers(workerIds) {
    if (!workerIds || workerIds.length === 0) return [];
    
    // We get the last event for each worker in the list
    const sql = `
      SELECT ce.*
      FROM clock_events ce
      INNER JOIN (
        SELECT user_id, MAX(timestamp) as max_ts, MAX(id) as max_id
        FROM clock_events
        WHERE user_id IN (?)
        GROUP BY user_id
      ) latest ON ce.user_id = latest.user_id AND ce.id = latest.max_id
    `;
    return await pool.query(sql, [workerIds]);
  }
}

module.exports = new ClockEventsRepository();
