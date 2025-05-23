import MapChart from './data-exploration-new-map-chart';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import MapControls from '../ChartControls/data-exploration-map-control';
import { useAppSelector } from '../../../../store/store';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SegmentMapChart from './data-exploration-segment-map-chart';

const MapCardWrapper = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const useHeatmap = tab?.workflowTasks.dataExploration?.controlPanel.heatmap;
  // const colorByMap = tab?.workflowTasks.dataExploration?.controlPanel.colorByMap;
  const shouldShowInfoMessage = !lat || !lon ;
  const info = (
    <InfoMessage
      message="Please select Latitude, Longitude and Color fields to display the map."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];
  const shouldUseSegmentView = segmentBy?.length > 0 ;

  return (
    <ResponsiveCardTable
      title={
        useHeatmap ?
          'Map (Heat View)' : shouldUseSegmentView ? 'Map (Segment View)' : 'Map (Point View)'}
      controlPanel={<MapControls />}
      noPadding={true}
    >
      {shouldShowInfoMessage ? info : shouldUseSegmentView ? <SegmentMapChart /> : <MapChart />}
    </ResponsiveCardTable>
  );
};

export default MapCardWrapper;
