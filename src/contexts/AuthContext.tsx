import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  isAdmin: boolean
  adminEmail: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('admin-session')
    if (session) {
      try {
        const { email, token } = JSON.parse(session)
        if (email && token) {
          setIsAdmin(true)
          setAdminEmail(email)
        }
      } catch {
        localStorage.removeItem('admin-session')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call your custom SQL login function
      const { data, error } = await supabase.rpc('admin_login', {
        input_email: email,
        input_password: password
      })

      if (error || !data || data.length === 0) {
        console.error('Login failed:', error)
        return false
      }

      // Store session
      const token = btoa(email + Date.now())
      localStorage.setItem('admin-session', JSON.stringify({ email, token }))
      setIsAdmin(true)
      setAdminEmail(email)
      return true

    } catch (err) {
      console.error('Login error:', err)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('admin-session')
    setIsAdmin(false)
    setAdminEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, adminEmail, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}