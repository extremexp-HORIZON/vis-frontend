import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import { useEffect, useRef, useState, MouseEvent } from "react"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"

const WorkflowConfiguration = () => {
  const containerRef = useRef<any>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    if (containerRef.current.scrollWidth > containerRef.current.clientWidth) {
      setIsOverflowing(true)
    }
  }, [])

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!isOverflowing) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1 // Multiplied by 2 for faster scrolling
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleShowNext = (e: MouseEvent<HTMLButtonElement>) => {
    const scrollAmount = 150
    const scrollStep = 5
    let scrollCount = 0
    const scrollInterval = setInterval(() => {
      if (scrollCount >= scrollAmount) {
        clearInterval(scrollInterval)
      }
      containerRef.current.scrollLeft += scrollStep
      scrollCount += scrollStep
    }, 10)
  }

  const handleShowPrevious = (e: MouseEvent<HTMLButtonElement>) => {
    const scrollAmount = 150
    const scrollStep = 5
    let scrollCount = 0
    const scrollInterval = setInterval(() => {
      if (scrollCount >= scrollAmount) {
        clearInterval(scrollInterval)
      }
      if (containerRef.current.scrollLeft - scrollStep < 0) {
        containerRef.current.scrollLeft = 0
        clearInterval(scrollInterval)
        return
      } else {
        containerRef.current.scrollLeft -= scrollStep
      }
      scrollCount -= scrollStep
    }, 10)
  }

  return (
    <>
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "hidden",
          gap: 1,
          cursor: isDragging ? "grabbing" : isOverflowing ? "grab" : "default",
          userSelect: "none",
          whiteSpace: "nowrap",
          paddingBottom: "8px",
        }}
      >
        <Chip label={`Split Proportions: 0.3`} />
        <Chip label={`Max Depth: 2`} />
        <Chip label={`Min Child Weight: 3`} />
        <Chip label={`Learning Rate: 0.01`} />
        <Chip label={`N Estimators: 100`} />
        <Chip label={`Split Proportions: 0.3`} />
        <Chip label={`Max Depth: 2`} />
        <Chip label={`Min Child Weight: 3`} />
        <Chip label={`Learning Rate: 0.01`} />
        <Chip label={`N Estimators: 100`} />
        <Chip label={`Split Proportions: 0.3`} />
        <Chip label={`Max Depth: 2`} />
        <Chip label={`Min Child Weight: 3`} />
        <Chip label={`Learning Rate: 0.01`} />
        <Chip label={`N Estimators: 100`} />
      </Box>
      {isOverflowing && (
        <Box sx={{ display: "flex" }}>
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={handleShowPrevious}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={handleShowNext}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
      )}
    </>
  )
}

export default WorkflowConfiguration
