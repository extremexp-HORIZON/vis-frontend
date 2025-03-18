import Box from "@mui/material/Box";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { RootState, useAppSelector } from "../../../store/store";
import Rating from "@mui/material/Rating";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Tabs, Tab, Card, CircularProgress, IconButton } from "@mui/material";
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

interface IWorkflowTab {
  workflowId: number | string;
}

const WorkflowTab = ({ workflowId }: IWorkflowTab) => {
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs);
  const { workflows, progressBar } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const navigate = useNavigate();
  const [selectedTabs, setSelectedTabs] = useState(0);

  return (
    <>
      {/* Sticky Header with Tabs */}
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ArrowBackIcon
              fontSize="large"
              sx={{ fontSize: 48, cursor: "pointer", color: "black" }}
              onClick={() => navigate(-1)}
            />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {`Workflow ${workflowId}`}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>-</Typography>
            <Rating name="simple-uncontrolled" size="large" defaultValue={2} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={progressBar.progress}
                size={50}
                thickness={5}
                sx={{ color: (theme) => theme.palette.primary.main }}
              />
              <Box
                sx={{
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  width: "100%",
                  height: "100%",
                }}
              >
                {`${Math.round(progressBar.progress)}%`}
              </Box>
            </Box>
            <IconButton onClick={() => console.log("Paused")} color="primary">
              <PauseIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={() => console.log("Stopped")} color="primary">
              <StopIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={selectedTabs}
          onChange={(event, newValue) => setSelectedTabs(newValue)}
          // aria-label="tab menu"
        >
          <Tab label="METRICS" />
          <Tab label="DATA EXPLORATION" />
          <Tab label="SOURCE CODE" />
          <Tab label="MONITORING" />
          <Tab label="USER INPUT" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {selectedTabs === 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {workflows.data
              .find((workflow) => workflow.workflowId === workflowId)
              ?.metrics.map((metric) => (
                <Card
                  key={metric.metricId}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    textAlign: "center",
                    backgroundColor: "#f5f5f5",
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="body1">{metric.name}</Typography>
                  <Typography variant="h6" sx={{ color: "blue" }}>
                    {metric.value}
                  </Typography>
                </Card>
              ))}
          </Box>
        )}
        {selectedTabs === 1 && (
          <DataExplorationComponent
            workflow={tabs.find((tab) => tab.workflowId === workflowId) || null}
          />
        )}
        {selectedTabs === 2 && <Typography>Source Code Content</Typography>}
        {selectedTabs === 3 && <Typography>Monitoring Content</Typography>}
        {selectedTabs === 4 && <Typography>User Input Content</Typography>}
      </Box>
    </>
  );
};

export default WorkflowTab;
