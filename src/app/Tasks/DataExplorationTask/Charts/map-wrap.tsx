import MapChart from './data-exploration-new-map-chart';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import MapControls from '../ChartControls/data-exploration-map-control';
import { useAppSelector } from '../../../../store/store';
import SegmentMapChart from './data-exploration-segment-map-chart';
import HeatMapChart from './data-exploration-new-heatmap-chart';

const MapCardWrapper = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const mapType = tab?.workflowTasks.dataExploration?.controlPanel.mapType;

  return (
    <>
      {mapType === 'point' && (
        <ResponsiveCardTable
          title={'point map'}
          controlPanel={<MapControls />}
          noPadding={true}
        >
          <MapChart />
        </ResponsiveCardTable>
      )}
      {mapType === 'trajectory' && (
        <ResponsiveCardTable
          title={'Trajectory Map'}
          controlPanel={<MapControls />}
          noPadding={true}
        >
          <SegmentMapChart />
        </ResponsiveCardTable>
      )}
      {mapType === 'heatmap' && (
        <ResponsiveCardTable
          title={'Heatmap'}
          controlPanel={<MapControls />}
          noPadding={true}
        >
          <HeatMapChart />
        </ResponsiveCardTable>
      )}
    </>
  );
};

export default MapCardWrapper;
