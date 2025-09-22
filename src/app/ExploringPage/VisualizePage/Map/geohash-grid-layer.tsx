import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import ngeohash from 'ngeohash';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import {
  generateRsrpColor,
  MAX_ZOOM,
} from '../../../../shared/utils/clusterUtils';
import { useNavigate } from 'react-router-dom';

// Map zoom level to geohash precision
// This function maps zoom levels to geohash precision levels, respecting MAX_ZOOM
function getGeohashPrecision(zoom: number): number {
  // Clamp zoom to MAX_ZOOM to prevent issues with very high zoom levels
  const clampedZoom = Math.min(zoom, MAX_ZOOM);

  // Geohash precision mapping based on zoom levels
  // Higher precision (more characters) for higher zoom levels
  if (clampedZoom >= 20) return 9;
  if (clampedZoom >= 19) return 8;
  if (clampedZoom >= 18) return 7;
  if (clampedZoom >= 17) return 6;
  if (clampedZoom >= 14) return 5;
  if (clampedZoom >= 12) return 4;
  if (clampedZoom >= 6) return 3;

  return 2;
}

// Map geohash precision back to zoom level, respecting MAX_ZOOM
function getZoomFromPrecision(precision: number): number {
  if (precision >= 9) return Math.min(20, MAX_ZOOM);
  if (precision === 8) return Math.min(19, MAX_ZOOM);
  if (precision === 7) return Math.min(18, MAX_ZOOM);
  if (precision === 6) return Math.min(17, MAX_ZOOM);
  if (precision === 5) return Math.min(14, MAX_ZOOM);
  if (precision === 4) return Math.min(12, MAX_ZOOM);
  if (precision === 3) return Math.min(9, MAX_ZOOM);
  if (precision === 2) return Math.min(7, MAX_ZOOM);

  return 5;
}

// Get all child geohashes of a parent geohash
function getChildGeohashes(parentGeohash: string): string[] {
  const children: string[] = [];
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';

  for (const char of chars) {
    children.push(parentGeohash + char);
  }

  return children;
}

// Get parent geohash (one precision level lower)
function getParentGeohash(geohash: string): string {
  return geohash.slice(0, -1);
}

// Get siblings of a geohash (same parent, different last character)
function getSiblingGeohashes(geohash: string): string[] {
  const siblings: string[] = [];
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
  const parent = getParentGeohash(geohash);

  for (const char of chars) {
    const sibling = parent + char;

    if (sibling !== geohash) {
      siblings.push(sibling);
    }
  }

  return siblings;
}

// Get hierarchical grid - bottom-up approach
function getHierarchicalGrid(
  selectedGeohash: string,
): { geohash: string; level: 'context' | 'siblings' | 'children' }[] {
  const grid: {
    geohash: string;
    level: 'context' | 'siblings' | 'children';
  }[] = [];

  if (!selectedGeohash) return grid;

  // 1. Add children of selected geohash (highest precision - focus area)
  const children = getChildGeohashes(selectedGeohash);

  children.forEach(child => {
    grid.push({ geohash: child, level: 'children' });
  });

  // 2. Add siblings of selected geohash (same precision - immediate context)
  const siblings = getSiblingGeohashes(selectedGeohash);

  siblings.forEach(sibling => {
    grid.push({ geohash: sibling, level: 'siblings' });
  });

  // 3. Add broader context (lower precision levels)
  let currentParent = getParentGeohash(selectedGeohash);

  while (currentParent.length >= 1) {
    const parentSiblings = getSiblingGeohashes(currentParent);

    parentSiblings.forEach(sibling => {
      grid.push({ geohash: sibling, level: 'context' });
    });

    currentParent = getParentGeohash(currentParent);
  }

  return grid;
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
  selectedGeohash: string | null;
  setSelectedGeohash: (geohash: string | null) => void;
  predictionData: Record<
    string,
    {
      geohash: string;
      rsrpSum: number;
      rsrpCount: number;
      heights: number[];
      timestamp: string | null;
    }
  >;
}

export const GeohashGridLayer = ({
  points,
  dataset,
  selectedGeohash,
  setSelectedGeohash,
  predictionData,
}: GeohashGridLayerProps) => {
  const map = useMap();
  const navigate = useNavigate();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Zoom to selected geohash when it changes
  useEffect(() => {
    if (selectedGeohash) {
      const center = ngeohash.decode(selectedGeohash);
      const targetZoom = getZoomFromPrecision(selectedGeohash.length);
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      // Only setView if the position or zoom has actually changed
      const centerChanged =
        Math.abs(center.latitude - currentCenter.lat) > 0.001 ||
        Math.abs(center.longitude - currentCenter.lng) > 0.001;
      const zoomChanged = Math.abs(targetZoom - currentZoom) > 0.1;

      if (centerChanged || zoomChanged) {
        map.setView([center.latitude, center.longitude], targetZoom);
      }
    }
  }, [selectedGeohash, map]);

  // Handle rectangle click - navigate to child geohash
  function handleRectClick(geohash: string): void {
    setSelectedGeohash(geohash);
    navigate(`?geohash=${geohash}`);
  }

  // Draw the grid based on selected geohash or default view
  useEffect(() => {
    if (!map) return;

    function drawGrid() {
      // Remove previous layer
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
      }

      const group = L.layerGroup();

      layerGroupRef.current = group;

      let gridItems: {
        geohash: string;
        level: 'context' | 'siblings' | 'children';
      }[] = [];

      if (selectedGeohash) {
        // Use hierarchical grid approach
        gridItems = getHierarchicalGrid(selectedGeohash);
      } else {
        // Initialize with a default geohash based on map center
        const center = map.getCenter();
        const zoom = map.getZoom();
        const precision = getGeohashPrecision(zoom);
        const defaultGeohash = ngeohash.encode(
          center.lat,
          center.lng,
          precision,
        );

        setSelectedGeohash(defaultGeohash);
        navigate(`?geohash=${defaultGeohash}`);

        // Use hierarchical grid with the default geohash
        gridItems = getHierarchicalGrid(defaultGeohash);
      }

      gridItems.forEach(item => {
        const { geohash: hash, level } = item;
        const bbox = ngeohash.decode_bbox(hash);
        const predData =
          hash.length >= 8 ? predictionData[hash.substring(0, 8)] : null;

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

        // Determine styling based on hierarchical level
        let borderColor = '#3388ff';
        let borderWeight = 1;
        let opacity = 0.5;

        if (level === 'children') {
          // Children: blue, normal weight, normal opacity (focus area)
          borderColor = '#3388ff';
          borderWeight = 3;
          opacity = 0.5;
        } else if (level === 'siblings') {
          // Siblings: orange, thicker border, lower opacity (immediate context)
          // borderColor = '#ff6b35';
          borderWeight = 1;
          // opacity = 0.3;
        } else if (level === 'context') {
          // Context: light gray, thin border, very low opacity (broader context)
          // borderColor = '#cccccc';
          borderWeight = 1;
          // opacity = 0.1;
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
          color: borderColor,
          weight: borderWeight,
          className: 'geohash-rectangle',
          fill: true,
          fillColor: predData
            ? generateRsrpColor(
              dataset,
              predData.rsrpSum / predData.rsrpCount,
            )
            : fillColor,
          fillOpacity: opacity,
        });

        // Add tooltip
        if (predData) {
          const timeToNext =
            predData.rsrpCount < 6
              ? `${predData.rsrpCount * 10} mins`
              : `${Math.floor(predData.rsrpCount / 6)}h${predData.rsrpCount % 6 > 0 ? ` ${predData.rsrpCount % 6 * 10}m` : ''}`;

          rect.bindTooltip(
            `
              <div>
                <div style="font-weight: bold; text-align: center;">Prediction Data</div>
                <strong>Geohash:</strong> ${hash}<br/>
                <strong>RSRP:</strong> ${(predData.rsrpSum / predData.rsrpCount)?.toFixed(2) || 'N/A'}<br/>
                <strong>Heights:</strong> ${predData.heights.join(', ')}<br/>
                <strong>Timestamp:</strong> ${new Date(predData.timestamp!).toLocaleTimeString()}<br/>
                For the next ${timeToNext}
              </div>
            `,
            {
              permanent: false,
              direction: 'top',
            },
          );
        }
        // TODO: Consider adding tooltip for non-prediction data

        rect.on('click', () => handleRectClick(hash));

        rect.addTo(group);

        // Add label (center of cell) - show only last character
        // Calculate the actual center of the geohash cell bounds
        const centerLat = (bbox[0] + bbox[2]) / 2;
        const centerLon = (bbox[1] + bbox[3]) / 2;

        // Get the actual pixel coordinates of cell corners
        const topLeft = map.latLngToContainerPoint([bbox[2], bbox[1]]);
        const bottomRight = map.latLngToContainerPoint([bbox[0], bbox[3]]);

        // Calculate actual visual size in pixels
        const cellWidthPx = Math.abs(bottomRight.x - topLeft.x);
        const cellHeightPx = Math.abs(bottomRight.y - topLeft.y);

        // Calculate dynamic font size based on cell size and zoom level
        const zoom = Math.min(map.getZoom(), MAX_ZOOM);
        const zoomFactor = Math.pow(1.2, zoom - 10); // Exponential growth with zoom
        const cellSize = Math.min(cellWidthPx, cellHeightPx);
        const fontSize = Math.max(6, Math.min(36, cellSize * 0.3 * zoomFactor));

        // Calculate dynamic icon size based on cell size
        const iconWidth = Math.max(20, Math.min(80, cellWidthPx * 0.8));
        const iconHeight = Math.max(15, Math.min(40, cellHeightPx * 0.6));

        const label = L.marker([centerLat, centerLon], {
          icon: L.divIcon({
            className: 'geohash-label',
            html: `<div style="font-size:${fontSize}px;color:#333;text-shadow:0 1px 2px #fff;text-align:center;line-height:${iconHeight}px;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${hash.slice(-1)}</div>`,
            iconSize: [iconWidth, iconHeight],
            iconAnchor: [iconWidth / 2, iconHeight / 2],
          }),
          interactive: false,
        });

        label.addTo(group);
      });

      group.addTo(map);
    }

    drawGrid();

    return () => {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [map, points, dataset, selectedGeohash, predictionData]); // Only redraw when selectedGeohash changes

  return null;
};
