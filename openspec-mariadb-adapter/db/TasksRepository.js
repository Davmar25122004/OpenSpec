const pool = require('./pool');

class TasksRepository {
  async getByChange(changeId) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query('SELECT * FROM tasks WHERE change_id = ? ORDER BY order_index ASC', [changeId]);
    } finally {
      if (conn) conn.release();
    }
  }

  async getPending(changeId) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query('SELECT * FROM tasks WHERE change_id = ? AND done = FALSE AND skipped = FALSE ORDER BY order_index ASC', [changeId]);
    } finally {
      if (conn) conn.release();
    }
  }

  async markDone(taskId, executor = null) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query(
        'UPDATE tasks SET done = TRUE, finished_at = NOW(), executor = ? WHERE id = ?',
        [executor, taskId]
      );
    } finally {
      if (conn) conn.release();
    }
  }

  async markSkipped(taskId, executor = null) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query(
        'UPDATE tasks SET skipped = TRUE, finished_at = NOW(), executor = ? WHERE id = ?',
        [executor, taskId]
      );
    } finally {
      if (conn) conn.release();
    }
  }

  async create(data) {
    let conn;
    try {
      conn = await pool.getConnection();
      const meta = data.meta ? JSON.stringify(data.meta) : null;
      const res = await conn.query(
        `INSERT INTO tasks (change_id, title, description, done, skipped, order_index, meta)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.changeId, data.title, data.description, data.done || false, data.skipped || false, data.orderIndex || 0, meta]
      );
      return res.insertId;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = new TasksRepository();
