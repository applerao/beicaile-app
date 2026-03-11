import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Spin, Empty } from 'antd'
import { CalendarOutlined, FireOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getCheckinStats } from '../services/checkin'
import { getStoredUser } from '../services/auth'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_count: 0,
    current_streak: 0,
    longest_streak: 0,
    last_checkin_date: null,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await getCheckinStats()
      setStats(response.stats)
    } catch (error) {
      console.error('加载统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  }

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <h1>欢迎回来，{user?.nickname}！</h1>
        <p style={{ color: '#666' }}>记录职场变化，掌握行业动态</p>
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总签到次数"
              value={stats.total_count}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前连续签到"
              value={stats.current_streak}
              suffix="天"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="最长连续签到"
              value={stats.longest_streak}
              suffix="天"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px', textAlign: 'center' }}>
        <Empty 
          description={
            <span>
              <p>开始你的第一次签到吧！</p>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/checkin')}
                style={{ marginTop: '16px' }}
              >
                立即签到
              </Button>
            </span>
          } 
        />
      </Card>
    </div>
  )
}

export default Dashboard
