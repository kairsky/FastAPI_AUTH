"use client"

import { AuthProvider } from "../contexts/AuthContext"
import AppRouter from "../components/AppRouter"
import "./globals.css"

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
      </div>
    </AuthProvider>
  )
}
