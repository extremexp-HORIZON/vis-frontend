import {
  Box,
  Card,
  CardContent,
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
import { VegaLite } from 'react-vega';
import SettingsIcon from '@mui/icons-material/Settings';
import { grey } from '@mui/material/colors';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Loader from './loader';

interface ResponsiveCardVegaLiteProps {
  spec: Record<string, unknown>; // VegaLite specification
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: unknown // Capture all other props
  controlPanel?: React.ReactNode
  infoMessage?: React.ReactElement
  showInfoMessage?: boolean
  isStatic?: boolean // If true, means the chart will be inside a static panel
  details?: string | null
  loading?: boolean
  title?: string
  showSettings?: boolean;
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3566b5',
        mr: 1.5,
      }}
    >
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

const ResponsiveCardVegaLite: React.FC<ResponsiveCardVegaLiteProps> = ({
  spec,
  title,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 2000,
  maxHeight = 300,
  aspectRatio = 1,
  controlPanel,
  infoMessage,
  showInfoMessage,
  isStatic = true,
  details = null,
  loading = false,
  showSettings = true,

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
  const [fullscreenAnchorEl, setFullscreenAnchorEl] =
    useState<null | HTMLElement>(null);
  const fullscreenMenuOpen = Boolean(fullscreenAnchorEl);

  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth =
        containerRef.current.offsetWidth || window.innerWidth * 0.9;
      const containerHeight = isStatic
        ? containerRef.current.offsetHeight || window.innerHeight * 0.5
        : 0;
      // Adjust to fit exactly within the container with no overflow
      const newWidth = Math.max(minWidth, Math.min(containerWidth, maxWidth));

      const newHeight = isStatic
        ? Math.max(
          minHeight,
          Math.min(newWidth / aspectRatio, maxHeight, containerHeight),
        )
        : Math.max(minHeight, Math.min(newWidth / aspectRatio, maxHeight));

      setWidth(newWidth);
      setHeight(newHeight);
    }
  }, [minWidth, maxWidth, minHeight, maxHeight, aspectRatio, isStatic]);

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
    if (spec?.data) {
      // Extract data from spec
      let dataToExport;

      if (
        typeof spec.data === 'object' &&
        spec.data !== null &&
        'values' in spec.data &&
        Array.isArray((spec.data as { values: unknown }).values)
      ) {
        dataToExport = (spec.data as { values: unknown }).values;
      } else if (
        typeof spec.data === 'object' &&
        spec.data !== null &&
        'name' in spec.data &&
        typeof (spec.data as { name: unknown }).name === 'string' &&
        otherProps.data &&
        typeof otherProps.data === 'object' &&
        otherProps.data !== null
      ) {
        const name = (spec.data as { name: string }).name;
        const dataMap = otherProps.data as Record<string, unknown>;

        if (name in dataMap) {
          dataToExport = dataMap[name];
        } else {
          dataToExport = spec.data;
        }
      } else {
        dataToExport = spec.data;
      }
      // Convert data to JSON string
      const jsonData = JSON.stringify(dataToExport, null, 2);

      // Create blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${title || 'chart-data'}_${new Date().toISOString()
        .split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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
      <Card
        sx={{
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
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '4px 16px',
            height: '40px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {/* Title (unchanged, just wrapped for truncation) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                padding: '4px 0px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#2a3f5f',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 1,
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

          {/* Actions */}
          <>
            {showSettings && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleMenuClick}
                  sx={{
                    position: 'relative',
                    '& svg': {
                      zIndex: 1,
                      position: 'relative',
                    },
                  }}
                >
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
                      mt: 1,
                      '& .MuiMenu-list': {
                        padding: 0,
                      },
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      padding: 0,
                    },
                  }}
                >
                  <SectionHeader
                    icon={<SettingsSuggestIcon fontSize="small" />}
                    title="Chart Options"
                  />
                  {controlPanel && (
                    <>
                      <Box sx={{ p: 2 }}>{controlPanel}</Box>
                      <Divider sx={{ mt: 1, opacity: 0.6 }} />
                    </>
                  )}
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
              </>
            )}
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
        </Box>
        <CardContent
          sx={{
            backgroundColor: '#ffffff',
            py: 2,
            px: 3,
            '&:last-child': {
              paddingBottom: 3,
            },
            borderRadius: '0 0 12px 12px',
            display: 'flex',
            flexGrow: 1, // Allow content to grow
            overflow: 'auto', // Only make the content scrollable
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showInfoMessage ? (
              <Box sx={{ width: width, height: height }}>{infoMessage}</Box>
            ) : loading ? (
              <Loader/>
            ) : (
              <VegaLite
                spec={{
                  ...spec,
                  autosize: {
                    type: 'fit',
                    contains: 'padding',
                    resize: true,
                  },
                  width: width,
                  height: height, // Adjust height based on padding?!
                }}
                {...otherProps}
              />
            )}
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
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            {details && (
              <Tooltip title={details}>
                <InfoOutlinedIcon
                  sx={{ fontSize: 20, color: 'grey.600', cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>
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
                    },
                  }}
                >
                  <SectionHeader
                    icon={<SettingsSuggestIcon fontSize="small" />}
                    title="Chart Options"
                  />
                  <Box sx={{ p: 2 }}>{controlPanel}</Box>
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
        <DialogContent
          dividers
          sx={{
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {!showInfoMessage ? (
            loading ? (
              <Loader/>
            ) : (
              <VegaLite
                spec={{
                  ...spec,
                  autosize: { type: 'fit', contains: 'padding' },
                  width: fullScreen
                    ? window.innerWidth * 0.9
                    : window.innerWidth * 0.8,
                  height: fullScreen
                    ? window.innerHeight * 0.7
                    : window.innerHeight * 0.7,
                }}
                {...otherProps}
              />
            )
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {infoMessage}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            background: '#f8f9fa',
          }}
        >
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

export default ResponsiveCardVegaLite;
