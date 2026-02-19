import { Pool } from 'pg';

// 数据库查询辅助类
export class DatabaseHelper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // 查询单条记录
  async find(table: string, where: Record<string, any> = {}) {
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(where);
    const query = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''} LIMIT 1`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  // 查询多条记录
  async query(table: string, where: Record<string, any> = {}) {
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(where);
    const query = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''}`;
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  // 插入记录
  async insert(table: string, data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // 更新记录
  async update(table: string, where: Record<string, any>, data: Record<string, any>) {
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const whereValues = Object.values(where);
    const setClause = Object.keys(data).map((key, index) => `${key} = $${whereValues.length + index + 1}`).join(', ');
    const values = [...whereValues, ...Object.values(data)];
    const query = `UPDATE ${table} SET ${setClause} WHERE ${conditions} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // 删除记录
  async delete(table: string, where: Record<string, any>) {
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = Object.values(where);
    const query = `DELETE FROM ${table} WHERE ${conditions} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // 增加字段值
  async increment(table: string, where: Record<string, any>, column: string, amount: number = 1) {
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const whereValues = Object.values(where);
    const query = `UPDATE ${table} SET ${column} = ${column} + $${whereValues.length + 1} WHERE ${conditions} RETURNING *`;
    const result = await this.pool.query(query, [...whereValues, amount]);
    return result.rows[0];
  }

  // 减少字段值
  async decrement(table: string, where: Record<string, any>, column: string, amount: number = 1) {
    return this.increment(table, where, column, -amount);
  }

  // 分页查询
  async paginate(
    table: string,
    where: Record<string, any> = {},
    options: { page?: number; size?: number; orderBy?: string; order?: 'ASC' | 'DESC' } = {}
  ) {
    const { page = 1, size = 20, orderBy = 'id', order = 'DESC' } = options;
    const offset = (page - 1) * size;

    // 查询条件
    const conditions = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const whereValues = Object.values(where);

    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM ${table}${conditions ? ` WHERE ${conditions}` : ''}`;
    const countResult = await this.pool.query(countQuery, whereValues);
    const total = parseInt(countResult.rows[0].total);

    // 查询数据
    const dataQuery = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''} ORDER BY ${orderBy} ${order} LIMIT $${whereValues.length + 1} OFFSET $${whereValues.length + 2}`;
    const dataResult = await this.pool.query(dataQuery, [...whereValues, size, offset]);

    return {
      list: dataResult.rows,
      total,
      page,
      size,
      pages: Math.ceil(total / size),
    };
  }
}

// 从请求对象获取数据库实例
export const getDB = (req: any): DatabaseHelper => {
  if (!req.db) {
    throw new Error('数据库连接未初始化');
  }
  return new DatabaseHelper(req.db);
};
