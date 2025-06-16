'use client'

import React, { useState, useEffect, JSX } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import type {
  IProvincia,
  IMunicipio,
  ISector,
  IDistrito,
  IBarrio
} from '../types'

type Type = 'provincia' | 'municipio' | 'sector' | 'distrito' | 'barrio'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  onDelete?: () => void
  type: Type
  defaultData?: any
  provinces?: IProvincia[]
  municipalities?: IMunicipio[]
  sectors?: ISector[]
  districts?: IDistrito[]
  barriosData?: IBarrio[]
}

export default function LocationModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  type,
  defaultData,
  provinces = [],
  municipalities = [],
  sectors = [],
  districts = [],
  barriosData = []
}: Props): JSX.Element {
  const [name, setName] = useState<string>('')
  const [parent, setParent] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)

  useEffect(() => {
    if (!open) return
    setShowError(false)
    if (defaultData) {
      switch (type) {
        case 'provincia':
          setName(defaultData.nombre_provincia)
          break
        case 'municipio':
          setName(defaultData.nombre_municipio)
          setParent(defaultData.id_provincia)
          break
        case 'sector':
          setName(defaultData.nombre_sector)
          setParent(defaultData.id_municipio)
          break
        case 'distrito':
          setName(defaultData.nombre_distrito)
          setParent(defaultData.id_sector)
          break
        case 'barrio':
          setName(defaultData.nombre_barrio)
          setParent(defaultData.id_distrito)
          break
      }
    } else {
      setName('')
      setParent('')
    }
  }, [open, defaultData, type])

  const titleMap = {
    provincia: 'Provincia',
    municipio: 'Municipio',
    sector:    'Sector',
    distrito:  'Distrito',
    barrio:    'Barrio'
  } as const

  const parentLabel = {
    municipio:  'Provincia',
    sector:     'Municipio',
    distrito:   'Sector',
    barrio:     'Distrito'
  } as const

  const parentOptions = 
    type === 'municipio' ? provinces :
    type === 'sector'    ? municipalities :
    type === 'distrito'  ? sectors :
    type === 'barrio'    ? districts :
    []

  const tryClose = () => onClose()

  const handleSave = () => {
    if (!name.trim() || (type !== 'provincia' && !parent)) {
      setShowError(true)
      return
    }
    const payload: any = {}
    switch (type) {
      case 'provincia':
        payload.nombre_provincia = name.trim()
        break
      case 'municipio':
        payload.nombre_municipio = name.trim()
        payload.id_provincia     = parent
        break
      case 'sector':
        payload.nombre_sector    = name.trim()
        payload.id_municipio     = parent
        break
      case 'distrito':
        payload.nombre_distrito  = name.trim()
        payload.id_sector        = parent
        break
      case 'barrio':
        payload.nombre_barrio    = name.trim()
        payload.id_distrito      = parent
        break
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={tryClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m:0, p:2, fontSize:'1rem', fontWeight:500 }}>
        {defaultData ? `Editar ${titleMap[type]}` : `Crear ${titleMap[type]}`}
        <IconButton
          aria-label="close"
          onClick={tryClose}
          sx={{ position:'absolute', right:8, top:8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p:2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            autoFocus
            size="small"
            label={titleMap[type]}
            value={name}
            onChange={e => { setName(e.target.value); setShowError(false) }}
            error={showError && !name.trim()}
            helperText={showError && !name.trim() ? 'Requerido' : ''}
          />

          {type !== 'provincia' && (
            <TextField
              select
              size="small"
              label={parentLabel[type]}
              value={parent}
              onChange={e => { setParent(e.target.value); setShowError(false) }}
              error={showError && !parent}
              helperText={showError && !parent ? 'Requerido' : ''}
            >
              {parentOptions.map(opt => (
                <MenuItem key={opt._id} value={opt._id}>
                  {type === 'municipio'
                    ? (opt as IProvincia).nombre_provincia
                    : type === 'sector'
                    ? (opt as IMunicipio).nombre_municipio
                    : type === 'distrito'
                    ? (opt as ISector).nombre_sector
                    : (opt as IDistrito).nombre_distrito}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p:1 }}>
        {defaultData && onDelete && (
          <Button size="small" color="error" onClick={onDelete}>
            <WarningAmberIcon fontSize="small" sx={{ mr:0.5 }} />
            Eliminar
          </Button>
        )}
        <Button size="small" onClick={tryClose}>Cancelar</Button>
        <Button size="small" variant="contained" onClick={handleSave}>
          {defaultData ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
