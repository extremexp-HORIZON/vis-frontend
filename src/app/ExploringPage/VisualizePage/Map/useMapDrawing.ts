import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../../store/store';
import L from 'leaflet';

export const useMapDrawing = (map: L.Map | null, id: string) => {
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawnRect = useAppSelector(state => state.map.drawnRect);
  const lastDrawnBounds = useRef<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);
  const onVisibilityChangeRef = useRef<(() => void) | null>(null);

  const drawRectangleFromBounds = (
    bounds: {
      south: number;
      west: number;
      north: number;
      east: number;
    } | null,
  ) => {
    if (!bounds || !map) return;

    // Check if bounds are the same as last drawn
    if (
      lastDrawnBounds.current &&
      lastDrawnBounds.current.south === bounds.south &&
      lastDrawnBounds.current.west === bounds.west &&
      lastDrawnBounds.current.north === bounds.north &&
      lastDrawnBounds.current.east === bounds.east
    ) {
      return; // Already drawn, skip
    }

    const leafletBounds = L.latLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    );

    const rectangle = L.rectangle(leafletBounds, {
      color: '#ff7800',
      weight: 2,
      fillOpacity: 0.1,
    });

    // Clear existing drawn items
    drawnItemsRef.current.clearLayers();

    // Add the new rectangle
    drawnItemsRef.current.addLayer(rectangle);

    // Update last drawn bounds
    lastDrawnBounds.current = bounds;

    // Fit map to the rectangle bounds but with a buffer of 250px
    map.fitBounds(leafletBounds, { padding: [250, 250] });

    // Notify parent component to update visibility
    if (onVisibilityChangeRef.current) {
      onVisibilityChangeRef.current();
    }
  };

  const clearDrawnItems = () => {
    drawnItemsRef.current.clearLayers();
    lastDrawnBounds.current = null;

    // Notify parent component to update visibility
    if (onVisibilityChangeRef.current) {
      onVisibilityChangeRef.current();
    }
  };

  const addDrawnLayer = (layer: L.Layer) => {
    drawnItemsRef.current.clearLayers();
    drawnItemsRef.current.addLayer(layer);

    // Update last drawn bounds if it's a rectangle
    if ('getBounds' in layer && typeof layer.getBounds === 'function') {
      const bounds = layer.getBounds();

      lastDrawnBounds.current = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      };
    }

    // Notify parent component to update visibility
    if (onVisibilityChangeRef.current) {
      onVisibilityChangeRef.current();
    }
  };

  const setVisibilityChangeCallback = (callback: () => void) => {
    onVisibilityChangeRef.current = callback;
  };

  useEffect(() => {
    if (drawnRect && map) {
      drawRectangleFromBounds({
        south: drawnRect.lat[0],
        west: drawnRect.lon[0],
        north: drawnRect.lat[1],
        east: drawnRect.lon[1],
      });
    }
  }, [drawnRect, map]);

  return {
    drawnItemsRef,
    drawRectangleFromBounds,
    clearDrawnItems,
    addDrawnLayer,
    setVisibilityChangeCallback,
    isDrawingFromState: !!drawnRect,
  };
};
