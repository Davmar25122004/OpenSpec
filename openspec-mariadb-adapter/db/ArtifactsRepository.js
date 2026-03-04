const pool = require('./pool');

class ArtifactsRepository {
  async upsertArtifact(data) {
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(
        `INSERT INTO artifacts (change_id, artifact_id, status, output_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), output_path = VALUES(output_path)`,
        [data.changeId, data.artifactId, data.status || 'pending', data.outputPath]
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
      return await conn.query('SELECT * FROM artifacts WHERE change_id = ?', [changeId]);
    } finally {
      if (conn) conn.release();
    }
  }

  async markDone(changeId, artifactId) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query(
        'UPDATE artifacts SET status = "done" WHERE change_id = ? AND artifact_id = ?',
        [changeId, artifactId]
      );
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = new ArtifactsRepository();
