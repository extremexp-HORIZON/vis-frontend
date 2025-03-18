import { Box, IconButton } from "@mui/material"
import ProgressPageBar from "./progress-page-bar"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
import { useState, useEffect, useRef } from "react"


const ExperimentControls = () => {
  const [isSticky, setIsSticky] = useState(false)
    const experimentControlsRef = useRef<HTMLDivElement>(null)
    const initialOffsetTopRef = useRef<number>(0)

    useEffect(() => {
      if (experimentControlsRef.current) {
        initialOffsetTopRef.current = experimentControlsRef.current.offsetTop
      }
  
      const handleScroll = () => {
        const scrollY = window.scrollY
  
        // Compare scrollY with the initial offsetTop value
        if (scrollY >= initialOffsetTopRef.current) {
          setIsSticky(true)
        } else {
          setIsSticky(false)
        }
      }
  
      window.addEventListener("scroll", handleScroll)
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }, [])

    return (
        <Box
          key={"progress-page-experiment-controls"}
          ref={experimentControlsRef}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            height: "10%",
            position: isSticky ? "sticky" : "relative",
            top: isSticky ? 0 : "auto",
            zIndex: isSticky ? 9999 : "auto",
            width: "100%",
            backgroundColor: "white",
            borderColor: theme => theme.palette.customGrey.main,
            borderBottomWidth: 2,
            borderBottomStyle: "solid"
          }}
        >
          <Box className={"progress-page-bar"} sx={{flex: 4}}>
            <ProgressPageBar />
          </Box>
          <Box className={"progress-page-actions"} >
            <IconButton onClick={() => console.log("Paused")} color="primary">
              <PauseIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={() => console.log("Stopped")} color="primary">
              <StopIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
    )
}

export default ExperimentControls