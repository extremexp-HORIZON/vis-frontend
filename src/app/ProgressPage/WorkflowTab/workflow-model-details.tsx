import {
  Box,
  Grid,
  Button,
  ButtonGroup,
} from "@mui/material"
import {
  DetailsCard,
  DetailsCardItem,
} from "../../../shared/components/details-card"
import ResponsiveCardVegaLite from "../../../shared/components/responsive-card-vegalite"
import AssessmentIcon from "@mui/icons-material/Assessment"
import InfoMessage from "../../../shared/components/InfoMessage"
import { useState } from "react"

const ModelDetails = () => {
  const info = (
    <InfoMessage
      message="Soon..."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: "info.main" }} />}
      fullHeight
    />
  )
  const [isMosaic, setIsMosaic] = useState(true)

  const showInfoMessage = true
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

        <DetailsCard title="Training Metadata">
          <DetailsCardItem label="Dataset" value="Customer Churn (v3.1)" />
          <DetailsCardItem label="Epochs" value="50" />
          <DetailsCardItem label="Batch Size" value="32" />
          <DetailsCardItem label="Learning Rate" value="0.001" />
          <DetailsCardItem label="Optimizer" value="Adam" />
        </DetailsCard>

        <DetailsCard title="Evaluation Metrics">
          <DetailsCardItem label="Accuracy" value="92.5%" />
          <DetailsCardItem label="Precision" value="91.3%" />
          <DetailsCardItem label="Recall" value="89.7%" />
          <DetailsCardItem label="F1 Score" value="90.5%" />
          <DetailsCardItem label="ROC AUC" value="0.94" />
        </DetailsCard>
      </Box>

      <Box paddingTop={5}>
        <Grid
          container
          justifyContent="flex-end" // Align to the right
          alignItems="center"
          sx={{ marginBottom: 2 }}
        >
          <ButtonGroup
            variant="contained"
            aria-label="view mode"
            sx={{
              height: "25px", // Ensure consistent height for the button group
            }}
          >
            <Button
              variant={isMosaic ? "contained" : "outlined"}
              color="primary"
              onClick={() => setIsMosaic(true)}
            >
              Mosaic
            </Button>
            <Button
              variant={!isMosaic ? "contained" : "outlined"}
              color="primary"
              onClick={() => setIsMosaic(false)}
            >
              Stacked
            </Button>
          </ButtonGroup>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={isMosaic ? 6 : 12}>
            <Box sx={{ minHeight: { md: 305, xl: 500 } }}>
              <ResponsiveCardVegaLite
                spec={[undefined]}
                aspectRatio={2}
                title="Confusion matrix "
                infoMessage={info}
                showInfoMessage={showInfoMessage}
              />
            </Box>
          </Grid>
          <Grid item xs={isMosaic ? 6 : 12}>
            <Box sx={{ minHeight: { md: 305, xl: 500 } }}>
              <ResponsiveCardVegaLite
                spec={[undefined]}
                aspectRatio={2}
                title="ROC curve"
                infoMessage={info}
                showInfoMessage={showInfoMessage}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
export default ModelDetails
