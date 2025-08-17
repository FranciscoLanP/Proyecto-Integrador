import React from 'react';
import { Box, Chip, Avatar, Typography, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from './ModernTable.module.css';

const avatarColors = [
    'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
    'linear-gradient(135deg, #4ECDC4, #45B7D1)',
    'linear-gradient(135deg, #FFA07A, #FFE4B5)',
    'linear-gradient(135deg, #DDA0DD, #98FB98)',
    'linear-gradient(135deg, #F0E68C, #FFA500)',
    'linear-gradient(135deg, #FFB6C1, #FF69B4)'
];

export interface ClientCellProps {
    nombre: string;
    tipo_cliente?: string;
    index: number;
}

export const ClientCell: React.FC<ClientCellProps> = ({ nombre, tipo_cliente, index }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
            sx={{
                background: avatarColors[index % avatarColors.length],
                width: 40,
                height: 40,
                fontSize: '1.2rem'
            }}
            className={styles.avatarGlow}
        >
            {tipo_cliente && ['Individual', 'Gobierno'].includes(tipo_cliente) ?
                <PersonIcon /> : <BusinessIcon />}
        </Avatar>
        <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                {nombre}
            </Typography>
            {tipo_cliente && (
                <Chip
                    size="small"
                    label={tipo_cliente}
                    sx={{
                        background: ['Individual', 'Gobierno'].includes(tipo_cliente)
                            ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
                            : 'linear-gradient(45deg, #2196F3, #03DAC6)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}
                    className={styles.chipAnimation}
                />
            )}
        </Box>
    </Box>
);

export interface ContactCellProps {
    telefono?: string;
    email?: string;
}

export const ContactCell: React.FC<ContactCellProps> = ({ telefono, email }) => (
    <Box>
        {telefono && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: email ? 0.5 : 0 }}>
                <PhoneIcon sx={{ color: '#4CAF50', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: '#4a5568' }}>
                    {telefono}
                </Typography>
            </Box>
        )}
        {email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#2196F3', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: '#4a5568' }}>
                    {email}
                </Typography>
            </Box>
        )}
    </Box>
);

export interface StatusChipProps {
    status: string;
    colorMap?: Record<string, string>;
}

export const StatusChip: React.FC<StatusChipProps> = ({
    status,
    colorMap = {
        'Activo': 'linear-gradient(45deg, #4CAF50, #8BC34A)',
        'Inactivo': 'linear-gradient(45deg, #f44336, #ff5722)',
        'Pendiente': 'linear-gradient(45deg, #FF9800, #FFC107)',
        'Completado': 'linear-gradient(45deg, #4CAF50, #8BC34A)'
    }
}) => (
    <Chip
        label={status}
        size="small"
        sx={{
            background: colorMap[status] || 'linear-gradient(45deg, #9E9E9E, #757575)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
        }}
        className={styles.chipAnimation}
    />
);

export interface ActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    customActions?: Array<{
        icon: React.ReactNode;
        onClick: () => void;
        color: string;
        tooltip?: string;
    }>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onEdit,
    onDelete,
    onView,
    customActions = []
}) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {onView && (
            <IconButton
                size="small"
                onClick={onView}
                sx={{
                    background: 'linear-gradient(45deg, #9C27B0, #E91E63)',
                    color: 'white',
                    width: 36,
                    height: 36
                }}
                className={styles.actionButton}
            >
                <VisibilityIcon fontSize="small" />
            </IconButton>
        )}

        {onEdit && (
            <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    color: 'white',
                    width: 36,
                    height: 36
                }}
                className={styles.rotateReverseOnHover}
            >
                <EditIcon fontSize="small" />
            </IconButton>
        )}

        {onDelete && (
            <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                    background: 'linear-gradient(45deg, #f44336, #ff5722)',
                    color: 'white',
                    width: 36,
                    height: 36
                }}
                className={styles.rotateOnHover}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        )}

        {customActions.map((action, index) => (
            <IconButton
                key={index}
                size="small"
                onClick={action.onClick}
                title={action.tooltip}
                sx={{
                    background: action.color,
                    color: 'white',
                    width: 36,
                    height: 36
                }}
                className={styles.rotateOnHover}
            >
                {action.icon}
            </IconButton>
        ))}
    </Box>
);

export interface MoneyDisplayProps {
    amount: number;
    currency?: string;
    color?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
    amount,
    currency = '$',
    color = '#4CAF50'
}) => (
    <Typography
        variant="body2"
        sx={{
            fontWeight: 'bold',
            color: color,
            fontSize: '0.9rem'
        }}
    >
        {currency}{amount.toLocaleString()}
    </Typography>
);

export interface DateDisplayProps {
    date: string | Date;
    format?: 'short' | 'long';
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ date, format = 'short' }) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatted = format === 'short'
        ? dateObj.toLocaleDateString()
        : dateObj.toLocaleString();

    return (
        <Typography variant="body2" sx={{ color: '#4a5568' }}>
            {formatted}
        </Typography>
    );
};
