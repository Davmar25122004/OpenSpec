const pool = require('./pool');

class WorkersRepository {
  async findById(id) {
    const rows = await pool.query('SELECT * FROM workers WHERE id = ?', [id]);
    return rows[0];
  }

  async findByCompany(companyId) {
    return await pool.query('SELECT * FROM workers WHERE company_id = ?', [companyId]);
  }

  async create({ id, name, companyId, department, email, phone, passwordHash, status = 'activo' }) {
    const sql = `INSERT INTO workers 
      (id, name, company_id, department, email, phone, password_hash, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, name, companyId, department, email, phone, passwordHash, status];
    return await pool.query(sql, params);
  }

  async update(id, { name, department, email, phone }) {
    const sql = 'UPDATE workers SET name = ?, department = ?, email = ?, phone = ? WHERE id = ?';
    return await pool.query(sql, [name, department, email, phone, id]);
  }

  async delete(id, companyId) {
    const sql = "DELETE FROM workers WHERE id = ? AND company_id = ?";
    const result = await pool.query(sql, [id, companyId]);
    return result.affectedRows > 0;
  }
}

module.exports = new WorkersRepository();
