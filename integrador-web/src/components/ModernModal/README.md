# ModernModal Component

Un componente de modal moderno y elegante que se integra con el sistema de temas de personalización de la aplicación.

## Características

- 🎨 **Temas dinámicos**: Se adapta automáticamente al color seleccionado en "Personalización"
- ✨ **Efectos glassmorphism**: Fondo translúcido con efecto de vidrio
- 🎭 **Animaciones suaves**: Transiciones elegantes al abrir/cerrar
- 📱 **Responsive**: Se adapta a diferentes tamaños de pantalla
- 🔧 **Altamente personalizable**: Props para controlar apariencia y comportamiento

## Uso Básico

```tsx
import { ModernModal } from '../../components/ModernModal'

<ModernModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Mi Modal"
  titleIcon="🎯"
  actions={
    <>
      <Button onClick={handleCancel}>Cancelar</Button>
      <Button variant="contained" onClick={handleSave}>
        Guardar
      </Button>
    </>
  }
>
  <TextField
    fullWidth
    label="Campo de ejemplo"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</ModernModal>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controla si el modal está abierto |
| `onClose` | `() => void` | - | Función llamada al cerrar el modal |
| `title` | `string` | - | Título del modal |
| `titleIcon` | `string` | `'✨'` | Emoji o icono para el título |
| `children` | `ReactNode` | - | Contenido del modal |
| `actions` | `ReactNode` | - | Botones de acción (opcional) |
| `maxWidth` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | Ancho máximo del modal |
| `fullWidth` | `boolean` | `true` | Si debe ocupar todo el ancho disponible |
| `showCloseButton` | `boolean` | `true` | Mostrar botón X para cerrar |
| `colorTheme` | `ColorTheme` | - | Forzar un tema específico (opcional) |

## Temas de Color Disponibles

- `purple` (por defecto)
- `blue`
- `green`
- `orange`
- `pink`
- `teal`
- `indigo`

El tema se selecciona automáticamente basado en la configuración de "Personalización", pero puede ser sobrescrito con la prop `colorTheme`.

## Ejemplo Completo

```tsx
'use client'

import React, { useState } from 'react'
import { TextField, Button } from '@mui/material'
import { ModernModal } from '../../components/ModernModal'

export default function MiComponente() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const handleSave = () => {
    // Lógica de guardado
    console.log('Guardando:', value)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>

      <ModernModal
        open={open}
        onClose={() => setOpen(false)}
        title="Formulario de Ejemplo"
        titleIcon="📝"
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={!value.trim()}
            >
              Guardar
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          label="Ingresa un valor"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px'
            }
          }}
        />
      </ModernModal>
    </>
  )
}
```

## Estilo Recomendado para TextFields

Para evitar que los labels se "traguen" en el header con gradiente, usa este estilo en todos los TextFields dentro de ModernModal:

```tsx
sx={{
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
        borderWidth: '2px'
      }
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
      }
    }
  },
  '& .MuiInputLabel-root': {
    zIndex: 10,
    '&.Mui-focused': {
      zIndex: 10
    }
  },
  '& .MuiInputLabel-shrink': {
    zIndex: 10,
    transform: 'translate(14px, -9px) scale(0.75)'
  }
}}
```

## Integración con Temas

El componente detecta automáticamente el color principal configurado en el contexto de tema y aplica la paleta correspondiente:

- `#667eea` → Purple theme
- `#2196F3` → Blue theme  
- `#4CAF50` → Green theme
- `#FF9800` → Orange theme
- `#E91E63` → Pink theme
- `#009688` → Teal theme
- `#3f51b5` → Indigo theme
