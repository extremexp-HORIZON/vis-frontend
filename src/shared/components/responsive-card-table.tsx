import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  Typography,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CompactMenuItem from './compact-menu-item';
import { cardSurfaceSx, cardHeaderSx, menuPaperSx } from '../styles/card-surface';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ResponsiveCardTableProps {
  title: React.ReactNode
  controlPanel?: React.ReactNode
  /**
   * Self-contained controls rendered inline in the header action row (and the
   * fullscreen dialog's), to the left of the settings/fullscreen buttons.
   * Unlike `controlPanel` — whose body gets dropped *inside* the gear menu —
   * `headerActions` is never wrapped in a menu, so it is the right slot for a
   * control that opens its own popover (e.g. a column selector).
   */
  headerActions?: React.ReactNode
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
  /** Label for the settings/controls section header (defaults to "Options"). */
  optionsLabel?: string
  /** Icon for the settings/controls section header. */
  optionsIcon?: React.ReactNode

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
      borderBottom: theme => `1px solid ${theme.palette.divider}`,
      px: 1.25,
      py: 0.5,
      background: theme => theme.palette.customSurface.sectionHeader,
      // Corners are clipped by the parent menu/popover's `overflow: hidden` +
      // CARD_RADIUS, so the header inherits the container radius instead of
      // pinning its own (which used to mismatch 12px containers).
      margin: 0,
      width: '100%',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        mr: 0.75,
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: 'text.primary',
      }}
    >
      {title}
    </Typography>
  </Box>
);

const ResponsiveCardTable: React.FC<ResponsiveCardTableProps> = ({
  title,
  controlPanel,
  headerActions,
  children,
  onDownload,
  onFullScreen,
  maxWidth = 3000,
  maxHeight,
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
  optionsLabel = 'Options',
  optionsIcon = <TuneRoundedIcon fontSize="small" />,

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
        elevation={0}
        sx={[
          cardSurfaceSx(),
          {
            maxWidth: maxWidth,
            minHeight: minHeight,
            maxHeight: maxHeight,
            mx: 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        ]}
      >
        <Box
          ref={cardHeaderRef}
          sx={[
            cardHeaderSx(),
            {
              justifyContent: 'space-between',
              height: shouldShowControlsInHeader ? 'auto' : 44,
            },
          ]}
        >
          {/* Title with truncation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              minWidth: 0,  // allow truncation inside flex
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 600,
                color: 'text.primary',
                maxWidth: '100%',
                flexShrink: 1,
              }}
            >
              {title}
            </Typography>
            {details && (
              <Tooltip title={details}>
                <InfoOutlinedIcon
                  sx={{ fontSize: 14, color: 'text.secondary', cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Actions (same as your original `action` prop) */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: 2 }}
          >
            {headerActions}
            {shouldShowControlsInHeader && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {controlPanel}
                {showDownloadButton && onDownload && (
                  <Tooltip title={downloadLabel}>
                    <IconButton aria-label="download" onClick={onDownload} size="small">
                      <DownloadIcon fontSize="small" />
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
                  size="small"
                  sx={{
                    position: 'relative',
                    '& svg': { zIndex: 1, position: 'relative' },
                  }}
                >
                  <SettingsIcon fontSize="small" />
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
                    elevation: 0,
                    sx: [
                      menuPaperSx(),
                      {
                        '& .MuiMenu-list': {
                          padding: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          maxHeight: 380,
                        },
                      },
                    ],
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
                    icon={optionsIcon}
                    title={optionsLabel}
                  />
                  {controlPanel && (!shouldShowControlsInHeader) && (
                    <>
                      <Box
                        sx={{
                          p: 1.25,
                          overflowY: 'auto',
                          flexGrow: 1,
                        }}
                      >
                        {controlPanel}
                      </Box>
                      <Divider sx={{ opacity: 0.6 }} />
                    </>
                  )}
                  <Box
                    sx={{
                      py: controlPanel && !shouldShowControlsInHeader ? 0.25 : 0.5,
                      borderTop: controlPanel && !shouldShowControlsInHeader
                        ? 'none'
                        : theme => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {showDownloadButton && onDownload && (!shouldShowControlsInHeader) && (
                      <CompactMenuItem
                        onClick={handleDownload}
                        icon={<DownloadIcon fontSize="small" />}
                        primary={downloadLabel}
                        secondary={downloadSecondaryText}
                      />
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
                  size="small"
                  sx={{
                    mr: 0.5,
                    '& svg': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <CardContent
          sx={{
            bgcolor: 'customSurface.cardContent',
            p: noPadding ? 0 : 2,
            '&:last-child': {
              paddingBottom: noPadding ? 0 : 3,
            },
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
              borderRadius: fullScreen ? 0 : 2,
              width: fullScreen ? '100%' : '90vw',
              height: fullScreen ? '100%' : '90vh',
              maxWidth: 'unset',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              boxShadow: theme => theme.customShadows.popover,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
              {details && (
                <Tooltip title={details}>
                  <InfoOutlinedIcon
                    sx={{ fontSize: 16, color: 'text.secondary', cursor: 'default' }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {headerActions}
              {showSettings && controlPanel && (
                <>
                  <IconButton
                    aria-label="settings"
                    onClick={handleFullscreenMenuClick}
                    size="small"
                    sx={{
                      mr: 1,
                      '& svg': {
                        position: 'relative',
                        zIndex: 1,
                      },
                    }}
                  >
                    <SettingsIcon fontSize="small" />
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
                      elevation: 0,
                      sx: {
                        width: 240,
                        maxHeight: 380,
                        overflow: 'hidden',
                        borderRadius: 2,
                        mt: 0.5,
                        boxShadow: theme => theme.customShadows.popover,
                        border: theme => `1px solid ${theme.palette.customSurface.cardBorder}`,
                        '& .MuiMenu-list': {
                          padding: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          maxHeight: 380,
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
                      icon={optionsIcon}
                      title={optionsLabel}
                    />
                    <Box
                      sx={{
                        p: 1.25,
                        overflowY: 'auto',
                        flexGrow: 1,
                      }}
                    >
                      {controlPanel}
                    </Box>
                    {additionalMenuItems && (
                      <>
                        <Divider sx={{ opacity: 0.6 }} />
                        <Box sx={{ py: 0.25 }}>{additionalMenuItems}</Box>
                      </>
                    )}
                  </Menu>
                  {details && (
                    <Tooltip title={details}>
                      <IconButton
                        aria-label="details"
                        size="small"
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
                        <InfoOutlinedIcon fontSize="small" />
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
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              p: noPadding ? 0 : 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            {children}
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
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
