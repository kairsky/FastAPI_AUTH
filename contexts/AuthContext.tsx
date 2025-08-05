"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = "http://localhost:8000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      console.log("🔍 Проверка аутентификации...")

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("📝 Статус проверки аутентификации:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ Аутентификация успешна:", userData)
        setUser(userData)
      } else if (response.status === 401) {
        console.log("🔒 Пользователь не аутентифицирован")
        setUser(null)
      } else {
        console.log("❌ Проверка аутентификации не удалась со статусом:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Ошибка сети при проверке аутентификации:", error)
      setUser(null)

      // Проверяем, работает ли сервер
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          mode: "cors",
        })
        if (healthResponse.ok) {
          console.log("✅ Сервер работает")
        } else {
          console.error("❌ Проверка здоровья сервера не удалась")
        }
      } catch (healthError) {
        console.error("❌ Сервер не отвечает:", healthError)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("🔍 Попытка входа для пользователя:", username)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      console.log("📝 Статус входа:", response.status)

      if (response.ok) {
        console.log("✅ Вход успешен, проверяем аутентификацию...")
        await checkAuth()
        return true
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Вход не удался:", errorData)
        return false
      }
    } catch (error) {
      console.error("❌ Ошибка сети при входе:", error)
      return false
    }
  }

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      console.log("🔍 Попытка регистрации с данными:", { email, username })

      // Проверяем, что сервер доступен
      const healthCheck = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        mode: "cors",
      })

      if (!healthCheck.ok) {
        console.error("❌ Сервер недоступен")
        return false
      }

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({ email, username, password }),
      })

      console.log("📝 Статус регистрации:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ Регистрация успешна:", userData)
        return true
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Регистрация не удалась:", errorData)
        return false
      }
    } catch (error) {
      console.error("❌ Ошибка сети при регистрации:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("❌ Ошибка при выходе:", error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
