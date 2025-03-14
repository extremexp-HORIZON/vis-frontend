import Box from "@mui/material/Box"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import { RootState, useAppSelector } from "../../../store/store"
import Rating from "@mui/material/Rating"
import { useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Tabs, Tab } from "@mui/material"

interface IWorkflowTab {
  workflowId: number | string
}

const WorkflowTab = (props: IWorkflowTab) => {
  const { workflowId } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const [chosenTask, setChosenTask] = useState<string | null>(null)
  const { workflows, progressBar } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const selectedTab = tabs.find(tab => tab.workflowId === workflowId)
  const navigate = useNavigate()
  const [selectedTabs, setSelectedTabs] = useState(0)

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mb: 3 }}>
        <Box
          key="workflow-title"
          sx={{
            display: "flex",
            flexDirection: "row",
            columnGap: 2,
            justifyContent: "left",
            alignItems: "center",
          }}
        >
          <ArrowBackIcon
            fontSize="large"
            sx={{
              fontSize: 48, // Bigger size
              cursor: "pointer",
              color: "black", // Black color
            }}
            onClick={() => navigate(-1)}
          />
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "2rem" }}
          >
            {`Workflow ${workflowId}`}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "2rem" }}
          >
            -
          </Typography>
          <Rating
            name="simple-uncontrolled"
            size="large"
            onChange={(event, newValue) => {
              console.log(newValue)
            }}
            defaultValue={2}
          />
        </Box>

        <Tabs
          value={selectedTabs}
          onChange={(event, newValue) => setSelectedTabs(newValue)}
          aria-label="tab menu"
        >
          <Tab
            sx={{
              fontWeight: 600,
              color: selectedTabs === 0 ? "black" : "gray",
            }}
            label="METRICS"
          />
          <Tab
            sx={{
              fontWeight: 600,
              color: selectedTabs === 1 ? "black" : "gray",
            }}
            label="DATA EXPLORATION"
          />
          <Tab
            sx={{
              fontWeight: 600,
              color: selectedTabs === 2 ? "black" : "gray",
            }}
            label="SOURCE CODE"
          />
          <Tab
            sx={{
              fontWeight: 600,
              color: selectedTabs === 3 ? "black" : "gray",
            }}
            label="MONITORING"
          />
          <Tab
            sx={{
              fontWeight: 600,
              color: selectedTabs === 4 ? "black" : "gray",
            }}
            label="USER INPUT"
          />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 2 }}>
          {selectedTabs === 0 && <Typography>Metrics 1 Content</Typography>}
          {selectedTabs === 1 && <Typography>Metrics 2 Content</Typography>}
          {selectedTabs === 2 && <Typography>Metrics 3 Content</Typography>}
          {selectedTabs === 3 && <Typography>Metrics 4 Content</Typography>}
        </Box>
      </Box>
    </>
  )
}

export default WorkflowTab
