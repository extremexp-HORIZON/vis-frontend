import type React from "react";
import { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";

interface ResponsiveCardTableProps {
  title: string;
  controlPanel?: React.ReactNode;
  children: React.ReactNode;
  onDownload?: () => void;
  onFullScreen?: (isOpen: boolean) => void;
  maxWidth?: number;
  maxHeight?: number;
  additionalMenuItems?: React.ReactNode;
  downloadLabel?: string;
  downloadSecondaryText?: string;
  showFullScreenButton?: boolean;
  showDownloadButton?: boolean;
  noPadding?: boolean;
}

export const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
      px: 2,
      py: 1.5,
      background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px',
      margin: 0,
      width: '100%',
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
        display: "flex",
        alignItems: "center",
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
  additionalMenuItems,
  downloadLabel = "Download as PNG",
  downloadSecondaryText = "Save chart as image",
  showFullScreenButton = true,
  showDownloadButton = true,
  noPadding = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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

  return (
    <>
      <Card sx={{ 
        maxWidth: maxWidth, 
        mx: "auto", 
        boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
        height: "100%", 
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
                position: "relative",
                "& svg": {
                  zIndex: 1,
                  position: "relative",
                },
              }}>
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    width: 320,
                    maxHeight: 500,
                    overflowY: "hidden", // Change this to hidden
                    overflowX: "hidden",
                    padding: 0,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    mt: 1,
                    "& .MuiMenu-list": {
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
                  }
                }}
              >
                <SectionHeader icon={<SettingsSuggestIcon fontSize="small" />} title="Options" />
                {controlPanel && (
                  <>
                    <Box sx={{ 
                      p: 2,
                      overflowY: "auto",
                      flexGrow: 1,
                    }}>
                      {controlPanel}
                    </Box>
                    <Divider sx={{ mt: 1, opacity: 0.6 }} />
                  </>
                )}
                <Box sx={{ 
                  py: controlPanel ? 0.5 : 1,
                  borderTop: controlPanel ? 'none' : '1px solid rgba(0,0,0,0.08)',
                }}>
                  {showDownloadButton && onDownload && (
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
              {showFullScreenButton && (
                <Tooltip title="Fullscreen">
                  <IconButton 
                    aria-label="fullscreen" 
                    onClick={handleFullScreen}
                    sx={{
                      mr: 0.5,
                      "& svg": {
                        position: "relative",
                        zIndex: 1,
                      },
                    }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          }
          title={
            <Typography
              variant="overline"
              sx={{
                padding: "4px 8px",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#2a3f5f'
              }}
            >
              {title}
            </Typography>
          }
          sx={{
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            padding: "4px 16px",
            height: "40px",
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        />
        <CardContent sx={{ 
          backgroundColor: "#ffffff", 
          p: noPadding ? 0 : 2,
          '&:last-child': { 
            paddingBottom: noPadding ? 0 : 3 
          },
          borderRadius: '0 0 12px 12px',
          flexGrow: 1, // Allow content to grow and fill space
          display: 'flex', // Enable flexbox
          flexDirection: 'column', // Stack children vertically
          overflow: noPadding ? 'hidden' : 'auto', // Control overflow based on padding
          height: '100%', // Ensure CardContent takes full height
        }}>
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
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseFullscreen}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ 
            p: 4, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            overflow: 'hidden',
          }}>
            {children}
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            background: '#f8f9fa',
          }}>
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
