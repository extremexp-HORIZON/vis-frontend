import MapChart from './data-exploration-new-map-chart';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import MapControls from '../ChartControls/data-exploration-map-control';
import { useAppSelector } from '../../../../store/store';
import InfoMessage from '../../../../shared/components/InfoMessage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SegmentMapChart from './data-exploration-segment-map-chart';
import HeatMapChart from './data-exploration-new-heatmap-chart';

const MapCardWrapper = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const mapType = tab?.workflowTasks.dataExploration?.controlPanel.mapType;


  const segmentBy =
    tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];

  const timestampField =
    tab?.workflowTasks.dataExploration?.controlPanel.timestampField;

  const timestampError =
    tab?.workflowTasks.dataExploration?.controlPanel.timestampError;


  const shouldShowInfoMessageSegment =
    segmentBy.length === 0 || timestampField === null || timestampError;


  const infoPoint = (
    <InfoMessage
      message="Please select Color field to display the map."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const infoSegment = (
    <InfoMessage
      message="Please select Segment by and Order by fields to display the Trajectory Map."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const infoHeatmap = (
    <InfoMessage
      message="Please select Weight field to display the Heatmap."
      type="info"
      icon={<AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

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
          {shouldShowInfoMessageSegment ? infoSegment : <SegmentMapChart />}
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
