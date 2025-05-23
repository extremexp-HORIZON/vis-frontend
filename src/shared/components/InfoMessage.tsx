import type React from 'react';
import type { SvgIconProps } from '@mui/material';
import { Box, Typography, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export type MessageType = 'info' | 'warning' | 'error' | 'success';

interface InfoMessageProps {
  message: string;
  type?: MessageType;
  icon?: React.ReactElement<SvgIconProps>;
  fullHeight?: boolean;
}

const InfoMessage: React.FC<InfoMessageProps> = ({
  message,
  type = 'info',
  icon,
  fullHeight = false,
}) => {
  // Default icons based on message type
  const getDefaultIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ fontSize: 40, color: 'info.main' }} />;
    }
  };

  // Color based on message type
  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'rgba(255, 193, 7, 0.08)';
      case 'error':
        return 'rgba(244, 67, 54, 0.08)';
      case 'success':
        return 'rgba(76, 175, 80, 0.08)';
      case 'info':
      default:
        return 'rgba(33, 150, 243, 0.08)';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullHeight ? '100%' : 'auto',
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: getBackgroundColor(),
          borderRadius: 2,
          maxWidth: '500px',
        }}
      >
        <Box sx={{ mb: 2 }}>{icon || getDefaultIcon()}</Box>
        <Typography
          align="center"
          variant="body1"
          fontWeight="medium"
          color="text.primary"
        >
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default InfoMessage;
