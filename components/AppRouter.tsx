"use client"

import { useAuth } from "../contexts/AuthContext"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"
import Dashboard from "./Dashboard"
import UserProfile from "./UserProfile"
import { useState } from "react"

type Page = "login" | "register" | "dashboard" | "profile"

export default function AppRouter() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">FastAPI Auth System</h2>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setCurrentPage("login")}
              className={`px-4 py-2 rounded-md ${
                currentPage === "login" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setCurrentPage("register")}
              className={`px-4 py-2 rounded-md ${
                currentPage === "register" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Регистрация
            </button>
          </div>

          {currentPage === "login" && <LoginForm />}
          {currentPage === "register" && <RegisterForm />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">FastAPI Auth System</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === "dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Главная
                </button>
                <button
                  onClick={() => setCurrentPage("profile")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === "profile" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Настройки
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Привет, {user.username}!</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "profile" && <UserProfile />}
      </main>
    </div>
  )
}

function LogoutButton() {
  const { logout } = useAuth()

  return (
    <button
      onClick={logout}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      Выйти
    </button>
  )
}
