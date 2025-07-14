import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import ngeohash from 'ngeohash';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';

// Map zoom level to geohash precision
function getGeohashPrecision(zoom: number): number {
  if (zoom >= 16) return 7;
  if (zoom >= 14) return 6;
  if (zoom >= 11) return 5;
  if (zoom >= 8) return 4;
  if (zoom >= 6) return 3;

  return 2;
}

// Get all geohashes covering the bounding box at a given precision
function getGeohashesInBbox(
  south: number,
  west: number,
  north: number,
  east: number,
  precision: number,
): string[] {
  // Clamp to valid lat/lon
  south = Math.max(-90, Math.min(90, south));
  north = Math.max(-90, Math.min(90, north));
  west = Math.max(-180, Math.min(180, west));
  east = Math.max(-180, Math.min(180, east));

  // Step size: get the size of a geohash cell at this precision
  const center = [(south + north) / 2, (west + east) / 2];
  const cell = ngeohash.decode_bbox(
    ngeohash.encode(center[0], center[1], precision),
  );
  const latStep = Math.abs(cell[2] - cell[0]);
  const lonStep = Math.abs(cell[3] - cell[1]);

  const hashes = new Set<string>();

  for (let lat = south; lat < north + latStep; lat += latStep) {
    for (let lon = west; lon < east + lonStep; lon += lonStep) {
      const hash = ngeohash.encode(lat, lon, precision);

      hashes.add(hash);
    }
  }

  return Array.from(hashes);
}

// Helper: check if a point is inside a bbox
function pointInBbox(
  lat: number,
  lon: number,
  bbox: [number, number, number, number],
) {
  return lat >= bbox[0] && lat <= bbox[2] && lon >= bbox[1] && lon <= bbox[3];
}

export interface GeohashGridLayerProps {
  points: [number, number, (number | undefined)?][];
  dataset: IDataset;
}

export const GeohashGridLayer = ({
  points,
  dataset,
}: GeohashGridLayerProps) => {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Use the same color function as the map
  const generateRsrpColor = (dataset: IDataset, rsrp_rscp_rssi: number) => {
    if (
      (dataset.measure0 === 'rsrp_rscp_rssi' ||
        dataset.measure1 === 'rsrp_rscp_rssi') &&
      rsrp_rscp_rssi != null
    ) {
      let val = rsrp_rscp_rssi;

      if (val < 0) val = -val;
      const min = 70;
      const max = 100;

      if (val < min) val = min;
      if (val > max) val = max;
      let percentage = ((val - min) * 100) / (max - min);

      percentage = percentage / 100;
      const hue0 = 120;
      const hue1 = 0;
      const hue = percentage * (hue1 - hue0) + hue0;

      return 'hsl(' + hue + ', 100%, 70%)';
    } else {
      return 'rgba(212,62,42)';
    }
  };

  useEffect(() => {
    if (!map) return;

    function drawGrid() {
      // Remove previous layer
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
      }
      const group = L.layerGroup();

      layerGroupRef.current = group;

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const precision = getGeohashPrecision(zoom);
      const hashes = getGeohashesInBbox(
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast(),
        precision,
      );

      hashes.forEach(hash => {
        const bbox = ngeohash.decode_bbox(hash); // [minLat, minLon, maxLat, maxLon]
        // Find points in this bbox
        const cellPoints = points.filter(
          p =>
            typeof p[0] === 'number' &&
            typeof p[1] === 'number' &&
            pointInBbox(p[0], p[1], bbox),
        );
        let avgRsrp: number | null = null;

        if (cellPoints.length > 0) {
          const validVals = cellPoints
            .map(p => p[2])
            .filter(v => v !== null) as number[];

          if (validVals.length > 0) {
            avgRsrp =
              validVals.reduce((a, b) => a + (b as number), 0) /
              validVals.length;
          }
        }
        const fillColor =
          avgRsrp != null
            ? generateRsrpColor(dataset, avgRsrp)
            : 'rgba(200,200,200,0.2)';
        const rectBounds: [[number, number], [number, number]] = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ];
        const rect = L.rectangle(rectBounds, {
          color: '#3388ff',
          weight: 1,
          fill: true,
          fillColor,
          fillOpacity: 0.5,
        });

        rect.addTo(group);

        // Add label (center of cell)
        const center = ngeohash.decode(hash);
        const label = L.marker([center.latitude, center.longitude], {
          icon: L.divIcon({
            className: 'geohash-label',
            html: `<div style="font-size:16px;color:#333;text-shadow:0 1px 2px #fff;">${hash}</div>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10],
          }),
          interactive: false,
        });

        label.addTo(group);
      });

      group.addTo(map);
    }

    drawGrid();
    map.on('moveend zoomend', drawGrid);

    return () => {
      map.off('moveend zoomend', drawGrid);
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [map, points, dataset]);

  return null;
};
