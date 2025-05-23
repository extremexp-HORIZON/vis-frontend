import type React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Tooltip,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ClosableCardTableProps {
  title: string
  controlPanel?: React.ReactNode
  children: React.ReactNode
  onDownload?: () => void
  onClose: () => void
  maxWidth?: number
  maxHeight?: number
  additionalOptions?: React.ReactNode
  downloadLabel?: string
  showDownloadButton?: boolean
  noPadding?: boolean
  details?: string | null
}

/**
 * A card component with a closable header and inline options
 */
const ClosableCardTable: React.FC<ClosableCardTableProps> = ({
  title,
  controlPanel,
  children,
  onDownload,
  onClose,
  maxWidth = 2000,
  maxHeight = 300,
  additionalOptions,
  downloadLabel = 'Download',
  showDownloadButton = true,
  noPadding = false,
  details = null,
}) => {

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Card
      sx={{
        maxWidth: maxWidth,
        mx: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <CardHeader
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {controlPanel && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mr: 1,
                }}
              >
                {controlPanel}
              </Box>
            )}

            {additionalOptions}

            {showDownloadButton && onDownload && (
              <Button
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                variant="outlined"
                color="primary"
                size="small"
              >
                {downloadLabel}
              </Button>
            )}

            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              sx={{ mr: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="overline"
              sx={{
                padding: '4px 0px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#2a3f5f',
              }}
            >
              {title}
            </Typography>
            {details && (
              <Tooltip title={details}>
                <InfoOutlinedIcon
                  sx={{ fontSize: 16, color: 'grey.600', cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>
        }
        sx={{
          background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '8px 16px',
          minHeight: '48px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      />
      <CardContent
        sx={{
          backgroundColor: '#ffffff',
          p: noPadding ? 0 : 2,
          '&:last-child': {
            paddingBottom: noPadding ? 0 : 3,
          },
          borderRadius: '0 0 12px 12px',
          flexGrow: 1, // Allow content to grow and fill space
          display: 'flex', // Enable flexbox
          flexDirection: 'column', // Stack children vertically
          overflow: noPadding ? 'hidden' : 'auto', // Control overflow based on padding
          height: '100%', // Ensure CardContent takes full height
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default ClosableCardTable;
