import { useState, useEffect } from 'react'
import { Card, Button, Input, message, List, Spin, Tag } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { doCheckin, getCheckinRecords, CheckinRecord } from '../services/checkin'

const { TextArea } = Input

const Checkin: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [records, setRecords] = useState<CheckinRecord[]>([])
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const response = await getCheckinRecords()
      setRecords(response.checkins)
    } catch (error) {
      console.error('加载记录失败:', error)
    } finally {
      setListLoading(false)
    }
  }

  const handleCheckin = async () => {
    setLoading(true)
    try {
      await doCheckin(note)
      message.success('签到成功！')
      setNote('')
      loadRecords()
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.warning('今日已签到')
      } else {
        message.error('签到失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  return (
    <div>
      <Card title="每日签到" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <TextArea
            rows={4}
            placeholder="今天有什么想记录的？（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<CalendarOutlined />}
          onClick={handleCheckin}
          loading={loading}
          block
        >
          签到打卡
        </Button>
      </Card>

      <Card title="签到记录">
        {listLoading ? (
          <Spin />
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: '#999' }}>还没有签到记录</p>
          </div>
        ) : (
          <List
            dataSource={records}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{formatDate(item.checkin_date)}</span>
                      <Tag color="green">已签到</Tag>
                    </div>
                  }
                  description={item.note || '无备注'}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default Checkin
