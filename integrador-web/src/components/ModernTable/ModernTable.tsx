import React, { ReactNode } from 'react';
import {
    Box,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Typography,
    TextField,
    Button,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '../../app/context/ThemeContext';
import styles from './ModernTable.module.css';

// Definir paletas de colores
export type ColorTheme = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo';

const colorPalettes = {
    purple: {
        headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        accentColor: '#667eea',
        buttonGradient: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
        hoverColor: 'rgba(102, 126, 234, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(120, 199, 255, 0.3) 0%, transparent 50%)'
        ]
    },
    blue: {
        headerGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        backgroundGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        accentColor: '#2196F3',
        buttonGradient: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
        hoverColor: 'rgba(33, 150, 243, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(30, 60, 114, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(42, 82, 152, 0.3) 0%, transparent 50%)'
        ]
    },
    green: {
        headerGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        backgroundGradient: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
        accentColor: '#4CAF50',
        buttonGradient: 'linear-gradient(45deg, #4CAF50 30%, #388e3c 90%)',
        hoverColor: 'rgba(76, 175, 80, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(17, 153, 142, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(56, 239, 125, 0.3) 0%, transparent 50%)'
        ]
    },
    orange: {
        headerGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        backgroundGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
        accentColor: '#FF9800',
        buttonGradient: 'linear-gradient(45deg, #FF9800 30%, #f57c00 90%)',
        hoverColor: 'rgba(255, 152, 0, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(255, 152, 0, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(245, 87, 108, 0.3) 0%, transparent 50%)'
        ]
    },
    pink: {
        headerGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        backgroundGradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
        accentColor: '#E91E63',
        buttonGradient: 'linear-gradient(45deg, #E91E63 30%, #c2185b 90%)',
        hoverColor: 'rgba(233, 30, 99, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(233, 30, 99, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(255, 236, 210, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(252, 182, 159, 0.3) 0%, transparent 50%)'
        ]
    },
    teal: {
        headerGradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        backgroundGradient: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
        accentColor: '#009688',
        buttonGradient: 'linear-gradient(45deg, #009688 30%, #00695c 90%)',
        hoverColor: 'rgba(0, 150, 136, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(0, 150, 136, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(68, 160, 141, 0.3) 0%, transparent 50%)'
        ]
    },
    indigo: {
        headerGradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
        backgroundGradient: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
        accentColor: '#3f51b5',
        buttonGradient: 'linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)',
        hoverColor: 'rgba(63, 81, 181, 0.1)',
        scrollbarGradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
        glassEffect: [
            'radial-gradient(circle at 20% 50%, rgba(63, 81, 181, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(102, 125, 182, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(0, 130, 200, 0.3) 0%, transparent 50%)'
        ]
    }
};

export interface Column {
    id: string;
    label: string;
    icon?: ReactNode;
    align?: 'left' | 'center' | 'right';
    minWidth?: number;
    render?: (value: any, row: any, index: number) => ReactNode;
}

export interface ModernTableProps {
    title: string;
    subtitle?: string;
    columns: Column[];
    data: any[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onCreateNew?: () => void;
    createButtonText?: string;
    emptyMessage?: string;
    emptySubMessage?: string;
    searchPlaceholder?: string;
    titleIcon?: string;
    height?: number;
    minWidth?: number;
    filterComponent?: React.ReactNode;
}

const ModernTable: React.FC<ModernTableProps> = ({
    title,
    subtitle,
    columns,
    data,
    searchTerm,
    onSearchChange,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onCreateNew,
    createButtonText = 'Crear Nuevo',
    emptyMessage = 'No hay elementos para mostrar',
    emptySubMessage,
    searchPlaceholder = 'Buscar...',
    titleIcon = '🎯',
    height = 400,
    minWidth = 900,
    filterComponent
}) => {
    const { currentTheme } = useTheme();

    const paginated = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <Box sx={{
            p: 3,
            background: currentTheme.colors.background,
            minHeight: '100vh',
            position: 'relative'
        }}
            className={styles.fadeIn}>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
          radial-gradient(600px circle at 0% 0%, ${currentTheme.colors.primary}15 0%, transparent 40%),
          radial-gradient(800px circle at 100% 100%, ${currentTheme.colors.secondary}15 0%, transparent 40%)
        `,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <Box sx={{
                mb: 4,
                textAlign: 'center',
                background: currentTheme.headerGradient,
                borderRadius: '20px',
                p: 3,
                color: 'white',
                boxShadow: `0 8px 32px ${currentTheme.colors.primary}37`,
                position: 'relative',
                zIndex: 1
            }}
                className={styles.fadeIn}>
                <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {titleIcon} {title}
                </Typography>
                {subtitle && (
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>

            <Paper sx={{
                p: 2,
                mb: 3,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                position: 'relative',
                zIndex: 1
            }}
                className={styles.slideIn}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label={`🔍 ${searchPlaceholder}`}
                        size="small"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                    {filterComponent}
                    {onCreateNew && (
                        <Button
                            variant="contained"
                            onClick={onCreateNew}
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                py: 1.5,
                                background: currentTheme.buttonGradient,
                                boxShadow: `0 3px 5px 2px ${currentTheme.colors.primary}30`,
                                '&:hover': {
                                    background: currentTheme.buttonGradient,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px 2px ${currentTheme.colors.primary}40`,
                                },
                                transition: 'all 0.3s ease-in-out'
                            }}
                        >
                            ✨ {createButtonText}
                        </Button>
                    )}
                </Box>
            </Paper>

            <Paper sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 1
            }}
                className={styles.fadeIn}>
                <Box sx={{
                    height: height,
                    overflow: 'auto'
                }}
                    className={styles.customScrollbar}>
                    <Box sx={{ minWidth: minWidth, overflowX: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            sx={{
                                                background: currentTheme.headerGradient,
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.95rem',
                                                py: 2,
                                                minWidth: column.minWidth
                                            }}
                                        >
                                            {column.icon} {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.map((row, index) => (
                                    <TableRow
                                        key={row._id || row.id || index}
                                        sx={{
                                            '&:hover': {
                                                background: `linear-gradient(90deg, ${currentTheme.colors.primary}10 0%, ${currentTheme.colors.primary}10 100%)`,
                                                transform: 'scale(1.01)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                            },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                sx={{ py: 2 }}
                                            >
                                                {column.render
                                                    ? column.render(row[column.id], row, index)
                                                    : row[column.id]
                                                }
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                opacity: 0.6
                                            }}>
                                                <Typography variant="h6" sx={{ mb: 1, color: '#718096' }}>
                                                    🔍 {emptyMessage}
                                                </Typography>
                                                {emptySubMessage && (
                                                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                                        {emptySubMessage}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>

                <Box sx={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(248, 250, 252, 0.8)',
                    px: 2
                }}>
                    <TablePagination
                        component="div"
                        count={data.length}
                        page={page}
                        onPageChange={(_, newPage) => onPageChange(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{
                            '& .MuiTablePagination-toolbar': {
                                minHeight: 64,
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                fontWeight: 'bold',
                                color: '#4a5568'
                            },
                            '& .MuiTablePagination-select': {
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.8)',
                            },
                            '& .MuiIconButton-root': {
                                background: `${currentTheme.colors.primary}20`,
                                margin: '0 2px',
                                '&:hover': {
                                    background: `${currentTheme.colors.primary}30`,
                                    transform: 'scale(1.1)',
                                },
                                '&.Mui-disabled': {
                                    background: 'rgba(0, 0, 0, 0.1)',
                                }
                            }
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export type TableColumn = Column;

export default ModernTable;
