import { Box, Typography } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import InsightsIcon from '@mui/icons-material/Insights';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import theme from '../../../../mui-theme';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setSelectedId, setSelectedItem } from '../../../../store/slices/workflowPageSlice';
import type { RootState } from '../../../../store/store';

export default function ModelInsightsAccordion() {
  const dispatch = useAppDispatch();
  const { experiment } = useAppSelector(
    (state: RootState) => state.progressPage,
  );
  const { tab } = useAppSelector((s: RootState) => s.workflowPage);
  const hasModelpt = tab?.workflowConfiguration.dataAssets?.some(
    asset => asset.name === 'model.pt'
  );

  return (
    <SimpleTreeView defaultExpandedItems={['model']} selectedItems={tab?.dataTaskTable?.selectedId ?? null}>
      <TreeItem2
        aria-expanded
        itemId="model"
        slotProps={{ content: { style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 } } }}
        aria-disabled={hasModelpt || experiment.data?.name === 'main_BestClassifier'}
        label={
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              cursor: hasModelpt || experiment.data?.name === 'main_BestClassifier' ? 'not-allowed' : 'pointer',
              opacity: hasModelpt || experiment.data?.name === 'main_BestClassifier' ? 0.5 : 1,
              pointerEvents: hasModelpt || experiment.data?.name === 'main_BestClassifier' ? 'none' : 'auto',
            }}
            onClick={(e) => {
              if(hasModelpt || experiment.data?.name === 'main_BestClassifier') return;
              e.stopPropagation();
              dispatch(setSelectedId('model'));
              dispatch(setSelectedItem({ type: 'model', data: { model: 'Model.pkl' } }));
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, flexWrap: 'wrap', minWidth: 0 }}>
              <ModelTrainingIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography sx={{ mr: 1 }}>TrainedModel</Typography>
              <Typography sx={{ color: theme.palette.primary.main }}>{hasModelpt ? '[Model.pt]' : '[Model.pkl]'}</Typography>
            </Box>
          </Box>
        }
      >
        {[
          { id: 'instance-view', icon: <QueryStatsIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />, label: 'Instance View' },
          { id: 'feature-effects', icon: <InsightsIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />, label: 'Feature Explainability' },
          { id: 'hyperparameters', icon: <PermDataSettingIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />, label: 'Hyperparameter Explainability' },
          { id: 'global-counterfactuals', icon: <TravelExploreIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />, label: 'Global Counterfactuals' },
        ].map(({ id, icon, label }) => {
          const disabled = id !== 'feature-effects' && hasModelpt;
          const disabledIdeko = id !== 'hyperparameters' && experiment.data?.name === 'main_BestClassifier';

          return (
            <TreeItem2
              key={id}
              itemId={id}
              aria-disabled={disabled || disabledIdeko}
              label={
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: disabled || disabledIdeko ? 'not-allowed' : 'pointer',
                    opacity: disabled || disabledIdeko ? 0.5 : 1,
                    pointerEvents: disabled || disabledIdeko ? 'none' : 'auto',
                  }}
                  onClick={() => {
                    if(disabled || disabledIdeko) return;
                    dispatch(setSelectedId(id));
                    dispatch(setSelectedItem({ type: id as any }));
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    <Typography>{label}</Typography>
                  </Box>
                </Box>
              }
            />
          );
        })}
      </TreeItem2>
    </SimpleTreeView>
  );
}
