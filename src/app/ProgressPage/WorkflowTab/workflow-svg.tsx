import GridOnIcon from "@mui/icons-material/GridOn"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import grey from "@mui/material/colors/grey"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const WorkflowSvg = () => {
  return (
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
  )
}

export default WorkflowSvg
