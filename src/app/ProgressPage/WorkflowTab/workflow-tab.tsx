import Box from '@mui/material/Box';
import { useEffect } from 'react';
import type { RootState} from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Paper } from '@mui/material';
import { fetchWorkflowMetrics, initTab, resetWorkflowTab } from '../../../store/slices/workflowPageSlice';
import { Resizable } from 're-resizable';
import WorkflowTreeView from './workflow-tree-view';
import SelectedItemViewer from './SelectedItemViewer';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTheme } from '@mui/material/styles';

const WorkflowTab = () => {
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage);
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();
  const theme = useTheme();

  useEffect(() => {
    if (!workflows.data.find(workflow => workflow.id === workflowId))
      navigate(`/${experimentId}/monitoring`);
    else dispatch(initTab({ tab: workflowId, workflows }));
  }, [workflows.data]);

  useEffect(() => {
    const metricNames = tab?.workflowMetrics.data?.map((m) => m.name);
    if (experimentId && workflowId && metricNames && isTabInitialized) {
      dispatch(fetchWorkflowMetrics({experimentId, workflowId, metricNames}));
    }
  },[workflows.data, isTabInitialized]);

  useEffect(() => {
    return () => {
      dispatch(resetWorkflowTab());
    };
  }, []);
 
  return (
    <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', gap: 1}}>
      {/* {(tab?.workflowConfiguration?.tasks?.length ?? 0) > 0 &&
        <Box sx={{px: 2,mt:1}}>
          <StaticDirectedGraph
            workflowSvg={tab?.workflowSvg.data || null}
            params={tab?.workflowConfiguration.params}
            handleOpenTask={function (taskName: string): void {
              throw new Error("Function not implemented.")
            }}
          />
        </Box>
      } */}
      <Box sx={{p: 2, height: '100%', display: 'flex', direction: 'row', gap: 1, overflow: 'hidden'}}>
        <Resizable
          defaultSize={{
            width: '25%',
            height: '100%',
          }}
          minWidth="0px"
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          maxWidth="30%"
          maxHeight="100%"
          style={{ height: '100%', position: 'relative'}}          
          handleStyles={{
            right: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              right: '-16px',
              zIndex: 10,
            }
          }}
          handleComponent={{
            right: (
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', 
                  cursor: 'ew-resize',
                }}        
              >
                <MoreVertRoundedIcon style={{ color: theme.palette.action.active }} />
              </Box>
            )
          }}
        >
          <Paper elevation={3} sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <WorkflowTreeView />
          </Paper>
        </Resizable>
        <Paper elevation={3} sx={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', ml: '8px' }}>
          <SelectedItemViewer />
        </Paper>
      </Box>
    </Box>
  );
};

export default WorkflowTab;
