import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('lexagent_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data)
      }).catch(() => {
        localStorage.removeItem('lexagent_token')
        setToken(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password })
    const { token: t, email: e, name } = res.data
    localStorage.setItem('lexagent_token', t)
    setToken(t)
    setUser({ email: e, name })
    return res.data
  }

  const signup = async (email, password, name) => {
    const res = await axios.post(`${API}/auth/signup`, { email, password, name })
    const { token: t, email: e } = res.data
    localStorage.setItem('lexagent_token', t)
    setToken(t)
    setUser({ email: e, name })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('lexagent_token')
    setToken(null)
    setUser(null)
  }

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, authHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)