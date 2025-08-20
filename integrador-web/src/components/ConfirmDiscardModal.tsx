'use client'

import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { ModernModal } from './ModernModal'

interface Props {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
}

export default function ConfirmDiscardModal({
    open,
    onClose,
    onConfirm,
    title = "¿Descartar cambios?",
    message = "Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?"
}: Props) {
    return (
        <ModernModal
            open={open}
            onClose={onClose}
            title={title}
        >
            <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <WarningAmberIcon
                        color="warning"
                        sx={{ fontSize: '2rem' }}
                    />
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {message}
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={2}
                    pt={2}
                    borderTop="1px solid rgba(0,0,0,0.1)"
                >
                    <Button
                        onClick={onClose}
                        sx={{
                            borderRadius: '25px',
                            minWidth: '100px'
                        }}
                    >
                        Volver
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={onConfirm}
                        sx={{
                            borderRadius: '25px',
                            minWidth: '100px',
                            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                            }
                        }}
                    >
                        Descartar
                    </Button>
                </Box>
            </Box>
        </ModernModal>
    )
}
