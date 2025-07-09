'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { useCrud } from '../../hooks/useCrud'
import type {
  IProvincia,
  IMunicipio,
  ISector,
  IDistrito,
  IBarrio
} from '../types'

const steps = ['Provincia','Municipio','Sector','Distrito','Barrio'] as const

interface Props {
  open: boolean
  onClose: () => void
  defaultData?: any
}

export default function UbicacionStepperModal({
  open,
  onClose,
  defaultData
}: Props) {
  const provCrud = useCrud<IProvincia>('provincias')
  const muniCrud = useCrud<IMunicipio>('municipios')
  const sectCrud = useCrud<ISector>('sectores')
  const distCrud = useCrud<IDistrito>('distritos')
  const barrCrud = useCrud<IBarrio>('barrios')

  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState(false)

  const [provId, setProvId] = useState<string>('')
  const [provName, setProvName] = useState('')
  const [muniId, setMuniId] = useState<string>('')
  const [muniName, setMuniName] = useState('')
  const [sectId, setSectId] = useState<string>('')
  const [sectName, setSectName] = useState('')
  const [distId, setDistId] = useState<string>('')
  const [distName, setDistName] = useState('')
  const [barrId, setBarrId] = useState<string>('')
  const [barrName, setBarrName] = useState('')

  useEffect(() => {
    if (!open) return
    setError(false)
    if (defaultData) {
      setProvId(defaultData.id_provincia ?? defaultData._id ?? '')
      setProvName(defaultData.nombre_provincia ?? '')
      setMuniId(defaultData.id_municipio ?? '')
      setMuniName(defaultData.nombre_municipio ?? '')
      setSectId(defaultData.id_sector ?? '')
      setSectName(defaultData.nombre_sector ?? '')
      setDistId(defaultData.id_distrito ?? '')
      setDistName(defaultData.nombre_distrito ?? '')
      setBarrId(defaultData._id ?? '')
      setBarrName(defaultData.nombre_barrio ?? '')
    } else {
      setProvId('');   setProvName('')
      setMuniId('');   setMuniName('')
      setSectId('');   setSectName('')
      setDistId('');   setDistName('')
      setBarrId('');   setBarrName('')
    }
    setActiveStep(0)
  }, [open, defaultData])

  const handleNext = () => {
    setError(false)
    switch (activeStep) {
      case 0:
        if (!provName.trim()) { setError(true); return }
        break
      case 1:
        if (!muniName.trim()) { setError(true); return }
        break
      case 2:
        if (!sectName.trim()) { setError(true); return }
        break
      case 3:
        if (!distName.trim()) { setError(true); return }
        break
      case 4:
        if (!barrName.trim()) { setError(true); return }
        break
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setError(false)
    if (activeStep > 0) setActiveStep(prev => prev - 1)
    else onClose()
  }

  const handleSave = async () => {
    if (![provName, muniName, sectName, distName, barrName].every(s => s.trim())) {
      setError(true)
      return
    }

    let newProvId = provId
    if (newProvId) {
      await provCrud.updateM.mutateAsync({
        id: newProvId,
        data: { nombre_provincia: provName }
      })
    } else {
      const res = await provCrud.createM.mutateAsync({
        nombre_provincia: provName
      })
      newProvId = res._id
    }

    let newMuniId = muniId
    if (newMuniId) {
      await muniCrud.updateM.mutateAsync({
        id: newMuniId,
        data: { id_provincia: newProvId, nombre_municipio: muniName }
      })
    } else {
      const res = await muniCrud.createM.mutateAsync({
        id_provincia: newProvId,
        nombre_municipio: muniName
      })
      newMuniId = res._id
    }

    let newSectId = sectId
    if (newSectId) {
      await sectCrud.updateM.mutateAsync({
        id: newSectId,
        data: { id_municipio: newMuniId, nombre_sector: sectName }
      })
    } else {
      const res = await sectCrud.createM.mutateAsync({
        id_municipio: newMuniId,
        nombre_sector: sectName
      })
      newSectId = res._id
    }

    let newDistId = distId
    if (newDistId) {
      await distCrud.updateM.mutateAsync({
        id: newDistId,
        data: { id_sector: newSectId, nombre_distrito: distName }
      })
    } else {
      const res = await distCrud.createM.mutateAsync({
        id_sector: newSectId,
        nombre_distrito: distName
      })
      newDistId = res._id
    }

    if (barrId) {
      await barrCrud.updateM.mutateAsync({
        id: barrId,
        data: { id_distrito: newDistId, nombre_barrio: barrName }
      })
    } else {
      await barrCrud.createM.mutateAsync({
        id_distrito: newDistId,
        nombre_barrio: barrName
      })
    }

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position:'relative', pr:6 }}>
        { defaultData ? 'Editar Ubicación' : 'Nueva Ubicación' }
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position:'absolute', right:8, top:8 }}
        >
          <CloseIcon fontSize="small"/>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb:3 }}>
          {steps.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        <Box display="flex" flexDirection="column" gap={2}>
          {activeStep === 0 && (
            <TextField
              label="Provincia"
              value={provName}
              onChange={e => setProvName(e.target.value)}
              error={error}
              helperText={error && 'Requerido'}
              fullWidth
            />
          )}

          {activeStep === 1 && (
            <>
              <TextField
                label="Provincia"
                value={provName}
                disabled
                fullWidth
              />
              <TextField
                label="Municipio"
                value={muniName}
                onChange={e => setMuniName(e.target.value)}
                error={error}
                helperText={error && 'Requerido'}
                fullWidth
              />
            </>
          )}

          {activeStep === 2 && (
            <>
              <TextField
                label="Municipio"
                value={muniName}
                disabled
                fullWidth
              />
              <TextField
                label="Sector"
                value={sectName}
                onChange={e => setSectName(e.target.value)}
                error={error}
                helperText={error && 'Requerido'}
                fullWidth
              />
            </>
          )}

          {activeStep === 3 && (
            <>
              <TextField
                label="Sector"
                value={sectName}
                disabled
                fullWidth
              />
              <TextField
                label="Distrito"
                value={distName}
                onChange={e => setDistName(e.target.value)}
                error={error}
                helperText={error && 'Requerido'}
                fullWidth
              />
            </>
          )}

          {activeStep === 4 && (
            <>
              <TextField
                label="Distrito"
                value={distName}
                disabled
                fullWidth
              />
              <TextField
                label="Barrio"
                value={barrName}
                onChange={e => setBarrName(e.target.value)}
                error={error}
                helperText={error && 'Requerido'}
                fullWidth
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleBack}>
          {activeStep > 0 ? 'Anterior' : 'Cancelar'}
        </Button>
        {activeStep < steps.length - 1
          ? <Button variant="contained" onClick={handleNext}>Siguiente</Button>
          : <Button variant="contained" onClick={handleSave}>Guardar</Button>
        }
      </DialogActions>
    </Dialog>
  )
}
