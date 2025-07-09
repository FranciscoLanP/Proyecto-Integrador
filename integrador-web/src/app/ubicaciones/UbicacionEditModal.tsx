'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useCrud } from '../../hooks/useCrud'
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
  type: Type
  defaultData: any
  provinces: IProvincia[]
  municipalities: IMunicipio[]
  sectors: ISector[]
  districts: IDistrito[]
  barriosData: IBarrio[]
}

export default function UbicacionEditModal({
  open,
  onClose,
  type,
  defaultData,
  provinces,
  municipalities,
  sectors,
  districts,
  barriosData
}: Props) {
  const provCrud = useCrud<IProvincia>('provincias')
  const muniCrud = useCrud<IMunicipio>('municipios')
  const sectCrud = useCrud<ISector>('sectores')
  const distCrud = useCrud<IDistrito>('distritos')
  const barrCrud = useCrud<IBarrio>('barrios')

  const [provId, setProvId] = useState<string>('')
  const [provName, setProvName] = useState<string>('')
  const [muniId, setMuniId] = useState<string>('')
  const [muniName, setMuniName] = useState<string>('')
  const [sectId, setSectId] = useState<string>('')
  const [sectName, setSectName] = useState<string>('')
  const [distId, setDistId] = useState<string>('')
  const [distName, setDistName] = useState<string>('')
  const [barrId, setBarrId] = useState<string>('')
  const [barrName, setBarrName] = useState<string>('')

  useEffect(() => {
    if (!open || !defaultData) return

    let pId: string = ''
    let pName: string = ''
    if (type === 'provincia') {
      pId = defaultData._id
      pName = defaultData.nombre_provincia
    } else if (defaultData.id_provincia) {
      pId = defaultData.id_provincia
    }
    const prov = provinces.find(p => p._id === pId)
    if (prov) pName = prov.nombre_provincia

    let mId: string = ''
    let mName: string = ''
    if (type === 'municipio') {
      mId = defaultData._id
      mName = defaultData.nombre_municipio
    } else {
      const first = municipalities.find(m => m.id_provincia === pId)
      if (first) {
        mId = first._id
        mName = first.nombre_municipio
      }
    }

    let sId: string = ''
    let sName: string = ''
    if (type === 'sector') {
      sId = defaultData._id
      sName = defaultData.nombre_sector
    } else {
      const first = sectors.find(s => s.id_municipio === mId)
      if (first) {
        sId = first._id
        sName = first.nombre_sector
      }
    }

    let dId: string = ''
    let dName: string = ''
    if (type === 'distrito') {
      dId = defaultData._id
      dName = defaultData.nombre_distrito
    } else {
      const first = districts.find(d => d.id_sector === sId)
      if (first) {
        dId = first._id
        dName = first.nombre_distrito
      }
    }

    let bId: string = ''
    let bName: string = ''
    if (type === 'barrio') {
      bId = defaultData._id
      bName = defaultData.nombre_barrio
    } else {
      const first = barriosData.find(b => b.id_distrito === dId)
      if (first) {
        bId = first._id
        bName = first.nombre_barrio
      }
    }

    setProvId(pId); setProvName(pName)
    setMuniId(mId); setMuniName(mName)
    setSectId(sId); setSectName(sName)
    setDistId(dId); setDistName(dName)
    setBarrId(bId); setBarrName(bName)

  }, [open, defaultData, provinces, municipalities, sectors, districts, barriosData])

  const handleSave = (): void => {
    if (provId) provCrud.updateM.mutate({ id: provId, data: { nombre_provincia: provName } })
    if (muniId) muniCrud.updateM.mutate({ id: muniId, data: { id_provincia: provId, nombre_municipio: muniName } })
    if (sectId) sectCrud.updateM.mutate({ id: sectId, data: { id_municipio: muniId, nombre_sector: sectName } })
    if (distId) distCrud.updateM.mutate({ id: distId, data: { id_sector: sectId, nombre_distrito: distName } })
    if (barrId) barrCrud.updateM.mutate({ id: barrId, data: { id_distrito: distId, nombre_barrio: barrName } })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        Editar ubicación completa
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>

          <TextField
            label="Provincia"
            value={provName}
            onChange={e => setProvName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Municipio"
            value={muniName}
            onChange={e => setMuniName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Sector"
            value={sectName}
            onChange={e => setSectName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Distrito"
            value={distName}
            onChange={e => setDistName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Barrio"
            value={barrName}
            onChange={e => setBarrName(e.target.value)}
            fullWidth
          />

        </Box>
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={onClose}>Cerrar</Button>
        <Button size="small" variant="contained" onClick={handleSave}>Guardar</Button>
      </DialogActions>
    </Dialog>
  )
}
