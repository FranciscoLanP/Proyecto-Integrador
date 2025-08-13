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
  const [options, setOptions] = useState<Suggestion[]>(() =>
    initialSearch
      ? [
          {
            label: initialSearch,
            lat: (initialPosition as [number, number])[0],
            lng: (initialPosition as [number, number])[1]
          }
        ]
      : []
  )

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

  useEffect(() => {
    if (!inputValue || inputValue.length < 3) return

    const timer = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=do&limit=5&q=${encodeURIComponent(
          inputValue
        )}`
      )
        .then(res => res.json())
        .then((data: any[]) => {
          const seen = new Set<string>()
          const resp: Suggestion[] = []
          data.forEach(item => {
            const label = item.display_name as string
            if (!seen.has(label)) {
              seen.add(label)
              resp.push({ label, lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
            }
          })
          setOptions(prev => {
            const existing = new Set(prev.map(o => o.label))
            return [...prev, ...resp.filter(s => !existing.has(s.label))]
          })
        })
        .catch(() => {})
    }, 500)
    return () => clearTimeout(timer)
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
          if (reason === 'input') {
            setInputValue(value)
          } else if (reason === 'clear') {
            setInputValue('')
            setOptions([])
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
