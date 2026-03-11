import api from './api'

export interface CheckinRecord {
  id: number
  checkin_date: string
  note?: string
  created_at: string
}

export interface CheckinStats {
  total_count: number
  current_streak: number
  longest_streak: number
  last_checkin_date: string | null
}

export interface CheckinResponse {
  message: string
  checkin: CheckinRecord
}

export interface CheckinListResponse {
  checkins: CheckinRecord[]
  pagination: {
    limit: number
    offset: number
  }
}

export interface CheckinStatsResponse {
  stats: CheckinStats
}

// 签到
export const doCheckin = async (note?: string): Promise<CheckinResponse> => {
  return await api.post('/checkin', { note })
}

// 获取签到记录
export const getCheckinRecords = async (
  limit: number = 30,
  offset: number = 0
): Promise<CheckinListResponse> => {
  return await api.get('/checkin', {
    params: { limit, offset },
  })
}

// 获取签到统计
export const getCheckinStats = async (): Promise<CheckinStatsResponse> => {
  return await api.get('/checkin/stats')
}
