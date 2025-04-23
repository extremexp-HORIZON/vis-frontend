import {
  Avatar,
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
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react"
import { VegaLite } from "react-vega"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { grey, red } from "@mui/material/colors"
import LineChartControlPanel from "../../app/Tasks/DataExplorationTask/ChartControls/data-exploration-line-control"
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"
import DownloadIcon from "@mui/icons-material/Download"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import CodeIcon from "@mui/icons-material/Code"

interface ResponsiveCardVegaLiteProps {
  spec: any // VegaLite specification
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: any // Capture all other props
  controlPanel?: React.ReactNode
  blinkOnStart?: boolean
  infoMessage?: React.ReactElement
  showInfoMessage?: boolean
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
      display: "flex",
      alignItems: "center",
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
)

const ResponsiveCardVegaLite: React.FC<ResponsiveCardVegaLiteProps> = ({

  spec,
  title,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 2000,
  maxHeight = 300,
  aspectRatio = 1,
  controlPanel,
  blinkOnStart = false, // Default aspect ratio (1:1 -> square)
  infoMessage,
  showInfoMessage,
  ...otherProps
}) => {
  const [width, setWidth] = useState(minWidth)
  const [height, setHeight] = useState(minHeight)
  const containerRef = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  const [hasClickedMenu, setHasClickedMenu] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth =
        containerRef.current.offsetWidth || window.innerWidth * 0.9
      const newWidth = Math.max(minWidth, Math.min(containerWidth, maxWidth))
      const newHeight = Math.max(
        minHeight,
        Math.min(newWidth / aspectRatio, maxHeight),
      )
      setWidth(newWidth)
      setHeight(newHeight)
    }
  }, [minWidth, maxWidth, minHeight, maxHeight, aspectRatio])

  useEffect(() => {
    updateSize()

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [updateSize])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setHasClickedMenu(true) // 👈 Stop blinking after first click

  }

  const blinkAnimation = {
    animation: "blinker 1s linear infinite",
    "@keyframes blinker": {
      "50%": { opacity: 0 },
    },
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  // New function to handle chart download
  const handleDownloadChart = () => {
    if (containerRef.current) {
      // Find the canvas element inside the container
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`;
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
      
      if (spec.data.values) {
        dataToExport = spec.data.values;
      } else if (spec.data.name && otherProps.data && otherProps.data[spec.data.name]) {
        dataToExport = otherProps.data[spec.data.name];
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
      link.download = `${title || 'chart-data'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  return (
    <>
      <Card sx={{ 
        maxWidth: maxWidth, 
        mx: "auto", 
        mb: 1, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
        height: "100%", 
        overflowY: "auto",
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)'
        }
      }}>
        <CardHeader
          action={
            <>
              <IconButton aria-label="settings" onClick={handleMenuClick} sx={{
                position: "relative",
                ...(blinkOnStart && !hasClickedMenu && {
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -1,
                    left: -6,
                    right: -6,
                    bottom: -6,
                    borderRadius: "50%",
                    border: "2px solid #1976d2", // MUI primary.main color
                    animation: "pulse 1.5s ease-out infinite",
                    zIndex: 0,
                  },
                }),
                "& svg": {
                  zIndex: 1,
                  position: "relative",
                },
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(0.95)",
                    opacity: 0.7,
                  },
                  "70%": {
                    transform: "scale(1.2)",
                    opacity: 0,
                  },
                  "100%": {
                    transform: "scale(0.95)",
                    opacity: 0,
                  },
                },
              }}
              >
                <MoreVertIcon />
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
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: 0,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    mt: 1, // Add small margin to top
                    "& .MuiMenu-list": {
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
                  
                  <MenuItem onClick={handleFullScreen} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <FullscreenIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Full Screen" 
                      secondary="Expand chart to entire screen"
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
                
                {/* Advanced Controls Divider */}
                {controlPanel && (
                  <>
                    <Divider sx={{ my: 1, opacity: 0.6 }} />
                    <Typography sx={{ px: 3, py: 1, fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>
                      Advanced Controls
                    </Typography>
                    
                    <Box sx={{ px: 2, pt: 1, pb: 2, overflowY: "auto", maxHeight: 250 }}>
                      {controlPanel}
                    </Box>
                  </>
                )}
              </Menu>
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
          // subheader="September 14, 2016"
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
          py: 2,
          px: 3,
          '&:last-child': { 
            paddingBottom: 3 
          },
          borderRadius: '0 0 12px 12px'
        }}>
          <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}>
            {
              showInfoMessage ? (
                <Box sx={{ width: width, height: height}}>
                {infoMessage}
                </Box>
              ) : (
                <VegaLite
                  spec={{
                    ...spec,
                    autosize: { type: "fit", contains: "padding" }, // Ensure the chart adjusts to container size
                    width: width,
                    height: height,
                  }}
                  {...otherProps}
                />  
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
          {!showInfoMessage ? (
            <VegaLite
              spec={{
                ...spec,
                autosize: { type: "fit", contains: "padding" },
                width: fullScreen ? window.innerWidth * 0.9 : window.innerWidth * 0.8,
                height: fullScreen ? window.innerHeight * 0.7 : window.innerHeight * 0.7,
              }}
              {...otherProps}
            />
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
  )
}

export default ResponsiveCardVegaLite
