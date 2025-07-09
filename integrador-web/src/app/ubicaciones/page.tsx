'use client'

import React, { useState, ChangeEvent, JSX } from 'react'
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
import UbicacionEditModal from './UbicacionEditModal'
import UbicacionStepperModal from './ubicacionStepper'

type Type = 'provincia' | 'municipio' | 'sector' | 'distrito' | 'barrio'

export default function UbicacionesPage(): JSX.Element {
  const provCrud = useCrud<IProvincia>('provincias')
  const muniCrud = useCrud<IMunicipio>('municipios')
  const sectCrud = useCrud<ISector>('sectores')
  const distCrud = useCrud<IDistrito>('distritos')
  const barrCrud = useCrud<IBarrio>('barrios')

  const dataMap = {
    provincia: provCrud.allQuery.data || [],
    municipio: muniCrud.allQuery.data || [],
    sector: sectCrud.allQuery.data || [],
    distrito: distCrud.allQuery.data || [],
    barrio: barrCrud.allQuery.data || []
  } as Record<Type, any[]>

  const titleMap = {
    provincia: 'Provincias',
    municipio: 'Municipios',
    sector: 'Sectores',
    distrito: 'Distritos',
    barrio: 'Barrios'
  } as Record<Type, string>

  const headerMap = {
    provincia: ['#', 'Provincia'],
    municipio: ['#', 'Municipio', 'Provincia'],
    sector: ['#', 'Sector', 'Municipio'],
    distrito: ['#', 'Distrito', 'Sector'],
    barrio: ['#', 'Barrio', 'Distrito']
  } as Record<Type, string[]>

  const [type, setType] = useState<Type>('provincia')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [defaultData, setDefaultData] = useState<any>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<any>(null)

  const rawName = (item: any) =>
    type === 'provincia' ? item.nombre_provincia
      : type === 'municipio' ? item.nombre_municipio
        : type === 'sector' ? item.nombre_sector
          : type === 'distrito' ? item.nombre_distrito
            : item.nombre_barrio

  const rawParent = (item: any) =>
    type === 'municipio'
      ? provCrud.allQuery.data?.find(p => p._id === item.id_provincia)?.nombre_provincia
      : type === 'sector'
        ? muniCrud.allQuery.data?.find(m => m._id === item.id_municipio)?.nombre_municipio
        : type === 'distrito'
          ? sectCrud.allQuery.data?.find(s => s._id === item.id_sector)?.nombre_sector
          : type === 'barrio'
            ? distCrud.allQuery.data?.find(d => d._id === item.id_distrito)?.nombre_distrito
            : undefined

  const filtered = dataMap[type].filter(item =>
    rawName(item).toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const openCreate = (): void => {
    setDefaultData(null)
    setCreateOpen(true)
  }
  const openEdit = (item: any): void => {
    setDefaultData(item)
    setEditOpen(true)
  }
  const closeCreate = (): void => setCreateOpen(false)
  const closeEdit = (): void => setEditOpen(false)

  const openDelete = (item: any): void => {
    setToDelete(item)
    setDeleteOpen(true)
  }
  const closeDelete = (): void => setDeleteOpen(false)
  const handleDelete = (): void => {
    const crud = { provincia: provCrud, municipio: muniCrud, sector: sectCrud, distrito: distCrud, barrio: barrCrud }[type]
    if (toDelete) crud.deleteM.mutate(toDelete._id)
    closeDelete()
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
    setPage(0)
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Gestión de Ubicaciones</Typography>

      <Tabs
        value={type}
        onChange={(_, v) => { setType(v); setPage(0); setSearch('') }}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Provincias" value="provincia" />
        <Tab label="Municipios" value="municipio" />
        <Tab label="Sectores" value="sector" />
        <Tab label="Distritos" value="distrito" />
        <Tab label="Barrios" value="barrio" />
      </Tabs>

      <Box display="flex" gap={1} mb={2}>
        <TextField
          size="small"
          label={`Buscar ${titleMap[type].slice(0, -1)}`}
          value={search}
          onChange={handleSearchChange}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openCreate}>
          + Nueva {titleMap[type].slice(0, -1)}
        </Button>
      </Box>

      <Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              {headerMap[type].map(h => <TableCell key={h}>{h}</TableCell>)}
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((item, i) => (
              <TableRow key={item._id} hover>
                <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                <TableCell>{rawName(item)}</TableCell>
                {type !== 'provincia' && <TableCell>{rawParent(item)}</TableCell>}
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => openDelete(item)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, n) => setPage(n)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0) }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{ '& .MuiTablePagination-toolbar': { py: 0, minHeight: 36 } }}
        />
      </Paper>

      <UbicacionStepperModal
        open={createOpen}
        onClose={closeCreate}
        defaultData={null}
      />

      <UbicacionEditModal
        open={editOpen}
        onClose={closeEdit}
        type={type}
        defaultData={defaultData}
        provinces={provCrud.allQuery.data || []}
        municipalities={muniCrud.allQuery.data || []}
        sectors={sectCrud.allQuery.data || []}
        districts={distCrud.allQuery.data || []}
        barriosData={barrCrud.allQuery.data || []}
      />

      <Dialog open={deleteOpen} onClose={closeDelete}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> ¿Eliminar {titleMap[type].slice(0, -1)}?
        </DialogTitle>
        <DialogActions>
          <Button size="small" onClick={closeDelete}>Cancelar</Button>
          <Button size="small" color="error" variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
