'use client'

import { useState, useEffect } from 'react'

export interface Coords {
  latitude: number
  longitude: number
}

export interface GeolocationResult {
  coords: Coords | null
  error: string | null
  isLoading: boolean
}

export function useGeolocation(): GeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation no soportado por este navegador')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )
  }, [])

  return { coords, error, isLoading }
}
