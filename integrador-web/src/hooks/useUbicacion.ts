// src/hooks/useUbicacion.ts
'use client'

import { useState } from 'react'
import { ubicacionesService } from '../services/ubicacionesService'
import { useGeolocation } from './useGeolocation'

interface SaveState {
  isSaving: boolean
  error: Error | null
  success: boolean
}

export function useUbicacion() {
  const { coords, error: geoError, isLoading: geoLoading } = useGeolocation()
  const [direccion, setDireccion] = useState<string>('')
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    error: null,
    success: false
  })

  const saveUbicacion = async (): Promise<void> => {
    if (!coords) {
      setSaveState({ isSaving: false, error: new Error('Sin coordenadas'), success: false })
      return
    }

    const stored = typeof window !== 'undefined' && localStorage.getItem('auth')
    let userId: string | null = null
    if (stored) {
      try {
        userId = JSON.parse(stored).userId ?? null
      } catch {
        userId = null
      }
    }

    if (!userId) {
      setSaveState({ isSaving: false, error: new Error('Usuario no autenticado'), success: false })
      return
    }

    setSaveState({ isSaving: true, error: null, success: false })

    try {
      await ubicacionesService.create({
        userId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        direccion: direccion.trim() || undefined
      })
      setSaveState({ isSaving: false, error: null, success: true })
    } catch (err) {
      setSaveState({
        isSaving: false,
        error: err instanceof Error ? err : new Error('Error al guardar'),
        success: false
      })
    }
  }

  return {
    coords,
    geoError,
    geoLoading,
    direccion,
    setDireccion,
    saveUbicacion,
    saveState
  }
}
