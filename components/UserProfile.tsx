"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import PasswordInput from "./PasswordInput"
import { validatePassword } from "../utils/passwordValidation"

export default function UserProfile() {
  const { user, checkAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || "",
    username: user?.username || "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const getAccessToken = async (): Promise<string | null> => {
    try {
      // Сначала пробуем получить токен из cookies напрямую
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift()
        return null
      }

      const accessToken = getCookie("access_token")

      if (accessToken) {
        console.log("✅ Токен найден в cookies")
        return accessToken
      }

      // Если токена нет, пробуем получить через API
      console.log("🔍 Токен не найден в cookies, пробуем получить через API...")

      const response = await fetch("http://localhost:8000/auth/token", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Токен получен через API")
        return data.access_token
      }

      console.log("❌ Не удалось получить токен")
      return null
    } catch (error) {
      console.error("❌ Ошибка получения токена:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const updateData: any = {}

      if (formData.email !== user?.email) {
        updateData.email = formData.email
      }

      if (formData.username !== user?.username) {
        updateData.username = formData.username
      }

      if (formData.password) {
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
          setError("Новый пароль не соответствует требованиям безопасности")
          setLoading(false)
          return
        }
        updateData.password = formData.password
      }

      if (Object.keys(updateData).length === 0) {
        setError("Нет изменений для сохранения")
        setLoading(false)
        return
      }

      console.log("🔍 Отправка данных для обновления:", updateData)

      const accessToken = await getAccessToken()

      if (!accessToken) {
        setError("Токен аутентификации не найден. Пожалуйста, войдите снова.")
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:8000/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      })

      console.log("📝 Статус ответа:", response.status)

      if (response.ok) {
        const updatedUser = await response.json()
        console.log("✅ Профиль обновлен:", updatedUser)
        setMessage("Профиль успешно обновлен!")
        setIsEditing(false)
        setFormData({ ...formData, password: "" })
        await checkAuth() // Обновляем данные пользователя
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Ошибка обновления:", errorData)

        if (response.status === 401) {
          setError("Сессия истекла. Пожалуйста, войдите снова.")
        } else {
          setError(errorData.detail || "Ошибка обновления профиля")
        }
      }
    } catch (error) {
      console.error("❌ Ошибка сети:", error)
      setError("Ошибка сети. Проверьте подключение к серверу.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || "",
      username: user?.username || "",
      password: "",
    })
    setIsEditing(false)
    setMessage("")
    setError("")
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Пользователь не найден. Пожалуйста, войдите снова.</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Мой профиль</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Управление личными данными</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Редактировать
              </button>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Новый пароль (оставьте пустым, если не хотите менять)
                </label>
                <div className="mt-1">
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(value) => setFormData({ ...formData, password: value })}
                    placeholder="Введите новый пароль"
                    showStrengthIndicator={true}
                    showGenerator={true}
                    showRequirements={true}
                    required={false}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.id}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Имя пользователя</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.username}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Статус</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user?.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user?.is_active ? "Активен" : "Неактивен"}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Дата регистрации</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.created_at ? new Date(user.created_at).toLocaleString("ru-RU") : "Не указана"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
