import { useEffect } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppSelector, useAppDispatch } from '../../../../store/store';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import { Box, useTheme, useMediaQuery  } from '@mui/material';
import ScatterChartControlPanel from '../ChartControls/data-exploration-scatter-control';
import Loader from '../../../../shared/components/loader';
import { fetchUmap } from '../../../../store/slices/dataExplorationSlice';

const Uchart = () => {
  const tab = useAppSelector((state: RootState) => state.workflowPage.tab);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));
  const dispatch = useAppDispatch();

  const raw = tab?.workflowTasks.dataExploration?.scatterChart.data?.data;
  const parsedData = typeof raw === 'string' ? JSON.parse(raw) : raw;

  useEffect(() => {
    if (tab?.workflowTasks.dataExploration?.scatterChart.data?.data) {
      // Ensure payload is proper 2D array of numbers
      const umapPayload = parsedData.map((row: { [s: string]: unknown } | ArrayLike<unknown>) =>
        Object.values(row).map(val => parseFloat(val as string)),
      );

      dispatch(
        fetchUmap({
          data: umapPayload.slice(0, 2000), // Limit to first 1000 rows
          metadata: {
            workflowId: tab?.workflowId,
            query: 'umap',
          },
        }),
      );
    }
  }, [tab?.workflowTasks.dataExploration?.chart.data?.data, dispatch]);

  // Prepare VegaLite spec
  const spec = {
    mark: { type: 'point', tooltip: true },
    encoding: {
      x: { field: 'x', type: 'quantitative', axis: { title: null } },
      y: { field: 'y', type: 'quantitative', axis: { title: null } },
    },
    data: { name: 'table' },
  };

  // Format result to match the spec's expectations
  const chartData =
    tab?.workflowTasks.dataExploration?.umap?.data?.map((point: number[]) => ({
      x: point[0],
      y: point[1],
    })) || []; // Fallback to empty array if any part is null/undefined
  const info = (
    <Loader/>
  );

  const shouldShowInfoMessage =
    !tab?.workflowTasks.dataExploration?.controlPanel.selectedColumns || !chartData.length;

  return (
    <Box sx={{ height: '100%' }}>
      <ResponsiveCardVegaLite
        spec={spec}
        data={{ table: chartData }}
        actions={false}
        title={'UMAP'}
        maxHeight={500}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        controlPanel={<ScatterChartControlPanel />}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage}
        loading={tab?.workflowTasks.dataExploration?.umap?.loading}
      />
    </Box>
  );
};

export default Uchart;
