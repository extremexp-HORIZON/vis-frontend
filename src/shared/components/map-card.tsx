import { useCallback } from "react";
import ResponsiveCard from "./responsice-card";
import MapChart from "../../app/Tasks/DataExplorationTask/Charts/data-exploration-map-chart";
import MapVisualization from "../../app/Tasks/DataExplorationTask/Charts/allo-map";

interface MapCardProps {
  title?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  controlPanel?: React.ReactNode;
  blinkOnStart?: boolean;
  infoMessage?: React.ReactElement;
  showInfoMessage?: boolean;
  // MapChart specific props
 
}

const MapCard: React.FC<MapCardProps> = (props) => {
  const handleDownload = useCallback(() => {
    // Implement map download functionality here
    console.log("Downloading map...");
  }, []);

  const handleViewData = useCallback(() => {
    // Implement data viewing functionality here
    console.log("Viewing map data...");
  }, []);

  return (
    <ResponsiveCard
      {...props}
      onDownload={handleDownload}
      onViewData={handleViewData}
    >
      <MapChart />
      {/* <MapView/> */}
    </ResponsiveCard>
  );
};

export default MapCard;