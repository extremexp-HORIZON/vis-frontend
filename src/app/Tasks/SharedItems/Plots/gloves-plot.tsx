import React, { useEffect, useMemo, useState } from "react"
import {
  Button,
  Typography,
  Select,
  MenuItem,
  Box,
  InputLabel,
  FormControl,
  OutlinedInput,
  Collapse,
  Tooltip,
  Paper,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material"
import { IWorkflowTabModel } from "../../../../shared/models/workflow.tab.model"
import {
  fetchAffected,
  fetchModelAnalysisExplainabilityPlot,
} from "../../../../shared/models/tasks/model-analysis.model"
import WorkflowCard from "../../../../shared/components/workflow-card"
import { fetchExplainabilityPlotPayloadDefault } from "../../../../shared/models/tasks/explainability.model"
import GlovesScatter from "./gloves-scatter"
import GlovesMetricSummary from "./gloves-metric-summary"
import { useAppDispatch } from "../../../../store/store"

interface CGlanceExecutionProps {
  workflow: IWorkflowTabModel
  availableCfMethods: string[]
  availableActionStrategies: string[]
  availableFeatures: string[]
}

interface ApplyAffectedActionsResponse {
  applied_affected_actions: Record<string, ITableContents>
}
interface ITableContents {
  [key: string]: IValues
}

interface IValues {
  values: string[]
  index: number
  colour: string[]
}

const CGlanceExecution: React.FC<CGlanceExecutionProps> = ({
  workflow,
  availableCfMethods,
  availableActionStrategies,
  availableFeatures,
}) => {
  const [cfMethod, setCfMethod] = useState<string>(availableCfMethods[0] || "")
  const [actionChoiceStrategy, setActionChoiceStrategy] = useState<string>(availableActionStrategies[0] || "")
  const [gcfSizes, setGcfSizes] = useState<Map<string, number>>(new Map())
  const [gcfSize, setGcfSize] = useState<number>(3) // Default size
  const [selectedFeature, setSelectedFeature] = useState<string[]>([]) // Start with empty array
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false) // To control the collapse state

  const dispatch = useAppDispatch()

  // Sync the local gcfSize with the workflow-specific size on workflow change
  useEffect(() => {
    const size = gcfSizes.get(workflow.workflowId) || 3 // Default to 3 if not set
    setGcfSize(size)
  }, [workflow.workflowId, gcfSizes])

  useEffect(() => {
    if (availableCfMethods.length > 0 && !cfMethod) {
      setCfMethod(availableCfMethods[0])
    }
    if (availableFeatures.length > 0 && selectedFeature.length === 0) {
      setSelectedFeature(availableFeatures) // Only set if `selectedFeature` is empty
    }
  }, [availableCfMethods, availableFeatures])

  const fetchData = async () => {
    try {
      // Dispatch global_counterfactuals
      await dispatch(
        fetchModelAnalysisExplainabilityPlot({
          ...fetchExplainabilityPlotPayloadDefault,
          explanationType: "featureExplanation",
          explanationMethod: "global_counterfactuals",
          model: "I2Cat_phising_model",
          feature1: selectedFeature[0] || "",
          feature2: selectedFeature[1] || "",
          modelId: parseInt(workflow.workflowId, 10),
          gcfSize,
          cfGenerator: cfMethod,
          clusterActionChoiceAlgo: actionChoiceStrategy,
        }),
      )

      // Dispatch affected
      await dispatch(
        fetchAffected({
          workflowId: parseInt(workflow.workflowId, 10),
          queryCase: "affected",
        }),
      )

      console.log(
        "Dispatched global_counterfactuals and affected successfully.",
      )
    } catch (error) {
      console.error("Error dispatching data:", error)
    }
  }

  const handleGcfSizeChange = (event: SelectChangeEvent<number>) => {

    const newSize = event.target.value as number

    // Update the size in the `Map`
    setGcfSizes(prevSizes => {
      const newSizes = new Map(prevSizes) // Create a new `Map` to trigger re-render
      newSizes.set(workflow.workflowId, newSize)
      return newSizes
    })

    // Update the local state for the dropdown
    setGcfSize(newSize)
  }

  return (
    <>
      <Paper
        className="Category-Item"
        elevation={2}
        sx={{
          borderRadius: 4,
          width: "inherit",
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          minWidth: "300px",
          height: "100%",
        }}
      >
        {/* Box container to arrange elements side by side */}
        <Box
          alignItems="center"
          justifyContent="center"
          gap={2}
          marginBottom={2}
          marginTop={2}
          flexWrap="wrap"
        >
          {/* Dropdown for GCF Size */}
          <Tooltip title="The number of actions to be generated in the end of the algorithm">
            <FormControl
              sx={{
                width: "10%",
                flex: 1,
                minWidth: "150px",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            >
              <InputLabel id="gcf-size-select-label">
                Number of CounterFactual Actions
              </InputLabel>
              <Select
                size="small"
                MenuProps={{
                  PaperProps: { style: { maxHeight: 224, width: 250 } },
                }}
                labelId="gcf-size-select-label"
                input={
                  <OutlinedInput label="Number of CounterFactual Actions" />
                }
                value={gcfSize}
                onChange={handleGcfSizeChange}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
          <Button
            variant="contained"
            onClick={fetchData}
            color="primary"
            sx={{ flex: 1, minWidth: "150px", marginRight: "10px" }}
          >
            Run
          </Button>
          <Button
            variant="contained"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            {advancedOptionsOpen
              ? "Hide Advanced Options"
              : "Show Advanced Options"}
          </Button>
        </Box>

        {/* Advanced Options */}
        <Collapse in={advancedOptionsOpen}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            marginTop={3}
          >
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              {/* Local Counterfactual Method Dropdown */}
              <Tooltip title="Methods that generate candidate counterfactual explanations">
                <FormControl fullWidth sx={{ flex: 1, minWidth: "350px" }}>
                  <InputLabel id="cf-method-select-label">
                    Local Counterfactual Method
                  </InputLabel>
                  <Select
                    labelId="cf-method-select-label"
                    input={
                      <OutlinedInput label="Local Counterfactual Method" />
                    }
                    value={cfMethod}
                    onChange={(e) => setCfMethod(e.target.value as string)}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 224, width: 250 } },
                    }}
                  >
                    {availableCfMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>

              {/* Action Choice Strategy Dropdown */}
              <Tooltip title="Different strategies for selecting the best actions from the generated counterfactuals based on different criteria">
                <FormControl fullWidth sx={{ flex: 1, minWidth: "350px" }}>
                  <InputLabel id="action-choice-strategy-select-label">
                    Action Choice Strategy
                  </InputLabel>
                  <Select
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 224, width: 250 } },
                    }}
                    labelId="action-choice-strategy-select-label"
                    input={
                      <OutlinedInput label="Action Choice Strategy" />
                    }
                    value={actionChoiceStrategy}
                    onChange={(e) =>
                      setActionChoiceStrategy(e.target.value as string)
                    }
                  >
                    {availableActionStrategies.map((strategy) => (
                      <MenuItem key={strategy} value={strategy}>
                        {strategy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>
            </Box>
          </Box>
        </Collapse>

        <Box>
          {workflow.workflowTasks.modelAnalysis?.global_counterfactuals.loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={2}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Loading
              </Typography>
            </Box>
          ) : workflow.workflowTasks.modelAnalysis?.global_counterfactuals.error ? (
            <Typography
              variant="body2"
              color="error"
              align="center"
              sx={{ mt: 2 }}
            >
              No counterfactuals found for this configuration of the workflow
            </Typography>
          ) : (
            workflow.workflowTasks.modelAnalysis?.global_counterfactuals.data &&
            workflow.workflowTasks.modelAnalysis?.affected.data && (
              <>
                <GlovesMetricSummary
                  cost={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.totalCost
                  }
                  eff={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.totalEffectiveness
                  }
                  actions={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.actions
                  }
                  instances={undefined}
                  eff_cost_actions={
                    workflow.workflowTasks.modelAnalysis.global_counterfactuals
                      .data.effCostActions
                  }
                />
                <Box marginTop={2}>
                  <WorkflowCard
                    title={"Plotting"}
                    description="Set of final global counterfactual actions generated"
                  >
                    <GlovesScatter
                      data1={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.affectedClusters
                      }
                      data2={
                        workflow.workflowTasks.modelAnalysis.affected.data
                      }
                      actions={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.actions
                      }
                      eff_cost_actions={
                        workflow.workflowTasks.modelAnalysis
                          .global_counterfactuals.data.effCostActions
                      }
                    />
                  </WorkflowCard>
                </Box>
              </>
            )
          )}
        </Box>
      </Paper>
    </>
  );
};

export default CGlanceExecution;