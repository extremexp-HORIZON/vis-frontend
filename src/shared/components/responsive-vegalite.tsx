import { Box } from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VegaLite } from "react-vega"

interface ResponsiveVegaLiteProps {
  spec: any // VegaLite specification
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: any // Capture all other props
}

const ResponsiveVegaLite: React.FC<ResponsiveVegaLiteProps> = ({
  spec,
  minWidth = 0,
  minHeight = 0,
  maxWidth = Infinity,
  maxHeight = Infinity,
  aspectRatio = 1, // Default aspect ratio (1:1 -> square)
  ...otherProps
}) => {
  const [width, setWidth] = useState(minWidth)
  const [height, setHeight] = useState(minHeight)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
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
    <Box
      ref={containerRef}
      sx={{ width: "100%", height: "100%", justifyContent: "center", m: 1 }}
    >
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
  )
}

export default ResponsiveVegaLite
