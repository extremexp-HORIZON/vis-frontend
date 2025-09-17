// components/HeatmapLayer.tsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';
import { MAX_ZOOM } from '../../../../shared/utils/clusterUtils';

interface HeatmapLayerProps<T> {
  points: T[];
  latitudeExtractor: (point: T | null) => number;
  longitudeExtractor: (point: T | null) => number;
  intensityExtractor?: (point: T | null) => number;
  radius?: number;
  blur?: number;
  gradient?: Record<number, string>;
  useLocalExtrema?: boolean; // Not directly supported by leaflet.heat
  fitBoundsOnLoad?: boolean;
}

export const HeatmapLayer = <T, >({
  points,
  latitudeExtractor,
  longitudeExtractor,
  intensityExtractor,
  radius = 25,
  blur = 15,
  gradient,
  fitBoundsOnLoad = false,
}: HeatmapLayerProps<T>) => {
  const map = useMap();
  const hasFitBounds = useRef(false);

  useEffect(() => {
    if (!map || !points.length) return;

    const heatData: [number, number, number?][] = points.map(p => [
      latitudeExtractor(p),
      longitudeExtractor(p),
      intensityExtractor?.(p),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any)
      .heatLayer(heatData, {
        radius,
        blur,
        gradient,
        maxZoom: MAX_ZOOM,
      })
      .addTo(map);

    if (fitBoundsOnLoad && !hasFitBounds.current) {
      const latlngs = heatData.map(([lat, lng]) => L.latLng(lat, lng));
      const bounds = L.latLngBounds(latlngs);

      map.fitBounds(bounds, { padding: [20, 20] });
      hasFitBounds.current = true;
    }

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [
    map,
    points,
    radius,
    blur,
    gradient,
    fitBoundsOnLoad,
    latitudeExtractor,
    longitudeExtractor,
    intensityExtractor,
  ]);

  return null;
};
