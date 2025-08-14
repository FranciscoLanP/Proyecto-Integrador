import React, { ReactNode } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../app/context/ThemeContext';
import styles from './ModernModal.module.css';

export interface ModernModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    titleIcon?: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    showCloseButton?: boolean;
}

const ModernModal: React.FC<ModernModalProps> = ({
    open,
    onClose,
    title,
    titleIcon = '✨',
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    showCloseButton = true
}) => {
    const { currentTheme } = useTheme();

    const getThemeColors = () => {
        return {
            headerGradient: currentTheme.headerGradient,
            backgroundGradient: currentTheme.cardGradient,
            accentColor: currentTheme.colors.primary,
            buttonGradient: currentTheme.buttonGradient,
            hoverColor: `${currentTheme.colors.primary}20`, 
        };
    };

    const activeTheme = getThemeColors(); return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            className={styles.modernDialog}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 20px 40px ${activeTheme.accentColor}20, 0 0 0 1px ${activeTheme.accentColor}10`,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 20% 50%, ${activeTheme.accentColor}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${activeTheme.accentColor}15 0%, transparent 50%)`,
                        opacity: 0.1,
                        pointerEvents: 'none'
                    }
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: activeTheme.headerGradient,
                    color: 'white',
                    padding: '16px 24px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 1
                }}
                className={styles.fadeIn}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        {titleIcon} {title}
                    </Typography>
                </Box>

                {showCloseButton && (
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        className={styles.closeButton}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: '24px',
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2,
                    minHeight: '80px'
                }}
                className={styles.slideIn}
            >
                {children}
            </DialogContent>

            {actions && (
                <DialogActions
                    sx={{
                        padding: '16px 24px',
                        background: 'rgba(248, 249, 250, 0.8)',
                        backdropFilter: 'blur(10px)',
                        gap: 1,
                        zIndex: 2
                    }}
                    className={styles.slideIn}
                >
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ModernModal;
