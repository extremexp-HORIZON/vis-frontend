import type React from 'react';
import { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ResponsiveCardTableProps {
  title: string
  controlPanel?: React.ReactNode
  children: React.ReactNode
  onDownload?: () => void
  onFullScreen?: (isOpen: boolean) => void
  maxWidth?: number
  maxHeight?: number
  minHeight?: number
  additionalMenuItems?: React.ReactNode
  downloadLabel?: string
  downloadSecondaryText?: string
  showFullScreenButton?: boolean
  showDownloadButton?: boolean
  noPadding?: boolean
  details?: string | null
  showControlsInHeader?: boolean
  showSettings?: boolean;

}

export const SectionHeader = ({
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
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      px: 2,
      py: 1.5,
      background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      margin: 0,
      width: '100%',
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

const ResponsiveCardTable: React.FC<ResponsiveCardTableProps> = ({
  title,
  controlPanel,
  children,
  onDownload,
  onFullScreen,
  maxWidth = 2000,
  maxHeight = 300,
  minHeight,
  additionalMenuItems,
  downloadLabel = 'Download as PNG',
  downloadSecondaryText = 'Save chart as image',
  showFullScreenButton = true,
  showDownloadButton = true,
  noPadding = false,
  details = null,
  showControlsInHeader = false,
  showSettings = true,

}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Add state for fullscreen settings menu
  const [fullscreenAnchorEl, setFullscreenAnchorEl] =
    useState<null | HTMLElement>(null);
  const fullscreenMenuOpen = Boolean(fullscreenAnchorEl);
  // Add state to track if we have enough space in the header
  const [hasSpaceInHeader, setHasSpaceInHeader] = useState(true);
  // Add ref for the card header
  const cardHeaderRef = useRef<HTMLDivElement>(null);
  // Threshold for minimum width to show controls in header (in pixels)
  const MIN_HEADER_WIDTH_FOR_CONTROLS = 500;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
    handleMenuClose();
  };

  const handleFullScreen = () => {
    setFullscreenOpen(true);
    handleMenuClose();
    if (onFullScreen) {
      onFullScreen(true);
    }
  };

  const handleCloseFullscreen = () => {
    setFullscreenOpen(false);
    if (onFullScreen) {
      onFullScreen(false);
    }
  };

  // Notify parent of fullscreen changes
  useEffect(() => {
    if (onFullScreen) {
      onFullScreen(fullscreenOpen);
    }
  }, [fullscreenOpen, onFullScreen]);

  const handleFullscreenMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFullscreenAnchorEl(event.currentTarget);
  };

  const handleFullscreenMenuClose = () => {
    setFullscreenAnchorEl(null);
  };

  // Effect to handle the resize observation
  useEffect(() => {
    if (!showControlsInHeader || !cardHeaderRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Check if there's enough space in the header
        const width = entry.contentRect.width;

        setHasSpaceInHeader(width > MIN_HEADER_WIDTH_FOR_CONTROLS);
      }
    });

    resizeObserver.observe(cardHeaderRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [showControlsInHeader]);

  const shouldShowControlsInHeader = showControlsInHeader && hasSpaceInHeader && controlPanel;

  return (
    <>
      <Card
        sx={{
          maxWidth: maxWidth,
          minHeight: minHeight,
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
        <Box
          ref={cardHeaderRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '4px 16px',
            height: shouldShowControlsInHeader ? 'auto' : '40px',
            minHeight: '40px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          {/* Title with truncation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,  // allow truncation inside flex
              flex: 1,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#2a3f5f',
                maxWidth: '100%',
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

          {/* Actions (same as your original `action` prop) */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 2 }}
          >
            {shouldShowControlsInHeader && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {controlPanel}
                {showDownloadButton && onDownload && (
                  <Tooltip title={downloadLabel}>
                    <IconButton aria-label="download" onClick={onDownload}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}

            {showSettings && (!shouldShowControlsInHeader || additionalMenuItems) && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleMenuClick}
                  sx={{
                    position: 'relative',
                    '& svg': { zIndex: 1, position: 'relative' },
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
                      overflowY: 'hidden', // Change this to hidden
                      overflowX: 'hidden',
                      padding: 0,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      mt: 1,
                      '& .MuiMenu-list': {
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        maxHeight: 500,
                      },
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    },
                  }}
                >
                  <SectionHeader
                    icon={<SettingsSuggestIcon fontSize="small" />}
                    title="Options"
                  />
                  {controlPanel && (!shouldShowControlsInHeader) && (
                    <>
                      <Box
                        sx={{
                          p: 2,
                          overflowY: 'auto',
                          flexGrow: 1,
                        }}
                      >
                        {controlPanel}
                      </Box>
                      <Divider sx={{ mt: 1, opacity: 0.6 }} />
                    </>
                  )}
                  <Box
                    sx={{
                      py: controlPanel && !shouldShowControlsInHeader ? 0.5 : 1,
                      borderTop: controlPanel && !shouldShowControlsInHeader
                        ? 'none'
                        : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    {showDownloadButton && onDownload && (!shouldShowControlsInHeader) && (
                      <MenuItem onClick={handleDownload} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                          <DownloadIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={downloadLabel}
                          secondary={downloadSecondaryText}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </MenuItem>
                    )}

                    {additionalMenuItems}
                  </Box>
                </Menu>
              </>
            )}

            {showFullScreenButton && (
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
            )}
          </Box>
        </Box>
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

      {showFullScreenButton && (
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
              {showSettings && controlPanel && (
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
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          maxHeight: 500,
                        },
                      },
                    }}
                    MenuListProps={{
                      sx: {
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      },
                    }}
                  >
                    <SectionHeader
                      icon={<SettingsSuggestIcon fontSize="small" />}
                      title="Options"
                    />
                    <Box
                      sx={{
                        p: 2,
                        overflowY: 'auto',
                        flexGrow: 1,
                      }}
                    >
                      {controlPanel}
                    </Box>
                    {additionalMenuItems && (
                      <>
                        <Divider sx={{ mt: 1, opacity: 0.6 }} />
                        <Box sx={{ py: 0.5 }}>{additionalMenuItems}</Box>
                      </>
                    )}
                  </Menu>
                  {details && (
                    <Tooltip title={details}>
                      <IconButton
                        aria-label="details"
                        sx={{
                          mr: 0.5,
                          '& svg': {
                            position: 'relative',
                            zIndex: 1,
                          },
                          '&:hover': {
                            cursor: 'default',
                          },
                        }}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
              p: noPadding ? 0 : 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {children}
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#f8f9fa',
            }}
          >
            {onDownload && showDownloadButton && (
              <Button
                onClick={onDownload}
                startIcon={<DownloadIcon />}
                variant="outlined"
                color="primary"
                size="small"
              >
                {downloadLabel}
              </Button>
            )}
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
      )}
    </>
  );
};

export default ResponsiveCardTable;
