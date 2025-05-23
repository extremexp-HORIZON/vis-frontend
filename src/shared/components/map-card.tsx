import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { grey } from '@mui/material/colors';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CodeIcon from '@mui/icons-material/Code';

interface ResponsiveMapCardProps {
  mapRef?: React.RefObject<HTMLDivElement>
  fullscreenMapRef?: React.RefObject<HTMLDivElement>
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: unknown // Capture all other props
  controlPanel?: React.ReactNode
  infoMessage?: React.ReactElement
  showInfoMessage?: boolean
  title?: string
}
const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${grey[200]}`,
      px: 2,
      py: 1.5,
      background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      margin: 0, // Ensure no margin
      width: '100%', // Full width
    }}
  >
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3566b5',
      mr: 1.5
    }}>
      {icon}
    </Box>
    <Typography
      variant="subtitle1"
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        color: '#1e3a5f',
        letterSpacing: '0.3px',
      }}
    >
      {title}
    </Typography>
  </Box>
);

const ResponsiveMapCard: React.FC<ResponsiveMapCardProps> = ({
  mapRef,
  fullscreenMapRef,
  title,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 2000,
  maxHeight = 300,
  aspectRatio = 1,
  controlPanel,
  infoMessage,
  showInfoMessage,
  ...otherProps
}) => {
  const [width, setWidth] = useState(minWidth);
  const [height, setHeight] = useState(minHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Add a new state for fullscreen menu
  const [fullscreenAnchorEl, setFullscreenAnchorEl] = useState<null | HTMLElement>(null);
  const fullscreenMenuOpen = Boolean(fullscreenAnchorEl);

  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || window.innerWidth * 0.9;

      // Adjust to fit exactly within the container with no overflow
      const newWidth = Math.max(minWidth, Math.min(containerWidth, maxWidth));
      const newHeight = Math.max(
        minHeight,
        Math.min(newWidth / aspectRatio, maxHeight),
      );

      setWidth(newWidth);
      setHeight(newHeight);
    }
  }, [minWidth, maxWidth, minHeight, maxHeight, aspectRatio]);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [updateSize]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);

  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // New function to handle chart download
  const handleDownloadChart = () => {
    if (containerRef.current) {
      // Find the canvas element inside the container
      const canvas = containerRef.current.querySelector('canvas');

      if (canvas) {
        // Create a temporary link element
        const link = document.createElement('a');

        link.download = `${title || 'chart'}_${new Date().toISOString()
          .split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    handleMenuClose();
  };

  // Enhanced function to handle full-screen mode
  const handleFullScreen = () => {
    setFullscreenOpen(true);
    handleMenuClose();
  };

  const handleCloseFullscreen = () => {
    setFullscreenOpen(false);
  };

  // When fullscreen dialog opens, resize the chart to fit
  useEffect(() => {
    if (fullscreenOpen) {
      // Short delay to ensure the dialog is rendered before measuring
      const timer = setTimeout(() => updateSize(), 100);

      return () => clearTimeout(timer);
    }
  }, [fullscreenOpen, updateSize]);

  // Replaced view data function with JSON download function
  const handleDownloadData = () => {
    // if (spec?.data) {
    //   // Extract data from spec
    //   let dataToExport;

    //   if (spec.data.values) {
    //     dataToExport = spec.data.values;
    //   } else if (spec.data.name && otherProps.data && otherProps.data[spec.data.name]) {
    //     dataToExport = otherProps.data[spec.data.name];
    //   } else {
    //     dataToExport = spec.data;
    //   }

    //   // Convert data to JSON string
    //   const jsonData = JSON.stringify(dataToExport, null, 2);

    //   // Create blob and download link
    //   const blob = new Blob([jsonData], { type: 'application/json' });
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement('a');

    //   link.href = url;
    //   link.download = `${title || 'chart-data'}_${new Date().toISOString().split('T')[0]}.json`;
    //   document.body.appendChild(link);
    //   link.click();

    //   // Clean up
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(url);
    // }
    handleMenuClose();
  };

  const handleFullscreenMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFullscreenAnchorEl(event.currentTarget);
  };

  const handleFullscreenMenuClose = () => {
    setFullscreenAnchorEl(null);
  };

  return (
    <>
      <Card sx={{
        maxWidth: maxWidth,
        mx: 'auto',
        mb: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}>
        <CardHeader
          action={
            <>
              <IconButton aria-label="settings" onClick={handleMenuClick} sx={{
                position: 'relative',
                '& svg': {
                  zIndex: 1,
                  position: 'relative',
                },
              }}
              >
                {/* <MoreVertIcon /> */}
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    width: 320,
                    maxHeight: 500,
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    padding: 0,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    mt: 1, // Add small margin to top
                    '& .MuiMenu-list': {
                      padding: 0, // Remove default padding
                    },
                  },
                }}
                MenuListProps={{
                  sx: {
                    padding: 0, // Remove padding from MenuList
                  }
                }}
              >
                <SectionHeader icon={<SettingsSuggestIcon fontSize="small" />} title="Chart Options" />
                {/* Advanced Controls Divider */}
                {controlPanel && (
                  <>
                    <Box sx={{ p: 2 }}>
                      {controlPanel}
                    </Box>
                    <Divider sx={{ mt: 1, opacity: 0.6 }} />
                  </>
                )}
                {/* Quick Actions */}
                <Box sx={{ py: 1 }}>
                  <MenuItem onClick={handleDownloadChart} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Download as PNG"
                      secondary="Save chart as image"
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </MenuItem>

                  <MenuItem onClick={handleDownloadData} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <CodeIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Download Data as JSON"
                      secondary="Export chart's underlying data"
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </MenuItem>
                </Box>
              </Menu>
              <Tooltip title="Fullscreen">
                <IconButton
                  aria-label="fullscreen"
                  onClick={handleFullScreen}
                  sx={{
                    mr: 0.5,
                    '& svg': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </>
          }
          title={
            <Typography
              variant="overline"
              sx={{
                padding: '4px 8px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#2a3f5f'
              }}
            >
              {title}
            </Typography>
          }
          // subheader="September 14, 2016"
          sx={{
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '4px 16px',
            height: '40px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            flexShrink: 0, // Prevent header from shrinking
          }}
        />
        <CardContent sx={{
          backgroundColor: '#ffffff',
          py: 2,
          px: 3,
          '&:last-child': {
            paddingBottom: 3
          },
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexGrow: 1, // Allow content to grow
          overflow: 'auto', // Only make the content scrollable
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {
              showInfoMessage ? (
                <Box sx={{ width: width, height: height }}>
                  {infoMessage}
                </Box>
              ) : (
                <Box ref={mapRef} style={{ height: '100%', width: '100%' }} />
              )
            }
          </Box>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={fullscreenOpen}
        onClose={handleCloseFullscreen}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : '12px',
            width: fullScreen ? '100%' : '90vw',
            height: fullScreen ? '100%' : '90vh',
            maxWidth: 'unset',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          px: 3,
          py: 1.5,
        }}>
          <Typography variant="h6" component="div" sx={{
            fontWeight: 600,
            color: '#2a3f5f',
            letterSpacing: '0.3px',
          }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {controlPanel && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleFullscreenMenuClick}
                  sx={{
                    mr: 1,
                    '& svg': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
                <Menu
                  anchorEl={fullscreenAnchorEl}
                  open={fullscreenMenuOpen}
                  onClose={handleFullscreenMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      width: 320,
                      maxHeight: 500,
                      overflowY: 'hidden',
                      overflowX: 'hidden',
                      padding: 0,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      mt: 1,
                      '& .MuiMenu-list': {
                        padding: 0,
                      },
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      padding: 0,
                    }
                  }}
                >
                  <SectionHeader icon={<SettingsSuggestIcon fontSize="small" />} title="Chart Options" />
                  <Box sx={{ p: 2 }}>
                    {controlPanel}
                  </Box>
                </Menu>
              </>
            )}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseFullscreen}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          overflow: 'hidden',
        }}>
          {!showInfoMessage ? (
            <Box ref={mapRef} style={{ width: fullScreen ? window.innerWidth * 0.9 : window.innerWidth * 0.8,
              height: fullScreen ? window.innerHeight * 0.7 : window.innerHeight * 0.7 }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {infoMessage}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          background: '#f8f9fa',
        }}>
          <Button
            onClick={handleDownloadChart}
            startIcon={<DownloadIcon />}
            variant="outlined"
            color="primary"
            size="small"
          >
            Download as PNG
          </Button>
          <Button
            onClick={handleCloseFullscreen}
            color="primary"
            variant="contained"
            size="small"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResponsiveMapCard;
