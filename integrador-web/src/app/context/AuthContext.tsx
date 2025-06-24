'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Auth {
  username: string
  role: 'administrador' | 'empleado'
}

interface AuthContextType {
  auth: Auth | null
  login: (username: string, role: Auth['role']) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) setAuth(JSON.parse(stored))
  }, [])

  const login = (username: string, role: Auth['role']) => {
    const a = { username, role }
    localStorage.setItem('auth', JSON.stringify(a))
    setAuth(a)
    router.push('/')      
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setAuth(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
