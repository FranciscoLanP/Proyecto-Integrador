'use client'

import React, { createContext, ReactNode, useContext, useState, useCallback, JSX } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

interface Notification {
  message: string
  severity?: AlertColor
}

interface NotificationContextValue {
  notify: (message: string, severity?: AlertColor) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [notification, setNotification] = useState<Notification>({ message: '', severity: 'info' })

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setNotification({ message, severity })
    setOpen(true)
  }, [])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification debe usarse dentro de NotificationProvider')
  return ctx
}
