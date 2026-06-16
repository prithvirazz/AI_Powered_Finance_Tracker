import type { ReactNode } from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import api from '../api/client'

type User = {
  id: number
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

type AuthResponse = {
  access_token: string
  token_type: string
  user: User
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('finsight_token')
    const storedUser = localStorage.getItem('finsight_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const saveSession = (authData: AuthResponse) => {
    localStorage.setItem('finsight_token', authData.access_token)
    localStorage.setItem('finsight_user', JSON.stringify(authData.user))

    setToken(authData.access_token)
    setUser(authData.user)
  }

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })

    saveSession(response.data)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name,
      email,
      password,
    })

    saveSession(response.data)
  }

  const logout = () => {
    localStorage.removeItem('finsight_token')
    localStorage.removeItem('finsight_user')

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}