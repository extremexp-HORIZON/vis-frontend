import { Chip, IconButton, Paper, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import WorkflowMetrics from "./workflow-metrics"
import { useEffect, useRef, useState, MouseEvent } from "react"
import GridOnIcon from "@mui/icons-material/GridOn"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ExplainabilityTask from "../../ExplainabilityTask/explainability-task"
import grey from "@mui/material/colors/grey"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"

const WorkflowTab = () => {
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
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 1 }}>
      <Box
        key="workflow-details"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 details
          </Typography>
        </Box>
        <Box>
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
              cursor: isDragging
                ? "grabbing"
                : isOverflowing
                  ? "grab"
                  : "default",
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
        </Box>
      </Box>
      <Box
        key="workflow-metrics"
        sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
      >
        <Box key="workflow-metrics-title">
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.5rem" }}
          >
            Workflow1 metrics
          </Typography>
        </Box>
        <Box key="workflow-metrics-items">
          <WorkflowMetrics />
        </Box>
      </Box>
      <Box key="workflow-svg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 6,
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              opacity: 0.5,
              borderRadius: 16,
              border: `1px solid ${grey[400]}`,
              p: 6,
            }}
          >
            <GridOnIcon />
            <Typography variant="body2" sx={{ marginLeft: "8px" }}>
              I2Cat Phishing
            </Typography>
          </Box>

          <ArrowForwardIcon sx={{ opacity: 0.5 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 16,
              border: `1px solid ${grey[400]}`,
              opacity: 0.5,
              p: 6,
            }}
          >
            <Typography variant="body2">Data Split</Typography>
          </Box>
          <ArrowForwardIcon sx={{ opacity: 0.5 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 16,
              border: `1px solid ${grey[400]}`,
              opacity: 0.5,
              p: 6,
            }}
          >
            <Typography variant="body2">Data Augmentation</Typography>
          </Box>
          <ArrowForwardIcon />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 16,
              border: `1px solid ${grey[900]}`,
              opacity: 1,
              p: 6,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Model Training
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box key="workflow-task">
        <ExplainabilityTask />
      </Box>
    </Box>
  )
}

export default WorkflowTab
