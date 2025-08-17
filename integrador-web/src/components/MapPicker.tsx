'use client'

import React, { useState, useEffect, JSX } from 'react'
import type { LatLngExpression, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents
} from 'react-leaflet'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export interface Suggestion {
  label: string
  lat: number
  lng: number
}

interface MapPickerProps {
  initialPosition?: LatLngExpression
  initialSearch?: string
  skipInitial?: boolean
  onChange: (lat: number, lng: number, label?: string) => void
}

function Recenter({ center }: { center: LatLngExpression }): null {
  const map = useMap() as LeafletMap
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export function MapPicker({
  initialPosition = [19.317, -70.255],
  initialSearch = '',
  skipInitial = false,
  onChange
}: MapPickerProps): JSX.Element {
  const [position, setPosition] = useState<LatLngExpression>(initialPosition)
  const [inputValue, setInputValue] = useState<string>(initialSearch)
  const [options, setOptions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (skipInitial) return

    const [lat, lng] = initialPosition as [number, number]
    if (initialSearch) {
      setInputValue(initialSearch)
      setOptions([{ label: initialSearch, lat, lng }])
      onChange(lat, lng, initialSearch)
    } else {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
        .then(res => res.json())
        .then(data => {
          const label = data.display_name as string
          setInputValue(label)
          setOptions([{ label, lat, lng }])
          onChange(lat, lng, label)
        })
        .catch(() => {
          onChange(lat, lng)
        })
    }
  }, [initialPosition, initialSearch, skipInitial, onChange])

  const LocationMarker = (): JSX.Element => {
    useMapEvents({
      click(e: LeafletMouseEvent): void {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        setPosition([lat, lng])
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
          .then(res => res.json())
          .then(data => {
            const label = data.display_name as string
            setOptions(prev => [{ label, lat, lng }, ...prev.filter(o => o.label !== label)])
            setInputValue(label)
            onChange(lat, lng, label)
          })
          .catch(() => {
            onChange(lat, lng)
          })
      }
    })
    return <Marker position={position as any} />
  }

  // Efecto para la búsqueda en tiempo real
  useEffect(() => {
    console.log('Búsqueda activada para:', inputValue); // Debug log

    // Limpiar opciones si no hay suficiente texto
    if (!inputValue || inputValue.length < 3) {
      setOptions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      console.log('Ejecutando búsqueda para:', inputValue); // Debug log
      setIsLoading(true)

      try {
        // Usar proxy local para evitar CORS
        const response = await fetch(
          `/geocoding/search?format=json&countrycodes=do&limit=5&q=${encodeURIComponent(inputValue)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: any[] = await response.json()
        console.log('Respuesta de búsqueda:', data); // Debug log

        const seen = new Set<string>()
        const resp: Suggestion[] = []
        data.forEach(item => {
          const label = item.display_name as string
          if (!seen.has(label)) {
            seen.add(label)
            resp.push({ label, lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
          }
        })

        // Reemplazar completamente las opciones
        setOptions(resp)
        setIsLoading(false)
        console.log('Opciones actualizadas:', resp); // Debug log
      } catch (error) {
        console.error('Error en búsqueda:', error); // Debug log
        setOptions([])
        setIsLoading(false)
      }
    }, 300) // Reducir delay para mejor responsividad

    return () => {
      clearTimeout(timer)
      setIsLoading(false)
    }
  }, [inputValue])

  return (
    <Box>
      <Autocomplete<Suggestion, false, false, true>
        freeSolo
        clearOnEscape
        options={options}
        getOptionLabel={opt => (typeof opt === 'string' ? opt : opt.label)}
        filterOptions={x => x}
        inputValue={inputValue}
        onInputChange={(_, value, reason) => {
          console.log('Input change:', { value, reason }); // Debug log
          if (reason === 'input') {
            setInputValue(value)
            // Si el texto se vacía o es muy corto, limpiar opciones inmediatamente
            if (!value || value.length < 3) {
              setOptions([])
              setIsLoading(false)
            }
          } else if (reason === 'clear') {
            setInputValue('')
            setOptions([])
            setIsLoading(false)
            const [lat, lng] = initialPosition as [number, number]
            onChange(lat, lng)
          }
        }}
        onChange={(_, value, reason) => {
          if (reason === 'clear') {
            setInputValue('')
            setOptions([])
            const [lat, lng] = initialPosition as [number, number]
            onChange(lat, lng)
          } else if (value && typeof value !== 'string') {
            setPosition([value.lat, value.lng])
            setInputValue(value.label)
            onChange(value.lat, value.lng, value.label)
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            label="Buscar ubicación en RD"
            size="small"
            fullWidth
            margin="dense"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <div style={{ padding: '8px' }}>🔍</div> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: 300, width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={position} />
        <LocationMarker />
      </MapContainer>
    </Box>
  )
}
