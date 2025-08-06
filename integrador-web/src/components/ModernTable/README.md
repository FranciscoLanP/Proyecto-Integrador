# Sistema ModernTable - Guía de Uso

## Descripción

El sistema ModernTable es una solución completa y reutilizable para crear tablas modernas y atractivas en la aplicación. Incluye múltiples temas de colores, animaciones, efectos visuales y funcionalidades avanzadas.

## Estructura del Sistema

```
src/components/ModernTable/
├── ModernTable.tsx          # Componente principal de la tabla
├── ModernTable.module.css   # Estilos y animaciones
├── TableCells.tsx          # Componentes de celdas especializadas
├── useModernTable.ts       # Hooks personalizados
└── index.ts               # Exportaciones
```

## Características Principales

### 🎨 Temas de Colores Disponibles
- **purple**: Gradientes púrpura con efectos violeta
- **blue**: Tonos azules modernos con efectos glassmorphism  
- **green**: Colores verdes naturales con efectos orgánicos
- **orange**: Tonos naranjas vibrantes con efectos cálidos
- **pink**: Rosas elegantes con efectos suaves
- **teal**: Colores teal/verde azulado con efectos frescos
- **indigo**: Índigo profundo con efectos sofisticados

### ✨ Efectos Visuales
- Glassmorphism backgrounds con múltiples capas radiales
- Animaciones CSS customizadas (fadeIn, slideIn, pulseGlow, shimmer)
- Scrollbars personalizados con gradientes
- Hover effects en botones y elementos interactivos
- Headers pegajosos con efectos de sombra

### 🧩 Componentes de Celdas Especializadas

#### ClientCell
Muestra información de clientes/empleados con avatares coloridos
```tsx
<ClientCell 
  nombre="Juan Pérez"
  tipo_cliente="Individual"
  index={0}
/>
```

#### ContactCell  
Muestra información de contacto con íconos
```tsx
<ContactCell 
  telefono="(809) 555-0123"
  email="juan@email.com"
/>
```

#### StatusChip
Chips de estado con colores personalizables
```tsx
<StatusChip 
  status="Activo"
  colorMap={{
    'Activo': 'linear-gradient(45deg, #4CAF50, #8BC34A)',
    'Inactivo': 'linear-gradient(45deg, #f44336, #ff5722)'
  }}
/>
```

#### ActionButtons
Botones de acción con animaciones
```tsx
<ActionButtons
  onEdit={() => handleEdit(row)}
  onDelete={() => handleDelete(row)}
  onView={() => handleView(row)}
  customActions={[
    {
      icon: <WorkIcon fontSize="small" />,
      onClick: () => handleCustomAction(),
      color: 'linear-gradient(45deg, #673AB7, #9C27B0)',
      tooltip: 'Acción personalizada'
    }
  ]}
/>
```

#### MoneyDisplay
Formato de moneda con estilos
```tsx
<MoneyDisplay 
  amount={1500.50}
  currency="RD$"
  color="#4CAF50"
/>
```

#### DateDisplay
Formato de fechas
```tsx
<DateDisplay 
  date={new Date()}
  format="short" // o "long"
/>
```

## Hooks Incluidos

### useModernTable
Hook principal para manejar la lógica de tablas
```tsx
const {
  filteredData,
  paginatedData,
  searchQuery,
  page,
  rowsPerPage,
  handleSearchChange,
  handlePageChange,
  handleRowsPerPageChange,
  totalRows
} = useModernTable({
  data: empleados,
  searchFields: ['nombre', 'tipo_empleado', 'telefono'],
  initialRowsPerPage: 10
});
```

### useTableSelection
Para manejo de selección múltiple
```tsx
const {
  selectedItems,
  isSelected,
  isAllSelected,
  handleSelectOne,
  handleSelectAll,
  clearSelection
} = useTableSelection({
  data: empleados,
  getItemId: (item) => item._id
});
```

### useSorting
Para ordenación de columnas
```tsx
const {
  sortedData,
  sortField,
  sortOrder,
  handleSort,
  resetSort
} = useSorting({
  data: empleados,
  defaultSort: 'nombre',
  defaultOrder: 'asc'
});
```

## Ejemplo de Uso Completo

```tsx
'use client'

import React, { useState } from 'react'
import {
  ModernTable,
  useModernTable,
  ClientCell,
  ContactCell,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable'

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([])
  
  const {
    filteredData,
    paginatedData,
    searchQuery,
    page,
    rowsPerPage,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange
  } = useModernTable({
    data: empleados,
    searchFields: ['nombre', 'telefono'],
    initialRowsPerPage: 10
  });

  // Funciones adaptadoras para el componente
  const onSearchChange = (value: string) => {
    const mockEvent = { target: { value } } as React.ChangeEvent<HTMLInputElement>;
    handleSearchChange(mockEvent);
  };

  const onPageChange = (page: number) => {
    handlePageChange(null, page);
  };

  const onRowsPerPageChange = (rowsPerPage: number) => {
    const mockEvent = { target: { value: rowsPerPage.toString() } } as React.ChangeEvent<HTMLInputElement>;
    handleRowsPerPageChange(mockEvent);
  };

  const columns: TableColumn[] = [
    {
      id: 'empleado',
      label: 'Empleado',
      minWidth: 250,
      render: (value, row, index) => (
        <ClientCell 
          nombre={row.nombre}
          tipo_cliente={row.tipo_empleado}
          index={index}
        />
      )
    },
    {
      id: 'contacto',
      label: 'Contacto',
      minWidth: 200,
      render: (value, row) => (
        <ContactCell 
          telefono={row.telefono}
          email={row.correo}
        />
      )
    },
    {
      id: 'estado',
      label: 'Estado',
      minWidth: 120,
      render: (value, row) => (
        <StatusChip 
          status="Activo"
          colorMap={{
            'Activo': 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            'Inactivo': 'linear-gradient(45deg, #f44336, #ff5722)'
          }}
        />
      )
    },
    {
      id: 'acciones',
      label: 'Acciones',
      align: 'center',
      minWidth: 120,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      )
    }
  ];

  return (
    <ModernTable
      title="Gestión de Empleados"
      subtitle="Administra la información del personal"
      titleIcon="👥"
      columns={columns}
      data={paginatedData}
      searchTerm={searchQuery}
      onSearchChange={onSearchChange}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      onCreateNew={() => setModalOpen(true)}
      createButtonText="Nuevo Empleado"
      emptyMessage="No hay empleados registrados"
      searchPlaceholder="Buscar empleados..."
      colorTheme="blue" // Elige el tema que prefieras
      height={650}
    />
  );
}
```

## Guía de Temas por Sección

### Recomendaciones de Colores por Módulo:
- **Clientes**: `purple` - Elegante y profesional
- **Empleados**: `blue` - Confiable y corporativo  
- **Facturas**: `orange` - Llama la atención, importantes
- **Inventario**: `green` - Naturaleza, productos
- **Vehículos**: `indigo` - Sofisticado y técnico
- **Reparaciones**: `teal` - Fresco y técnico
- **Reportes**: `pink` - Distintivo y llamativo

## Personalización Avanzada

### Crear un Tema Personalizado
Si necesitas un tema personalizado, puedes extender las paletas de colores en `ModernTable.tsx`:

```tsx
const colorPalettes = {
  // ... temas existentes
  custom: {
    headerGradient: 'linear-gradient(135deg, #tu-color1, #tu-color2)',
    backgroundGradient: 'linear-gradient(135deg, #tu-bg1, #tu-bg2)',
    accentColor: '#tu-acento',
    buttonGradient: 'linear-gradient(45deg, #tu-boton1, #tu-boton2)',
    hoverColor: 'rgba(tu-hover-color, 0.1)',
    scrollbarGradient: 'linear-gradient(135deg, #tu-scroll1, #tu-scroll2)',
    glassEffect: [
      'radial-gradient(circle at 20% 50%, rgba(tu-glass1, 0.3) 0%, transparent 50%)',
      // ... más efectos
    ]
  }
};
```

## Migración desde Tablas Existentes

Para migrar una tabla existente:

1. Importa los componentes necesarios
2. Reemplaza la lógica de estado con `useModernTable`
3. Define las columnas usando la interfaz `TableColumn`
4. Reemplaza el JSX de la tabla con `<ModernTable>`
5. Elige un tema de color apropiado

## Ejemplo de Migración

**Antes:**
```tsx
// Código de tabla tradicional con Material-UI
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Nombre</TableCell>
      // ...
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.nombre}</TableCell>
        // ...
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Después:**
```tsx
// Usando ModernTable
<ModernTable
  title="Mi Tabla"
  columns={columns}
  data={paginatedData}
  colorTheme="blue"
  // ... otras props
/>
```

## Notas Importantes

- El sistema está optimizado para rendimiento con paginación automática
- Todos los efectos visuales son con CSS puro para mejor performance  
- Compatible con TypeScript con tipado completo
- Responsive y mobile-friendly
- Accesibilidad incluida con roles ARIA apropiados

¡El sistema ModernTable transforma tablas simples en experiencias visuales impresionantes manteniendo funcionalidad completa!
