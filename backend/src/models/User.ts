import { query } from '../config/database';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  nickname: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password_hash: string;
  nickname: string;
}

export class UserModel {
  static async create(data: CreateUserDTO): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, nickname)
       VALUES ($1, $2, $3)`,
      [data.email, data.password_hash, data.nickname]
    );
    
    // Get the inserted user by ID (SQLite doesn't support RETURNING *)
    const userId = result.lastInsertRowid || result.rowCount;
    const user = await this.findById(userId as number);
    
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }
    
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, data: Partial<User>): Promise<User | null> {
    await query(
      `UPDATE users 
       SET nickname = COALESCE($2, nickname),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id, data.nickname, data.avatar_url]
    );
    
    // Return the updated user
    return await this.findById(id);
  }
}
