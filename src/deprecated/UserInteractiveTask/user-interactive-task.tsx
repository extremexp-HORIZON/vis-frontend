import Box from "@mui/material/Box"
import grey from "@mui/material/colors/grey"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"

interface UserInteractiveTaskProps {
  url: string
}

const UserInteractiveTask = (props: UserInteractiveTaskProps) => {
  const { url } = props
    
  return (
    <>
      <Grid
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          border: `1px solid ${grey[400]}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: grey[300],
            display: "flex",
            height: "3.5rem",
            alignItems: "center",
            textAlign: "left",
            px: 2,
          }}
        >
          <Typography fontSize={"1.2rem"}>User Interactive Task</Typography>
          <Box sx={{ flex: 1 }} />
        </Box>
        <div>
          <iframe src={url} width="100%" height="500px" />
        </div>
      </Grid>
    </>
  )
}

export default UserInteractiveTask
