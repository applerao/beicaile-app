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
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.password_hash, data.nickname]
    );
    return result.rows[0];
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
    const result = await query(
      `UPDATE users 
       SET nickname = COALESCE($2, nickname),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.nickname, data.avatar_url]
    );
    return result.rows[0] || null;
  }
}
