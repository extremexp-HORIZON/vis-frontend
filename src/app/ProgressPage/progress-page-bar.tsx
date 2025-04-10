import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import grey from "@mui/material/colors/grey"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

const ProgressPageBar = () => {
  const { progressBar } = useAppSelector((state: RootState) => state.progressPage)
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        { matches ? (
          <Box sx={{ minWidth: 35 }}>
            <Typography
              variant="h6"
              color="text.primary"
            >{`Progress: ${Math.round(progressBar.progress)}%`}</Typography>
          </Box>
        ) : (
          <Box sx={{ minWidth: 35 }}>
            <Typography
              variant="body1"
              color="text.primary"
            >{`Progress: ${Math.round(progressBar.progress)}%`}</Typography>
          </Box>
        )}
        {matches && (
          <Box
            sx={{ minWidth: 35, display: "flex", columnGap: 1, flexWrap: "wrap" }}
          >
            <Typography
              variant="body1"
              color="text.primary"
            >{`Completed: ${progressBar.completed}/${progressBar.total}`}</Typography>
            <Typography
              variant="body1"
              color="text.primary"
            >{`Running: ${progressBar.running}/${progressBar.total}`}</Typography>
            <Typography
              variant="body1"
              color="text.primary"
            >{`Failed: ${progressBar.failed}/${progressBar.total}`}</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.round(progressBar.progress)}
          sx={{
            height: "1rem",
            borderRadius: 4,
            backgroundColor: grey[300],
            "& .MuiLinearProgress-bar": {
              background:
                theme => theme.palette.customGradient.main,
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default ProgressPageBar
