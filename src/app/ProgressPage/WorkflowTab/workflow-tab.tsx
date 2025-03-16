import Box from "@mui/material/Box"
import { useState } from "react"
import Typography from "@mui/material/Typography"
import { RootState, useAppSelector } from "../../../store/store"
import Rating from "@mui/material/Rating"
import { useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Tabs, Tab, Card, CircularProgress } from "@mui/material"
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent"
import PauseIcon from "@mui/icons-material/Pause"
import StopIcon from "@mui/icons-material/Stop"
interface IWorkflowTab {
  workflowId: number | string
}

const WorkflowTab = (props: IWorkflowTab) => {
  const { workflowId } = props
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs)
  const { workflows, progressBar } = useAppSelector(
    (state: RootState) => state.progressPage,
  )
  const selectedTab = tabs.find(tab => tab.workflowId === workflowId)
  const navigate = useNavigate()
  const [selectedTabs, setSelectedTabs] = useState(0)
  console.log("progressBar:", progressBar)

  return (
    <>
      <Box
        key="workflow-title"
        sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: 2,
          justifyContent: "space-between", // Ensures left and right alignment
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              variant="determinate"
              value={progressBar.progress}
              size={50}
              thickness={5}
              sx={{ color: theme => theme.palette.primary.main }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {`${Math.round(progressBar.progress)}%`}
            </Box>
          </Box>
          <PauseIcon
            onClick={() => console.log("clicked")}
            sx={{
              cursor: "pointer",
              color: theme => theme.palette.primary.main,
            }}
            fontSize="large"
          />
          <StopIcon
            onClick={() => console.log("clicked")}
            sx={{
              cursor: "pointer",
              color: theme => theme.palette.primary.main,
            }}
            fontSize="large"
          />
        </Box>
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
        {selectedTabs === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {workflows.data
              .find(workflow => workflow.workflowId === workflowId)
              ?.metrics.map(metric => (
                <Card
                  key={metric.metricId}
                  sx={{
                    flex: 1, // Ensures cards take equal space
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 200 }}>
                    {metric.name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "blue" }}>
                    {metric.value}
                  </Typography>
                </Card>
              ))}
          </Box>
        )}

        {selectedTabs === 1 && (
          <DataExplorationComponent
            workflow={tabs.find(tab => tab.workflowId === workflowId) || null}
          />
        )}
        {selectedTabs === 2 && <Typography>Source Code Content</Typography>}
        {selectedTabs === 3 && <Typography>Montiroring Content</Typography>}
        {selectedTabs === 4 && <Typography>User Input Content</Typography>}
      </Box>
    </>
  )
}

export default WorkflowTab
