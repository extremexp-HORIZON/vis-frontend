import type { IPredictionResult } from '../models/exploring/prediction-result.model';
import type { IZone } from '../models/exploring/zone.model';

/**
 * Downloads a JSON file with the given data and filename
 */
const downloadJSONFile = (data: unknown, filename: string): void => {
  // Convert to JSON string with pretty formatting
  const jsonString = JSON.stringify(data, null, 2);

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface IExportData {
  zoneId: string;
  geohashesCount: number;
  intervalsAmount: number;
  exportTimestamp: string;
  results: IPredictionResult[];
}

export interface IExportAllData {
  exportTimestamp: string;
  totalZones: number;
  totalResults: number;
  zones: Array<{
    zoneId: string;
    geohashesCount: number;
    intervalsAmount: number;
    results: IPredictionResult[];
  }>;
}

/**
 * Downloads a single zone's prediction results as JSON
 */
export const exportZoneToJSON = (
  zone: IZone,
  results: IPredictionResult[],
  intervalsAmount: number,
): void => {
  if (results.length === 0) {
    return;
  }

  // Create the export data with metadata
  const exportData: IExportData = {
    zoneId: zone.id!,
    geohashesCount: zone.geohashes?.length || 0,
    intervalsAmount,
    exportTimestamp: new Date().toISOString(),
    results,
  };

  const filename = `prediction-results-${zone.id}-${
    new Date().toISOString()
      .split('T')[0]
  }.json`;

  downloadJSONFile(exportData, filename);
};

/**
 * Downloads all zones' prediction results as a single JSON file
 */
export const exportAllZonesToJSON = (
  zones: IZone[],
  allResults: Record<string, IPredictionResult[]>,
  intervalsAmount: Record<string, number>,
): void => {
  const zonesWithResults = zones.filter(
    zone => zone.id && allResults[zone.id] && allResults[zone.id].length > 0,
  );

  if (zonesWithResults.length === 0) {
    return;
  }

  const totalResults = zonesWithResults.reduce(
    (sum, zone) => sum + (allResults[zone.id!]?.length || 0),
    0,
  );

  // Create the export data with metadata
  const exportData: IExportAllData = {
    exportTimestamp: new Date().toISOString(),
    totalZones: zonesWithResults.length,
    totalResults,
    zones: zonesWithResults.map(zone => ({
      zoneId: zone.id!,
      geohashesCount: zone.geohashes?.length || 0,
      intervalsAmount: intervalsAmount[zone.id!],
      results: allResults[zone.id!],
    })),
  };

  const filename = `all-prediction-results-${
    new Date().toISOString()
      .split('T')[0]
  }.json`;

  downloadJSONFile(exportData, filename);
};
