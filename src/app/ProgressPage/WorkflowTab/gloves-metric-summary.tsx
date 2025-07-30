import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlovesTable from './gloves-table';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import { Stack, Card, LinearProgress } from '@mui/material';
import { useAppSelector } from '../../../store/store';
import InfoMessage from '../../../shared/components/InfoMessage';

const GlovesMetricSummary: React.FC = () => {
  const globalCounterfactualsData = useAppSelector(
    (state) =>
      state.workflowPage.tab?.workflowTasks?.modelAnalysis?.global_counterfactuals
  );

  const { TotalCost, TotalEffectiveness, actions, effCostActions } =
    globalCounterfactualsData?.data ?? {};

  // Check if `actions` is a valid object
  if (!actions || typeof actions !== 'object') {
    return (
      <InfoMessage
        message="No actions data available."
        type="info"
        fullHeight
      />
    );
  }

  if (TotalCost == null || TotalEffectiveness == null) {
    return (
      <InfoMessage
        message="No total cost or effectiveness data available."
        type="info"
        fullHeight
      />
    );
  }

  return (
    <ResponsiveCardTable
      showFullScreenButton={false}
      showSettings={false}
      title={'Metric Summary'}
      details={
        'Total Effectiveness: is the percentage of individuals that achieve the favorable outcome, if each one of the final actions is applied to the whole affected population. Total Cost: is calculated as the mean recourse cost of the whole set of final actions over the entire population.'
      }
      minHeight={400}
      maxHeight={400}
      noPadding={true}
    >
      <Box>
        <Stack direction="row" spacing={1} padding={1}>
          <Card
            sx={{
              flex: 1,
              padding: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f3f4f6, #e0e7ff)',
              boxShadow: 1,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              {/* <SavingsIcon fontSize="small" color="primary" /> */}
              <Typography fontWeight={600} variant="body2">
                Total Cost:
              </Typography>
              <Typography variant="body1">{TotalCost}</Typography>
            </Box>
          </Card>

          <Card
            sx={{
              flex: 1,
              padding: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #d7f5d1, #a2d57a)',
              boxShadow: 1,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              {/* <CheckCircleIcon fontSize="small" color="success" /> */}
              <Typography fontWeight={600} variant="body2">
                Total Effectiveness:
              </Typography>
              <Typography variant="body1">{(TotalEffectiveness * 100).toFixed(2)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={TotalEffectiveness * 100}
              sx={{ mt: 0.5, borderRadius: 1, height: 6 }}
            />
          </Card>
        </Stack>
      </Box>

      <GlovesTable
        data={actions}
        title={''}
        eff_cost_actions={effCostActions}
      />
    </ResponsiveCardTable>
  );
};

export default GlovesMetricSummary;
