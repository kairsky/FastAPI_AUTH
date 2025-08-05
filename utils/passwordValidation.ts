export interface PasswordValidation {
  isValid: boolean
  score: number // 0-4 (очень слабый - очень сильный)
  errors: string[]
  suggestions: string[]
}

export interface PasswordRequirement {
  test: (password: string) => boolean
  message: string
  weight: number
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    test: (password: string) => password.length >= 8,
    message: "Минимум 8 символов",
    weight: 1,
  },
  {
    test: (password: string) => password.length >= 12,
    message: "Рекомендуется 12+ символов",
    weight: 0.5,
  },
  {
    test: (password: string) => /[a-z]/.test(password),
    message: "Строчные буквы (a-z)",
    weight: 1,
  },
  {
    test: (password: string) => /[A-Z]/.test(password),
    message: "Заглавные буквы (A-Z)",
    weight: 1,
  },
  {
    test: (password: string) => /[0-9]/.test(password),
    message: "Цифры (0-9)",
    weight: 1,
  },
  {
    test: (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    message: "Специальные символы (!@#$%^&*)",
    weight: 1,
  },
  {
    test: (password: string) => !/(.)\1{2,}/.test(password),
    message: "Без повторяющихся символов подряд",
    weight: 0.5,
  },
  {
    test: (password: string) => !/(123|abc|qwe|password|admin)/i.test(password),
    message: "Без простых последовательностей",
    weight: 0.5,
  },
]

export const commonPasswords = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "dragon",
  "master",
  "hello",
  "freedom",
  "whatever",
  "qazwsx",
  "trustno1",
]

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0
  let maxScore = 0

  // Проверяем каждое требование
  passwordRequirements.forEach((requirement) => {
    maxScore += requirement.weight
    if (requirement.test(password)) {
      score += requirement.weight
    } else {
      errors.push(requirement.message)
    }
  })

  // Проверяем на популярные пароли
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Пароль слишком популярный")
    score -= 1
  }

  // Дополнительные проверки
  if (password.length < 6) {
    errors.push("Пароль слишком короткий")
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    suggestions.push("Используйте комбинацию букв и цифр")
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    suggestions.push("Добавьте специальные символы для большей безопасности")
  }

  if (password.length < 12) {
    suggestions.push("Рассмотрите возможность использования более длинного пароля")
  }

  // Нормализуем счет от 0 до 4
  const normalizedScore = Math.max(0, Math.min(4, Math.round((score / maxScore) * 4)))

  return {
    isValid: errors.length === 0 && normalizedScore >= 2,
    score: normalizedScore,
    errors,
    suggestions,
  }
}

export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "Очень слабый"
    case 2:
      return "Слабый"
    case 3:
      return "Средний"
    case 4:
      return "Сильный"
    default:
      return "Неизвестно"
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "bg-red-500"
    case 2:
      return "bg-yellow-500"
    case 3:
      return "bg-blue-500"
    case 4:
      return "bg-green-500"
    default:
      return "bg-gray-300"
  }
}

export function generateSecurePassword(length = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols
  let password = ""

  // Гарантируем наличие каждого типа символов
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Заполняем остальные позиции
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Перемешиваем символы
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
