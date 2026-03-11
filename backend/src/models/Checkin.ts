import { query } from '../config/database';

export interface Checkin {
  id: number;
  user_id: number;
  checkin_date: Date;
  note?: string;
  created_at: Date;
}

export interface CreateCheckinDTO {
  user_id: number;
  note?: string;
}

export class CheckinModel {
  static async create(data: CreateCheckinDTO): Promise<Checkin> {
    const result = await query(
      `INSERT INTO checkins (user_id, checkin_date, note)
       VALUES ($1, CURRENT_DATE, $2)
       RETURNING *`,
      [data.user_id, data.note]
    );
    return result.rows[0];
  }

  static async findByUserIdAndDate(
    userId: number,
    date: string
  ): Promise<Checkin | null> {
    const result = await query(
      `SELECT * FROM checkins 
       WHERE user_id = $1 AND checkin_date = $2::date`,
      [userId, date]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(
    userId: number,
    limit: number = 30,
    offset: number = 0
  ): Promise<Checkin[]> {
    const result = await query(
      `SELECT * FROM checkins 
       WHERE user_id = $1 
       ORDER BY checkin_date DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getStats(userId: number): Promise<{
    total_count: number;
    current_streak: number;
    longest_streak: number;
    last_checkin_date: Date | null;
  }> {
    const result = await query(
      `SELECT 
         COUNT(*) as total_count,
         (SELECT checkin_date FROM checkins 
          WHERE user_id = $1 
          ORDER BY checkin_date DESC 
          LIMIT 1) as last_checkin_date
       FROM checkins 
       WHERE user_id = $1`,
      [userId]
    );
    
    const stats = result.rows[0];
    
    // 计算连续签到天数
    const streakResult = await query(
      `WITH consecutive_checkins AS (
         SELECT checkin_date,
                checkin_date - (ROW_NUMBER() OVER (ORDER BY checkin_date))::int as grp
         FROM checkins
         WHERE user_id = $1
         ORDER BY checkin_date DESC
       )
       SELECT COUNT(*) as streak
       FROM consecutive_checkins
       WHERE grp = (SELECT grp FROM consecutive_checkins LIMIT 1)`,
      [userId]
    );

    return {
      total_count: parseInt(stats.total_count, 10),
      current_streak: parseInt(streakResult.rows[0]?.streak || 0, 10),
      longest_streak: 0, // 需要更复杂的查询
      last_checkin_date: stats.last_checkin_date,
    };
  }
}
