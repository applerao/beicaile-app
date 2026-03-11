import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, theme } from 'antd'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Checkin from './pages/Checkin'
import Profile from './pages/Profile'
import HeaderNav from './components/HeaderNav'

const { Content } = Layout

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderNav />
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  )
}

export default App
