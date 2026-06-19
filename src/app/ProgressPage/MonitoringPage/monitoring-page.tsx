import { Box, Tab, Tabs, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import ParallelCoordinatePlot from './ParalleleCoodrinates/parallel-coordinate-plot';
import WorkflowTable from './WorkFlowTables/workflow-table';
import ScheduleTable from './WorkFlowTables/schedule-table';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { Resizable } from 're-resizable';
import {
  bulkToggleWorkflowSelection,
  setSelectedTab,
  setVisibleTable,
} from '../../../store/slices/monitorPageSlice';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { getCache } from '../../../shared/utils/localStorageCache';
import { useLocation } from 'react-router-dom';
import ComparativeAnalysis from './ComparativeAnalysis/comparative-analysis';
import ExperimentExplainability from './ExperimentExplainability';
import LlmMonitoringOverview from './LLMOverview/llm-monitoring-overview';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';

const MonitoringPage = () => {
  const { visibleTable, selectedTab, workflowsTable } = useAppSelector(
    (state: RootState) => state.monitorPage,
  );
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);
  const isLlmExperiment = useAppSelector(
    (state: RootState) => state.progressPage.experiment.data?.tags?.experiment_type?.toLowerCase() === 'llm',
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const compareId = queryParams.get('compareId');
  const tabParam = queryParams.get('tab');
  const compareWorkflowsRef = useRef<string[] | null>(null);

  const hasExplainability = useMemo(() => {
    const firstWorkflow = workflows.data?.[0];
    const tasks = firstWorkflow?.tasks;
    const dataAssets = firstWorkflow?.dataAssets;

    if (!tasks) return true;

    return tasks.some(t => typeof t.name === 'string' && /explainability/i.test(t.name)) &&
      !dataAssets?.some((asset: IDataAsset) => asset.name === 'model.pt');
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

  useEffect(() => {
    if (
      workflowsTable.initialized &&
      compareWorkflowsRef.current &&
      compareWorkflowsRef.current.length > 0
    ) {
      dispatch(bulkToggleWorkflowSelection(compareWorkflowsRef.current));
      compareWorkflowsRef.current = null;
    }
  }, [workflowsTable.initialized]);

  return (
    <>
      {/* Sticky Header: tabs + inline KPI strip */}
      <Box
        sx={{
          borderColor: theme => theme.palette.customGrey.main,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          width: '100%',
          px: 2,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(_event, newValue) => {
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
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              gap: 0.5,
              px: 1.5,
              minHeight: 44,
              textTransform: 'uppercase',
            },
          }}
        >
          <Tab
            icon={<DashboardRoundedIcon fontSize="small" />}
            iconPosition="start"
            label="Overview"
          />
          <Tab
            icon={<CompareArrowsRoundedIcon fontSize="small" />}
            iconPosition="start"
            label="Compare"
          />
          <Tab
            icon={isLlmExperiment ? <MoreVertRoundedIcon fontSize="small" /> : <LightbulbOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={isLlmExperiment ? "Traces" : "Explainability"}
            disabled={!hasExplainability&&!isLlmExperiment}
          />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          px: 1.5,
          pt: 0,
          pb: 1.5,
        }}
      >
        {selectedTab === 0 && (
         
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ flex: '0 0 60%', minHeight: 320 }}>
                {visibleTable === 'workflows' ? (
                  <WorkflowTable />
                ) : (
                  <ScheduleTable />
                )}
              </Box>
              <Box sx={{ flex: 1, minHeight: 220 }}>
                <ParallelCoordinatePlot />
              </Box>
            </Box>
          
        )}
        {selectedTab === 1 && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              gap: 1.5,
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
                    <MoreVertRoundedIcon sx={{ color: 'action.active' }} />
                  </Box>
                )
              }}
            >
              <WorkflowTable />
            </Resizable>
            <Paper elevation={0} variant="outlined" sx={{ flex: 1, overflow: 'auto', height: '100%', borderRadius: 1.5 }}>
              <ComparativeAnalysis />
            </Paper>
          </Box>
        )}
        {selectedTab === 2 && (isLlmExperiment ? <LlmMonitoringOverview /> :
        <ExperimentExplainability />)}
      </Box>
    </>
  );
};

export default MonitoringPage;

