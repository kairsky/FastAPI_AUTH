"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react"
import {
  validatePassword,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  generateSecurePassword,
  passwordRequirements,
  type PasswordValidation,
} from "../utils/passwordValidation"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showStrengthIndicator?: boolean
  showGenerator?: boolean
  showRequirements?: boolean
  required?: boolean
  id?: string
  name?: string
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Введите пароль",
  showStrengthIndicator = true,
  showGenerator = false,
  showRequirements = true,
  required = false,
  id = "password",
  name = "password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState<PasswordValidation | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (value) {
      setValidation(validatePassword(value))
    } else {
      setValidation(null)
    }
  }, [value])

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16)
    onChange(newPassword)
  }

  const handleCopyPassword = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy password:", err)
      }
    }
  }

  const getStrengthWidth = (score: number) => {
    return `${(score / 4) * 100}%`
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="appearance-none block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {showGenerator && (
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Сгенерировать пароль"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={handleCopyPassword}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Скопировать пароль"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 p-1"
            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Индикатор силы пароля */}
      {showStrengthIndicator && validation && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Сила пароля:</span>
            <span
              className={`font-medium ${
                validation.score <= 1
                  ? "text-red-600"
                  : validation.score === 2
                    ? "text-yellow-600"
                    : validation.score === 3
                      ? "text-blue-600"
                      : "text-green-600"
              }`}
            >
              {getPasswordStrengthText(validation.score)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(validation.score)}`}
              style={{ width: getStrengthWidth(validation.score) }}
            />
          </div>
        </div>
      )}

      {/* Требования к паролю */}
      {showRequirements && value && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Требования к паролю:</h4>
          <div className="grid grid-cols-1 gap-1">
            {passwordRequirements.map((requirement, index) => {
              const isValid = requirement.test(value)
              return (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${isValid ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={isValid ? "text-green-600" : "text-gray-500"}>{requirement.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ошибки валидации */}
      {validation && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* Предложения */}
      {validation && validation.suggestions.length > 0 && validation.score < 4 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-blue-600">Рекомендации:</h5>
          {validation.suggestions.map((suggestion, index) => (
            <p key={index} className="text-xs text-blue-600">
              • {suggestion}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
