'use client'

import { useMemo } from 'react'


export interface JwtPayload {
  sub: string
  role: 'administrador' | 'empleado'
  iat: number
  exp: number
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

export function useJwtDecode(): {
  userId: string | null
  role: JwtPayload['role'] | null
} {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { userId: null, role: null }
    }

    const raw = localStorage.getItem('auth')
    if (!raw) {
      return { userId: null, role: null }
    }

    try {
      const { token } = JSON.parse(raw) as { token: string }
      const payload = parseJwt(token)
      if (!payload) {
        return { userId: null, role: null }
      }
      return { userId: payload.sub, role: payload.role }
    } catch {
      return { userId: null, role: null }
    }
  }, [])
}
