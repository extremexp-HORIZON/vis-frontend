import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tabs, Tab, Card } from "@mui/material";
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent";
import { initTabs } from "../../../store/slices/workflowTabsSlice";

const WorkflowTab = () => {
  const { tabs } = useAppSelector((state: RootState) => state.workflowTabs);
  const { workflows } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const navigate = useNavigate();
  const [selectedTabs, setSelectedTabs] = useState(0);
  const [ searchParams ] = useSearchParams()
  const workflowId = searchParams.get("workflowId")
  const dispatch = useAppDispatch()
  const { experimentId } = useParams()
 
  useEffect (() => {
    if (!workflows.data.find(workflow => workflow.workflowId === workflowId)) navigate(`/${experimentId}/monitoring`)
    else dispatch(initTabs({tab: workflowId, workflows}))
  },[searchParams,workflows])

  return (
    <>
      {/* Sticky Header with Tabs */}
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          width: "100%",
          px: 2
        }}
      >
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
      <Box sx={{overflow: "auto", px: 2}}>
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
