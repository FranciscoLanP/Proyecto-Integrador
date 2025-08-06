// Componente principal
export { default as ModernTable } from './ModernTable';
export type { ModernTableProps, TableColumn, ColorTheme } from './ModernTable';

// Componentes de celdas
export {
    ClientCell,
    ContactCell,
    StatusChip,
    ActionButtons,
    MoneyDisplay,
    DateDisplay
} from './TableCells';

export type {
    ClientCellProps,
    ContactCellProps,
    StatusChipProps,
    ActionButtonsProps,
    MoneyDisplayProps,
    DateDisplayProps
} from './TableCells';

// Hooks personalizados
export {
    useModernTable,
    useTableSelection,
    useSorting
} from './useModernTable';

export type {
    UseModernTableOptions,
    UseModernTableReturn,
    UseTableSelectionOptions,
    UseTableSelectionReturn,
    UseSortingOptions,
    UseSortingReturn
} from './useModernTable';
export { default as modernTableStyles } from './ModernTable.module.css';
