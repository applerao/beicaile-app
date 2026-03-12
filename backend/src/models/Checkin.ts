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
    await query(
      `INSERT INTO checkins (user_id, checkin_date, note)
       VALUES ($1, DATE('now'), $2)`,
      [data.user_id, data.note]
    );
    
    // Get the inserted checkin by ID (SQLite doesn't support RETURNING *)
    const checkinId = (await query('SELECT last_insert_rowid() as id')).rows[0].id;
    const checkin = await this.findById(checkinId);
    
    if (!checkin) {
      throw new Error('Failed to retrieve created checkin');
    }
    
    return checkin;
  }

  static async findById(id: number): Promise<Checkin | null> {
    const result = await query(
      'SELECT * FROM checkins WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserIdAndDate(
    userId: number,
    date: string
  ): Promise<Checkin | null> {
    const result = await query(
      `SELECT * FROM checkins 
       WHERE user_id = $1 AND date(checkin_date) = date($2)`,
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
       WHERE user_id = $2`,
      [userId, userId]
    );
    
    const stats = result.rows[0] || { total_count: 0, last_checkin_date: null };
    
    // 计算连续签到天数（简化版，兼容 SQLite）
    const allCheckins = await this.findByUserId(userId, 365);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (allCheckins.length > 0) {
      const dates = allCheckins.map(c => new Date(c.checkin_date).toISOString().split('T')[0]).sort().reverse();
      
      // 计算当前连续签到
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      // 计算最长连续签到
      for (let i = 0; i < dates.length; i++) {
        tempStreak = 1;
        for (let j = i + 1; j < dates.length; j++) {
          const prevDate = new Date(dates[j - 1]);
          const currDate = new Date(dates[j]);
          const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            break;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }

    return {
      total_count: parseInt(stats.total_count, 10) || 0,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_checkin_date: stats.last_checkin_date ? new Date(stats.last_checkin_date) : null,
    };
  }
}
