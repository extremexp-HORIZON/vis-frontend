import { useMemo } from "react"
import type { RootState } from "../../../store/store"
import { useAppSelector } from "../../../store/store"
import WorkflowParameterDistribution from "./workflow-parameter-distribution"
import { IconButton, Paper, Tooltip, Typography } from "@mui/material"
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded"
import theme from "../../../mui-theme"
import { useParams } from "react-router-dom"
import { setCache } from "../../../shared/utils/localStorageCache"

const WorkflowParameter = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const { tab } = useAppSelector(state => state.workflowPage)
  const selectedParam = tab?.dataTaskTable.selectedItem?.data
  const { experimentId } = useParams()

  const filteredWorkflows = workflows.data
    ?.filter(w => w.status !== "SCHEDULED")
    .filter(w =>
      w.params.find(
        param => param.name === selectedParam.name && param.value === selectedParam.value
      )
    )

  const compareKey = useMemo(() => `compare-${Date.now()}`, [])
  const handleClick = () => {
    const workflowIds = filteredWorkflows?.map(workflow => workflow.id)
    setCache(compareKey, { workflowIds }, 1 * 60 * 1000)
  };

  return (
    <>
      <Paper sx={{ mb: 1, display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Typography variant="subtitle1">
          This workflow uses "{selectedParam.name}: {selectedParam.value}". In total{" "}
          {filteredWorkflows.length} workflow
          {filteredWorkflows.length !== 1 ? "s are" : "is"} using this configuration.
        </Typography>
        {filteredWorkflows.length > 1 && (
          <Tooltip title="Compare" placement="right">
            <a
              href={`/${experimentId}/monitoring?tab=1&compareId=${compareKey}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              style={{ textDecoration: "none" }}
            >
              <IconButton>
                <CompareArrowsRoundedIcon style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </a>
          </Tooltip>
        )}
      </Paper>
      <WorkflowParameterDistribution />
    </>
  );
};

export default WorkflowParameter;