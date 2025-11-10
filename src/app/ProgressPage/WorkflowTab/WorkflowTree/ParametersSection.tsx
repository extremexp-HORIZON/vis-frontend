import { Box, Typography } from '@mui/material';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import theme from '../../../../mui-theme';
import { useAppDispatch } from '../../../../store/store';
import { setSelectedId, setSelectedItem } from '../../../../store/slices/workflowPageSlice';

type Param = { name: string; value: any; task?: string | null };
type Props = { taskId: string; paramsForTask: Param[]; variantId?: string };

export default function ParametersSection({ taskId, paramsForTask, variantId }: Props) {
  const dispatch = useAppDispatch();

  return (
    <>
      <TreeItem2
        itemId={`parameters-header-${taskId}`}
        slotProps={{ content: { style: { pointerEvents: 'none', backgroundColor: 'transparent' } } }}
        label={
          <Box sx={{ px: 1, py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Parameters</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>({paramsForTask.length})</Typography>
            </Box>
          </Box>
        }
      />
      {paramsForTask.map((param, index) => (
        <TreeItem2
          key={`${param.name}-${index}`}
          itemId={`param-${taskId}-${index}`}
          label={
            <Box
              onClick={() => {
                dispatch(setSelectedId(`param-${taskId}-${index}`));
                dispatch(setSelectedItem({ type: 'param', data: { param, variant: variantId } }));
              }}
              sx={{ px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Grid3x3Icon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">{param.name}: {String(param.value)}</Typography>
              </Box>
            </Box>
          }
        />
      ))}
    </>
  );
}
