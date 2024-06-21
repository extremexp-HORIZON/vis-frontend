import GridOnIcon from "@mui/icons-material/GridOn"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import grey from "@mui/material/colors/grey"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { Dispatch, SetStateAction } from "react"
import Button from "@mui/material/Button"
import blue from "@mui/material/colors/blue"

interface IWorkflowSvg {
  chosenTask: string | null
  setChosenTask: Dispatch<SetStateAction<string | null>>
}

const WorkflowSvg = (props: IWorkflowSvg) => {

  const { chosenTask, setChosenTask } = props

  const handleChange = (taskId: string) => () => {
    chosenTask === taskId ? setChosenTask(null) : setChosenTask(taskId)
  }

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
        flexWrap: "wrap",
      }}
    >
      <Button
        sx={{
          borderRadius: 16,
          p:6,
          color: "black",
          bgcolor: chosenTask !== "data-exploration" ? "transparent" : blue[500],
          border: chosenTask !== "data-exploration" ? `1px solid ${blue[500]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: chosenTask !== "data-exploration" ? blue[500] : "white" },
        }}
        size="small"
        disableRipple
        onClick={handleChange("data-exploration")}
      >
        Data Exploration
      </Button>
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
      <Button
        sx={{
          borderRadius: 16,
          p:6,
          color: "black",
          bgcolor: chosenTask !== "model-analysis" ? "transparent" : blue[500],
          border: chosenTask !== "model-analysis" ? `1px solid ${blue[500]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: chosenTask !== "model-analysis" ? blue[500] : "white" },
        }}
        size="small"
        disableRipple
        onClick={handleChange("model-analysis")}
      >
        Model Analysis
      </Button>
    </Box>
  )
}

export default WorkflowSvg
