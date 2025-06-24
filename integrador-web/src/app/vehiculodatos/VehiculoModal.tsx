'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    IconButton,
    Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type {
    IVehiculoDatos,
    ICliente,
    IModelosDatos,
    IColoresDatos
} from '../types'

interface Props {
    open: boolean
    onClose: () => void
    onSubmit: (data: Partial<IVehiculoDatos>) => void
    defaultData?: IVehiculoDatos
    clientes: ICliente[]
    modelos: IModelosDatos[]
    colores: IColoresDatos[]
}

export default function VehiculoModal({
    open,
    onClose,
    onSubmit,
    defaultData,
    clientes,
    modelos,
    colores
}: Props) {
    const [chasis, setChasis] = useState('')
    const [clienteId, setClienteId] = useState('')
    const [modeloId, setModeloId] = useState('')
    const [colorId, setColorId] = useState('')

    const [chasisError, setChasisError] = useState('')

    const handleChasisChange = (v: string) => {
        const val = v.toUpperCase().replace(/\s+/g, '')
        setChasis(val)
        setChasisError(val.length < 5 ? 'Chasis muy corto' : '')
    }

    useEffect(() => {
        if (open) {
            setChasis(defaultData?.chasis ?? '')
            setClienteId(defaultData?.id_cliente?.toString() ?? '')
            setModeloId(defaultData?.id_modelo?.toString() ?? '')
            setColorId(defaultData?.id_color?.toString() ?? '')
            setChasisError('')
        } else {
            setChasis('')
            setClienteId('')
            setModeloId('')
            setColorId('')
        }
    }, [open, defaultData])

    const disabledSave =
        !chasis.trim() ||
        !clienteId ||
        !modeloId ||
        !colorId ||
        !!chasisError

    const handleSave = () => {
        if (!disabledSave) {
            onSubmit({
                chasis,
                id_cliente: clienteId,
                id_modelo: modeloId,
                id_color: colorId
            })
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ position: 'relative', pr: 6 }}>
                {defaultData ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Chasis"
                        value={chasis}
                        onChange={e => handleChasisChange(e.target.value)}
                        error={!!chasisError}
                        helperText={chasisError}
                        required
                        fullWidth
                    />

                    <TextField
                        select
                        label="Cliente"
                        value={clienteId}
                        onChange={e => setClienteId(e.target.value)}
                        required
                        fullWidth
                    >
                        {clientes.map(c => (
                            <MenuItem key={c._id} value={c._id}>{c.nombre}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Modelo"
                        value={modeloId}
                        onChange={e => setModeloId(e.target.value)}
                        required
                        fullWidth
                    >
                        {modelos.map(m => (
                            <MenuItem key={m._id} value={m._id}>{m.nombre_modelo}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Color"
                        value={colorId}
                        onChange={e => setColorId(e.target.value)}
                        required
                        fullWidth
                    >
                        {colores.map(c => (
                            <MenuItem key={c._id} value={c._id}>{c.nombre_color}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    disabled={disabledSave}
                    onClick={handleSave}
                >
                    {defaultData ? 'Guardar cambios' : 'Crear Vehículo'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
