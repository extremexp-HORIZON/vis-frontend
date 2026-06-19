import type React from 'react';
import type { SvgIconProps } from '@mui/material';
import { Box, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
          backgroundColor: theme => alpha(theme.palette[type].main, 0.08),
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
