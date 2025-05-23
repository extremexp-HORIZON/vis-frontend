import { Typography, Box } from '@mui/material';
import { useAppSelector } from '../../../store/store';
import DataExplorationComponent from '../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent';
import { WorkflowMetricChart } from './workflow-metric-chart';
import WorkflowTaskOverview from './workflow-task-overview';
import InfoMessage from '../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WorkflowParameter from './workflow-parameter';
import DatasetIcon from '@mui/icons-material/Dataset';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import BarChartIcon from '@mui/icons-material/BarChart';
import theme from '../../../mui-theme';
import ModelDetails from './workflow-model-details';
import InstanceView from './workflow-instance-view';
import HyperparameterImpact from './workflow-hyperparameter-impact';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import InsightsIcon from '@mui/icons-material/Insights';
import FeatureExplainability from './workflow-feature-explainability';

const SelectedItemViewer = () => {
  const { selectedItem, selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedItem: null,
        selectedTask: null,
      },
  );

  // Enhanced header component for consistency
  const Header = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <Box sx={{
      borderBottom: `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1.5,
    }}>
      {icon}
      <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
        {title}
      </Typography>
    </Box>
  );

  if (selectedTask?.role === 'TASK') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={`${selectedTask?.variant || selectedTask?.task} Overview`}
          icon={<AssessmentIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'auto' }}>
          <WorkflowTaskOverview />
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'DATASET') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={`${selectedItem?.data?.dataset?.name} Details`}
          icon={<DatasetIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <DataExplorationComponent />
          </Box>
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'param') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={`${selectedItem.data?.param?.name} Details`}
          icon={<Grid3x3Icon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <Box>
              <WorkflowParameter />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'metric') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={`${selectedItem.data?.metric?.name} Details`}
          icon={<BarChartIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <WorkflowMetricChart />
          </Box>
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'model') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={`${selectedItem.data.model} Overview`}
          icon={<ModelTrainingIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'auto' }}>
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <ModelDetails/>
          </Box>

        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'instance-view') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={'Instance View'}
          icon={<QueryStatsIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'auto' }}>
          <InstanceView/>
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'feature-effects') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={'Feature Explainability'}
          icon={<InsightsIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'auto' }}>
          <FeatureExplainability />
        </Box>
      </Box>
    );
  }

  if (selectedItem?.type === 'hyperparameters') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          title={'ML Hyperparameter Explainability'}
          icon={<PermDataSettingIcon color="primary" />}
        />
        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflow: 'auto' }}>
          <HyperparameterImpact />
        </Box>
      </Box>
    );
  }

  return (
    <InfoMessage
      message="No selection yet. Click a task or item to view its details."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );
};

export default SelectedItemViewer;
