import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Avatar, Descriptions, Spin } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getCurrentUser, getStoredUser } from '../services/auth'

interface UserProfile {
  id: number
  email: string
  nickname: string
  avatar_url?: string
  created_at: string
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      form.setFieldsValue({
        nickname: userData.nickname,
        email: userData.email,
      })
    } catch (error) {
      console.error('加载用户信息失败:', error)
      // 使用本地存储的用户信息
      const storedUser = getStoredUser()
      if (storedUser) {
        setUser(storedUser as UserProfile)
        form.setFieldsValue({
          nickname: storedUser.nickname,
          email: storedUser.email,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (values: any) => {
    setLoading(true)
    try {
      // TODO: 实现更新用户信息的 API 调用
      message.success('个人信息更新成功')
    } catch (error: any) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  }

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Avatar 
            size={100} 
            icon={<UserOutlined />}
            src={user.avatar_url}
            style={{ marginBottom: '16px' }}
          />
          <h2>{user.nickname}</h2>
          <p style={{ color: '#666' }}>{user.email}</p>
        </div>
      </Card>

      <Card title="个人信息">
        {loading ? (
          <Spin />
        ) : (
          <Form
            form={form}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item
              label="昵称"
              name="nickname"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="注册时间"
            >
              <Input 
                value={user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'} 
                disabled 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default Profile
