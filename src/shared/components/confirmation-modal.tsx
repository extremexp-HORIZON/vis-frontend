import type React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  severity?: 'warning' | 'error' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
  loading = false,
  severity = 'warning',
}) => {
  const getSeverityIcon = () => {
    switch (severity) {
      case 'error':
        return <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'info':
        return <WarningIcon sx={{ fontSize: 40, color: 'info.main' }} />;
      default:
        return <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return 'rgba(244, 67, 54, 0.08)';
      case 'warning':
        return 'rgba(255, 193, 7, 0.08)';
      case 'info':
        return 'rgba(33, 150, 243, 0.08)';
      default:
        return 'rgba(255, 193, 7, 0.08)';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          px: 3,
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: '#2a3f5f',
            letterSpacing: '0.3px',
          }}
        >
          {title}
        </Typography>
        <IconButton onClick={onCancel} size="small" sx={{ color: 'grey.600' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          backgroundColor: getSeverityColor(),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 2 }}>{getSeverityIcon()}</Box>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ mb: 1, fontWeight: 500 }}
          >
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          background: '#f8f9fa',
          gap: 2,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          disabled={loading}
          sx={{
            minWidth: 100,
            borderColor: 'grey.400',
            color: 'grey.700',
            '&:hover': {
              borderColor: 'grey.600',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          sx={{
            minWidth: 100,
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
