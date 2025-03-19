import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import WorkflowCard from "../../../../shared/components/workflow-card"
import GlovesTable from "../Tables/gloves-table"

interface MetricSummaryProps {
  cost: number
  eff: number
  actions: any
  instances: any
  eff_cost_actions: any
}

const GlovesMetricSummary: React.FC<MetricSummaryProps> = ({
  cost,
  eff,
  actions,
  instances,
  eff_cost_actions,
}) => {
  // Check if `actions` is a valid object
  if (!actions || typeof actions !== "object") {
    return <Typography>No actions data available</Typography>
  }

  if (cost == null || eff == null) {
    return <Typography>No data available</Typography>
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex", // Aligns items in a row
          flexDirection: "row", // Horizontal alignment
          gap: 2, // Space between items
          padding: 2,
          borderRadius: 4,
          minWidth: "300px",
        }}
      >
        <Paper sx={{ padding: 2, flex: 1 }}>
          {" "}
          {/* flex: 1 to balance width */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={600}>Total Cost:</Typography>
            <Typography>{cost}</Typography>
          </Box>
        </Paper>

        <Paper sx={{ padding: 2, flex: 1 }}>
          {" "}
          {/* flex: 1 to balance width */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={600}>Total Effectiveness:</Typography>
            <Typography>{eff * 100}%</Typography>
          </Box>
        </Paper>
      </Box>
      <Box marginBottom={1}>
        <WorkflowCard
     title={"Counterfactual Actions"}
          description="Set of final global counterfactual actions generated"
        >
          <GlovesTable
            data={actions}
            title={""}
            eff_cost_actions={eff_cost_actions}
          />
        </WorkflowCard>
      </Box>
    </Box>
  )
}

export default GlovesMetricSummary
