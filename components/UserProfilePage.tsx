"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Briefcase,
  Calendar,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
} from "lucide-react"
import type React from "react"

interface UserProfile {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  birth_date?: string
  bio?: string
  avatar_url?: string
  location?: string
  website?: string
  company?: string
  job_title?: string
  profile_visibility: string
  show_email: boolean
  show_phone: boolean
  show_birth_date: boolean
  created_at: string
  profile_updated_at: string
  last_login?: string
}

interface ProfileStats {
  profile_completeness: {
    percentage: number
    completed_fields: number
    total_fields: number
  }
  account_age_days: number
  days_since_last_update: number
  last_login?: string
  profile_visibility: string
  privacy_settings: {
    show_email: boolean
    show_phone: boolean
    show_birth_date: boolean
  }
}

export default function UserProfilePage() {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "stats">("profile")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
    bio: "",
    location: "",
    website: "",
    company: "",
    job_title: "",
  })

  const [privacyData, setPrivacyData] = useState({
    profile_visibility: "public",
    show_email: false,
    show_phone: false,
    show_birth_date: false,
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:3000/profile/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          birth_date: data.birth_date || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          company: data.company || "",
          job_title: data.job_title || "",
        })
        setPrivacyData({
          profile_visibility: data.profile_visibility,
          show_email: data.show_email,
          show_phone: data.show_phone,
          show_birth_date: data.show_birth_date,
        })
      } else {
        setError("Ошибка загрузки профиля")
      }
    } catch (error) {
      setError("Ошибка сети")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/profile/stats/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("http://localhost:8000/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage("Профиль успешно обновлен!")
        setEditing(false)
        await fetchProfile()
        await fetchStats()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Ошибка обновления профиля")
      }
    } catch (error) {
      setError("Ошибка сети")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("http://localhost:8000/profile/me/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(privacyData),
      })

      if (response.ok) {
        setMessage("Настройки приватности обновлены!")
        await fetchProfile()
        await fetchStats()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Ошибка обновления настроек")
      }
    } catch (error) {
      setError("Ошибка сети")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/profile/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        setMessage("Аватар успешно загружен!")
        await fetchProfile()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Ошибка загрузки аватара")
      }
    } catch (error) {
      setError("Ошибка сети")
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm("Вы уверены, что хотите удалить аватар?")) return

    try {
      const response = await fetch("http://localhost:8000/profile/me/avatar", {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Аватар удален!")
        await fetchProfile()
      } else {
        setError("Ошибка удаления аватара")
      }
    } catch (error) {
      setError("Ошибка сети")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка профиля...</div>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center text-red-600">Профиль не найден</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={`http://localhost:8000${profile.avatar_url}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : profile.username}
                </h1>
                <p className="text-gray-500">@{profile.username}</p>
                {profile.job_title && profile.company && (
                  <p className="text-sm text-gray-600">
                    {profile.job_title} в {profile.company}
                  </p>
                )}
              </div>
            </div>
            {profile.avatar_url && (
              <button onClick={handleDeleteAvatar} className="text-red-600 hover:text-red-800 text-sm">
                Удалить аватар
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Сообщения */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Табы */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Профиль
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "privacy"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Приватность
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stats"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Статистика
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Вкладка Профиль */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Информация о профиле</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Редактировать</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Сохранение..." : "Сохранить"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          first_name: profile.first_name || "",
                          last_name: profile.last_name || "",
                          phone: profile.phone || "",
                          birth_date: profile.birth_date || "",
                          bio: profile.bio || "",
                          location: profile.location || "",
                          website: profile.website || "",
                          company: profile.company || "",
                          job_title: profile.job_title || "",
                        })
                      }}
                      className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Отмена</span>
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Имя</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Фамилия</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Телефон</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Дата рождения</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Местоположение</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Веб-сайт</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Компания</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Должность</label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">О себе</label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">О себе</h4>
                      <p className="mt-1 text-gray-900">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{profile.email}</span>
                      </div>
                    )}

                    {profile.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{profile.phone}</span>
                      </div>
                    )}

                    {profile.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{profile.location}</span>
                      </div>
                    )}

                    {profile.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}

                    {profile.company && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{profile.company}</span>
                      </div>
                    )}

                    {profile.job_title && (
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{profile.job_title}</span>
                      </div>
                    )}

                    {profile.birth_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(profile.birth_date).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Вкладка Приватность */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Настройки приватности</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Видимость профиля</label>
                  <select
                    value={privacyData.profile_visibility}
                    onChange={(e) => setPrivacyData({ ...privacyData, profile_visibility: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">Публичный - виден всем</option>
                    <option value="private">Приватный - виден только мне</option>
                    <option value="friends">Друзья - виден только друзьям</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Показывать в профиле:</h4>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacyData.show_email}
                      onChange={(e) => setPrivacyData({ ...privacyData, show_email: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-900">Email адрес</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacyData.show_phone}
                      onChange={(e) => setPrivacyData({ ...privacyData, show_phone: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-900">Номер телефона</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacyData.show_birth_date}
                      onChange={(e) => setPrivacyData({ ...privacyData, show_birth_date: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-900">Дата рождения</span>
                  </label>
                </div>

                <button
                  onClick={handleSavePrivacy}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить настройки"}
                </button>
              </div>
            </div>
          )}

          {/* Вкладка Статистика */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Статистика профиля</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Заполненность профиля</p>
                      <p className="text-2xl font-semibold text-blue-900">{stats.profile_completeness.percentage}%</p>
                      <p className="text-xs text-blue-600">
                        {stats.profile_completeness.completed_fields} из {stats.profile_completeness.total_fields} полей
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Дней с регистрации</p>
                      <p className="text-2xl font-semibold text-green-900">{stats.account_age_days}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Edit3 className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Дней с обновления</p>
                      <p className="text-2xl font-semibold text-yellow-900">{stats.days_since_last_update}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Информация об аккаунте</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Видимость профиля:</span>
                    <span className="font-medium">
                      {stats.profile_visibility === "public"
                        ? "Публичный"
                        : stats.profile_visibility === "private"
                          ? "Приватный"
                          : "Друзья"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Последний вход:</span>
                    <span className="font-medium">
                      {stats.last_login ? new Date(stats.last_login).toLocaleString("ru-RU") : "Никогда"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Показывать email:</span>
                    <span className="font-medium">{stats.privacy_settings.show_email ? "Да" : "Нет"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Показывать телефон:</span>
                    <span className="font-medium">{stats.privacy_settings.show_phone ? "Да" : "Нет"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Показывать дату рождения:</span>
                    <span className="font-medium">{stats.privacy_settings.show_birth_date ? "Да" : "Нет"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
