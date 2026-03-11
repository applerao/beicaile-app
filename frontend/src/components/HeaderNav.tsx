import { Layout, Menu, Button, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, DashboardOutlined, CalendarOutlined, LogoutOutlined } from '@ant-design/icons'
import { getStoredUser, logout } from '../services/auth'

const { Header } = Layout

const HeaderNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getStoredUser()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/checkin',
      icon: <CalendarOutlined />,
      label: '签到',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
        被裁了吗
      </div>
      
      {user && (
        <Space size="large">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderBottom: 'none', background: 'transparent' }}
          />
          
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            退出
          </Button>
        </Space>
      )}
    </Header>
  )
}

export default HeaderNav
