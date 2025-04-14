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
} from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VegaLite } from "react-vega"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { grey, red } from "@mui/material/colors"
import LineChartControlPanel from "../../app/Tasks/DataExplorationTask/Charts/LineChartControlPanel"
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"

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
      borderBottom: `1px solid ${grey[400]}`,
      px: 1.5,
    }}
  >
    {icon}
    <Typography
      variant="h6"
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        ml: 1,
        fontWeight: "bold",
      }}
      color="primary"
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

  return (
    <Card sx={{ maxWidth: maxWidth, mx: "auto", mb: 1, boxShadow: 3 }}>
      <CardHeader
        action={
          <>
            <IconButton aria-label="settings" onClick={handleMenuClick}   sx={{
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
                sx: {
                  width: 300,
                  maxHeight: 400,
                  overflow: "hidden",
                  padding: 0,
                },
              }}
            >
              <SectionHeader icon={<SettingsSuggestIcon />} title="Options"  />

              <Box sx={{ padding: 2, overflowY: "auto", maxHeight: 350 }}>
                {controlPanel}
              </Box>
            </Menu>
          </>
        }
        title={
          <Typography
            variant="overline"
            sx={{
              padding: "4px 8px",
              textTransform: "uppercase", // Optional: Makes the text uppercase (can be removed)
            }}
          >
            {title}
          </Typography>
        }
        // subheader="September 14, 2016"
        sx={{
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          padding: "4px 16px", // Reduced padding for the header
          height: "40px", // Set a smaller fixed height for the header
        }}
      />
      <CardContent sx={{ backgroundColor: "#ffffff", py: 2 }}>
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
  )
}

export default ResponsiveCardVegaLite
