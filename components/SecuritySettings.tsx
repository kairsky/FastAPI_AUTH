"use client"

import type React from "react"

import { useState } from "react"
import { Shield, Key, Clock, AlertTriangle } from "lucide-react"
import PasswordInput from "./PasswordInput"
import { validatePassword } from "../utils/passwordValidation"

interface SecuritySettingsProps {
  onPasswordChange?: (newPassword: string) => Promise<boolean>
}

export default function SecuritySettings({ onPasswordChange }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!currentPassword || !newPassword) {
      setError("Заполните все поля")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Новые пароли не совпадают")
      return
    }

    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      setError("Новый пароль не соответствует требованиям безопасности")
      return
    }

    setLoading(true)

    try {
      if (onPasswordChange) {
        const success = await onPasswordChange(newPassword)
        if (success) {
          setMessage("Пароль успешно изменен")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          setError("Ошибка при смене пароля")
        }
      }
    } catch (error) {
      setError("Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  const securityTips = [
    "Используйте уникальный пароль для каждого аккаунта",
    "Включите двухфакторную аутентификацию",
    "Регулярно обновляйте пароли",
    "Не делитесь паролями с другими",
    "Используйте менеджер паролей",
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Настройки безопасности</h3>
              <p className="mt-1 text-sm text-gray-500">Управляйте безопасностью вашего аккаунта</p>
            </div>
          </div>
        </div>
      </div>

      {/* Смена пароля */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Key className="h-6 w-6 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900">Смена пароля</h4>
          </div>

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Текущий пароль
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Новый пароль
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Создайте новый надежный пароль"
                  showStrengthIndicator={true}
                  showGenerator={true}
                  showRequirements={true}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Подтвердите новый пароль
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Изменение..." : "Изменить пароль"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Двухфакторная аутентификация */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-gray-400" />
              <div>
                <h4 className="text-lg font-medium text-gray-900">Двухфакторная аутентификация</h4>
                <p className="text-sm text-gray-500">Дополнительный уровень защиты для вашего аккаунта</p>
              </div>
            </div>
            <button
              onClick={() => setShowTwoFactor(!showTwoFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showTwoFactor ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showTwoFactor ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showTwoFactor && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                Функция двухфакторной аутентификации будет доступна в следующих обновлениях. Пока что убедитесь, что
                используете надежный пароль.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Советы по безопасности */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h4 className="text-lg font-medium text-gray-900">Советы по безопасности</h4>
          </div>

          <div className="space-y-3">
            {securityTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
