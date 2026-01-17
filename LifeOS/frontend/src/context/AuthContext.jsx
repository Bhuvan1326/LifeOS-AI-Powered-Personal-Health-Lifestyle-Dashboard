import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const userData = await authService.getMe(savedToken)
          setUser(userData)
          setToken(savedToken)
        } catch (error) {
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await authService.register(userData)
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
