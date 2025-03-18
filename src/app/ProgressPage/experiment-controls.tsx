import { Box, IconButton } from "@mui/material"
import ProgressPageBar from "./progress-page-bar"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"


const ExperimentControls = () => {

    return (
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          backgroundColor: "white",
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: "solid"
        }}
      >
        <Box
          key={"progress-page-experiment-controls"}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
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
      </Box>
    )
}

export default ExperimentControls