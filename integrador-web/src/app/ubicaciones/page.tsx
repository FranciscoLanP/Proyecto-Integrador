'use client'

import React, { useState, JSX } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import { useCrud } from '../../hooks/useCrud'
import type {
  IProvincia,
  IMunicipio,
  ISector,
  IDistrito,
  IBarrio
} from '../types'
import LocationModal from './ubicacionModal'

type Type = 'provincia' | 'municipio' | 'sector' | 'distrito' | 'barrio'

export default function UbicacionesPage(): JSX.Element {
  const provCrud = useCrud<IProvincia>('provincias')
  const muniCrud = useCrud<IMunicipio>('municipios')
  const sectCrud = useCrud<ISector>('sectores')
  const distCrud = useCrud<IDistrito>('distritos')
  const barrCrud = useCrud<IBarrio>('barrios')

  const provincias = provCrud.allQuery.data || []
  const municipios = muniCrud.allQuery.data || []
  const sectores = sectCrud.allQuery.data || []
  const distritos = distCrud.allQuery.data || []
  const barrios = barrCrud.allQuery.data || []

  const [type, setType] = useState<Type>('provincia')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5)

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [defaultData, setDefaultData] = useState<any>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [deleteData, setDeleteData] = useState<any>(null)

  const openEditModal = (item: any) => {
    setDefaultData(item)
    setModalOpen(true)
  }
  const closeEditModal = () => setModalOpen(false)

  const openDeleteModal = (item: any) => {
    setDeleteData(item)
    setDeleteConfirmOpen(true)
  }
  const closeDeleteModal = () => setDeleteConfirmOpen(false)

  const getCrud = () =>
    ({
      provincia: provCrud,
      municipio: muniCrud,
      sector: sectCrud,
      distrito: distCrud,
      barrio: barrCrud
    } as Record<Type, ReturnType<typeof useCrud<any>>>)[type]

  const handleSave = (payload: any) => {
    const curd = getCrud()
    if (defaultData)
      curd.updateM.mutate({ id: defaultData._id, data: payload })
    else
      curd.createM.mutate(payload)
    closeEditModal()
  }

  const handleDelete = () => {
    const curd = getCrud()
    if (deleteData)
      curd.deleteM.mutate(deleteData._id)
    closeDeleteModal()
  }

  const dataMap = { provincia: provincias, municipio: municipios, sector: sectores, distrito: distritos, barrio: barrios }
  const titleMap = { provincia: 'Provincias', municipio: 'Municipios', sector: 'Sectores', distrito: 'Distritos', barrio: 'Barrios' }
  const headersMap = {
    provincia: ['#', 'Provincia'],
    municipio: ['#', 'Municipio', 'Provincia'],
    sector: ['#', 'Sector', 'Municipio'],
    distrito: ['#', 'Distrito', 'Sector'],
    barrio: ['#', 'Barrio', 'Distrito']
  }

  const rawName = (item: any) =>
    type === 'provincia' ? item.nombre_provincia
      : type === 'municipio' ? item.nombre_municipio
        : type === 'sector' ? item.nombre_sector
          : type === 'distrito' ? item.nombre_distrito
            : item.nombre_barrio

  const rawParent = (item: any) =>
    type === 'municipio' ? provincias.find(p => p._id === item.id_provincia)?.nombre_provincia
      : type === 'sector' ? municipios.find(m => m._id === item.id_municipio)?.nombre_municipio
        : type === 'distrito' ? sectores.find(s => s._id === item.id_sector)?.nombre_sector
          : type === 'barrio' ? distritos.find(d => d._id === item.id_distrito)?.nombre_distrito
            : undefined

  const filtered = dataMap[type].filter(item =>
    rawName(item).toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Gestión de Ubicaciones
      </Typography>

      <Tabs
        value={type}
        onChange={(_, v) => { setType(v); setPage(0); setSearchTerm('') }}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Provincias" value="provincia" />
        <Tab label="Municipios" value="municipio" />
        <Tab label="Sectores" value="sector" />
        <Tab label="Distritos" value="distrito" />
        <Tab label="Barrios" value="barrio" />
      </Tabs>

      <Box sx={{
        display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between', mb: 2
      }}>
        <TextField
          label={`Buscar ${titleMap[type].slice(0, -1)}`}
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setPage(0) }}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={() => openEditModal(undefined)} sx={{ ml: 'auto' }}>
          + Nueva {titleMap[type].slice(0, -1)}
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {titleMap[type]}
          </Typography>
        </Box>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              {headersMap[type].map(h => (
                <TableCell key={h} sx={{ fontSize: '0.85rem' }}>{h}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((item, i) => {
              const idx = page * rowsPerPage + i + 1
              return (
                <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: 'action.selected' } }}>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>{idx}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>{rawName(item)}</TableCell>
                  {type !== 'provincia' && (
                    <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>{rawParent(item)}</TableCell>
                  )}
                  <TableCell align="right" sx={{ px: 1 }}>
                    <IconButton size="small" onClick={() => openEditModal(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => openDeleteModal(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, n) => setPage(n)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0) }}
          rowsPerPageOptions={[5, 15, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            '& .MuiTablePagination-toolbar': { minHeight: 36, py: 0 },
            '& .MuiTablePagination-actions button': { p: '4px' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { fontSize: '0.8rem' }
          }}
        />
      </Paper>

      <LocationModal
        open={modalOpen}
        type={type}
        defaultData={defaultData}
        onClose={closeEditModal}
        onSubmit={handleSave}
        provinces={provincias}
        municipalities={municipios}
        sectors={sectores}
        districts={distritos}
        barriosData={barrios}
      />

      <Dialog open={deleteConfirmOpen} onClose={closeDeleteModal}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          ¿Eliminar {titleMap[type].slice(0, -1)}?
        </DialogTitle>
        <DialogActions sx={{ p: 1 }}>
          <Button size="small" onClick={closeDeleteModal}>Cancelar</Button>
          <Button size="small" color="error" variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
