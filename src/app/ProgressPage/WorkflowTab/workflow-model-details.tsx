import {
  Box,
  Grid
} from "@mui/material"
import {
  DetailsCard,
  DetailsCardItem,
} from "../../../shared/components/details-card"
import AssessmentIcon from "@mui/icons-material/Assessment"
import InfoMessage from "../../../shared/components/InfoMessage"
import { useState } from "react"
import ConfusionMatrixPlot from "../../Tasks/ModelAnalysisTask/plots/confusion-matrix-plot"
import RocCurvePlot from "../../Tasks/ModelAnalysisTask/plots/roc-curve-plot"
import ClassificationReportTable from "../../Tasks/ModelAnalysisTask/plots/classification-report-table"

const ModelDetails = () => {

  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "row", gap: 3, width: "100%" }}
      >
        <DetailsCard title="Model Summary">
          <DetailsCardItem label="Model Type" value="Random Forest" />
          <DetailsCardItem label="Input Shape" value="[128, 64]" />
          <DetailsCardItem label="Number of Parameters" value="1,024,000" />
          <DetailsCardItem label="Version" value="v1.2.3" />
        </DetailsCard>
      </Box>

      <Box paddingTop={5}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ClassificationReportTable />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ minHeight: { md: 305, xl: 400 } }}>
              <ConfusionMatrixPlot />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ minHeight: { md: 305, xl: 400 } }}>
              <RocCurvePlot />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
export default ModelDetails
