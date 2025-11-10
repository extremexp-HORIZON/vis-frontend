import { Box, Tab, Tabs, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import ParallelCoordinatePlot from './ParalleleCoodrinates/parallel-coordinate-plot';
import WorkflowTable from './WorkFlowTables/workflow-table';
import ScheduleTable from './WorkFlowTables/schedule-table';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { Resizable } from 're-resizable';
import { bulkToggleWorkflowSelection, setSelectedTab, setVisibleTable } from '../../../store/slices/monitorPageSlice';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTheme } from '@mui/material/styles';
import { getCache } from '../../../shared/utils/localStorageCache';
import { useLocation } from 'react-router-dom';
import ComparativeAnalysis from './ComparativeAnalysis/comparative-analysis';
import ExperimentExplainability from './ExperimentExplainability';

const MonitoringPage = () => {
  const { visibleTable, selectedTab, workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } = useAppSelector((state: RootState) =>  state.progressPage)
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const compareId = queryParams.get('compareId');
  const tabParam = queryParams.get('tab');
  const compareWorkflowsRef = useRef<string[] | null>(null);

  const hasExplainability = useMemo(() => {
    const firstWorkflow = workflows.data?.[0];
    const tasks = firstWorkflow?.tasks;

    if (!tasks) return true;

    return tasks.some(t => typeof t.name === 'string' && /explainability/i.test(t.name));
  }, [workflows]);


  useEffect(() => {
    if (compareId) {
      const parsed = getCache<{ workflowIds: string[] }>(compareId);

      if (parsed?.workflowIds) {
        compareWorkflowsRef.current = parsed.workflowIds;
      }
    }

    if (tabParam) {
      dispatch(setSelectedTab(Number(tabParam)));
    }
  }, [compareId, tabParam]);

  // Apply toggleWorkflowSelection only after workflowsTable is loaded
  useEffect(() => {
    if (
      workflowsTable.initialized &&
      compareWorkflowsRef.current &&
      compareWorkflowsRef.current.length > 0
    ) {
      dispatch(bulkToggleWorkflowSelection(compareWorkflowsRef.current));
      compareWorkflowsRef.current = null; // avoid rerunning
    }
  }, [workflowsTable.initialized]);

  return (
    <>
      {/* Sticky Header with Tabs */}
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 2,
          borderBottomStyle: 'solid',
          width: '100%',
          px: 2,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => {
            const searchParams = new URLSearchParams(location.search);

            searchParams.delete('compareId');
            searchParams.set('tab', newValue);
            navigate({
              pathname: location.pathname,
              search: searchParams.toString(),
            }, { replace: true });

            if (newValue === 1) {
              dispatch(setVisibleTable('workflows'));
            }
          }}

          // aria-label="tab menu"
        >
          <Tab label="OVERVIEW" />
          <Tab label="COMPARATIVE ANALYSIS" />
          <Tab label="EXPLAINABILITY" disabled={!hasExplainability}/>
        </Tabs>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 1,
          height: '100%',
          overflow: 'auto', // enables scrolling when table minHeight is applied in the overview page
          px: 2
        }}
      >
        {selectedTab === 0 && (
          <Box sx={{ height: '98%' }}>
            <Box sx={{ height: '60%', minHeight: '350px', paddingBottom: 1 }}>
              {visibleTable === 'workflows' ? (
                <WorkflowTable />
              ) : (
                <ScheduleTable />
              )}
            </Box>
            <Box sx={{ height: '40%', minHeight: '250px' }}>
              <ParallelCoordinatePlot />
            </Box>
          </Box>
        )}
        {selectedTab === 1 && (
          <Box
            sx={{
              height: '99%',
              display: 'flex',
              gap: 1,
            }}
          >
            <Resizable
              defaultSize={{
                width: '30%',
                height: '100%',
              }}
              minWidth="200px"
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
              maxWidth="50%"
              maxHeight="100%"
              style={{ height: '100%', position: 'relative' }}
              handleStyles={{
                right: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',  // Fixed width for handle area
                  right: '-16px',  // Position handle to overlap both components
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
              <WorkflowTable />
            </Resizable>
            <Paper elevation={2} sx={{ flex: 1, overflow: 'auto', height: '100%', ml: '8px' }}>
              <ComparativeAnalysis />
            </Paper>
          </Box>
        )}
        {selectedTab === 2 && <ExperimentExplainability />}
      </Box>
    </>
  );
};

export default MonitoringPage;
