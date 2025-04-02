import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VegaLite } from "react-vega"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { red } from "@mui/material/colors"

interface ResponsiveCardVegaLiteProps {
  spec: any // VegaLite specification
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: any // Capture all other props
}

const ResponsiveCardVegaLite: React.FC<ResponsiveCardVegaLiteProps> = ({
  spec,
  title,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 500,
  maxHeight = 300,
  aspectRatio = 1, // Default aspect ratio (1:1 -> square)
  ...otherProps
}) => {
  const [width, setWidth] = useState(minWidth)
  const [height, setHeight] = useState(minHeight)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
    const containerWidth = containerRef.current.offsetWidth || window.innerWidth * 0.9 // Default to 90% of screen if too small
      const newWidth = Math.max(minWidth, Math.min(containerWidth, maxWidth)) // Use at least the minimum width and at most the maximum width
      const newHeight = Math.max(
        minHeight,
        Math.min(newWidth / aspectRatio, maxHeight),
      ) // Calculate height based on the aspect ratio while respecting the maximum height
      setWidth(newWidth)
      setHeight(newHeight)
    }
  }, [aspectRatio, containerRef, maxHeight, maxWidth, minHeight, minWidth])

  useEffect(() => {
    // Call updateSize whenever the window is resized
    const handleResize = () => {
      updateSize()
    }

    window.addEventListener("resize", handleResize)
    updateSize() // Initial update on mount

    return () => {
      window.removeEventListener("resize", handleResize) // Cleanup event listener
    }
  }, [minWidth, minHeight, aspectRatio, updateSize])

  return (
    <Card sx={{ maxWidth: maxWidth, mx: "auto", my: 2, boxShadow: 3 }}>
      <CardHeader
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography
            variant="overline"
            sx={{
              padding: '4px 8px',
              textTransform: 'uppercase', // Optional: Makes the text uppercase (can be removed)
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
          <VegaLite
            spec={{
              ...spec,
              autosize: { type: "fit", contains: "padding" }, // Ensure the chart adjusts to container size
              width: width,
              height: height,
            }}
            {...otherProps}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default ResponsiveCardVegaLite
