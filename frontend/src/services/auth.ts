import api from './api'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  nickname: string
}

export interface User {
  id: number
  email: string
  nickname: string
  avatar_url?: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

// 用户登录
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', params)
  if (response.token) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  return response
}

// 用户注册
export const register = async (params: RegisterParams): Promise<{ message: string; user: User }> => {
  return await api.post('/auth/register', params)
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  return await api.get('/users/me')
}

// 退出登录
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 获取存储的用户信息
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    return JSON.parse(userStr)
  }
  return null
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}
