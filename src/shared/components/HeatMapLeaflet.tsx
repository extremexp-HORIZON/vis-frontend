// HeatMapLeaflet.tsx
import { useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { createTheme, useMediaQuery } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Arial',
    h6: { fontWeight: 600 },
  },
});


export type HeatPointLL = { lat: number; lon: number; value: number };

export interface HeatMapLeafletProps {
  /** Array of {lat, lon, value} points */
  points: HeatPointLL[];

  attributionPoints?: HeatPointLL[];

  /** Title badge shown on map (top-left) */
  title?: string;

  /** Legend label (e.g., "Feature", "Attribution") */
  legendLabel?: string;

  /** Container height in px */
  height?: number;

  /** Leaflet.heat options */
  radius?: number;
  blur?: number;
  maxZoom?: number;
  gradient?: Record<number, string>; // optional custom ramp

  /** Fit bounds padding (0..1) */
  padding?: number;

  /** Decimals for legend min/max */
  decimals?: number;

  /** Intensity shaping (visibility of near-zero values) */
  minIntensity?: number; // 0..1 floor
  gamma?: number;        // <1 boosts lows

  /** Tile URL */
  tilesUrl?: string;

  /** Optional className for container */
  className?: string;

  /** Optional external view state to sync multiple maps */
  syncedView?: { center: [number, number]; zoom: number };

  /** Callback when this map's view changes (pan/zoom) */
  onViewChange?: (view: { center: [number, number]; zoom: number }) => void;
}

const DEFAULT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// ----- helpers: legend control (class-style, TS-safe) -----
const createLegendControl = (position: L.ControlPosition = 'topright', cssGradient: string) => {
  const legend = new L.Control({ position });

  (legend as any).onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-legend');

    div.style.background = 'white';
    div.style.padding = '8px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 6px rgba(0,0,0,0.25)';
    div.style.fontSize = '12px';
    div.style.minWidth = '150px';
    div.innerHTML = `
      <div class="legend-title" style="font-weight:600"></div>
      <div class="legend-range"></div>
    `;

    return div;
  };

  return legend as L.Control;
};

// ----- helpers: intensity scaling to make near-zero visible -----
const EPS = 1e-9;

const scaleValuesTo01 = (vals: number[], minI = 0.35, gamma = 0.5) => {
  if (!vals.length) return { scaled: vals, min: 0, max: 1 };
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min;

  if (span < EPS) {
    // All values ~equal → show a visible blob
    return { scaled: vals.map(() => 1), min, max };
  }

  const scaled = vals.map(v => {
    const t = (v - min) / span;         // 0..1
    const boosted = Math.pow(t, gamma); // gamma < 1 boosts lows

    return Math.max(minI, boosted);     // floor for visibility
  });

  return { scaled, min, max };
};

const getColorFromGradient = (stops: Record<number, string>, t: number) => {
  const entries = Object.entries(stops)
    .map(([k, v]) => [parseFloat(k), v] as [number, string])
    .sort((a, b) => a[0] - b[0]);

  if (!entries.length) return '#ff0000';

  if (t <= entries[0][0]) return entries[0][1];
  if (t >= entries[entries.length - 1][0]) return entries[entries.length - 1][1];

  let i = 1;
  while (i < entries.length && t > entries[i][0]) i++;
  const [p0, c0] = entries[i - 1];
  const [p1, c1] = entries[i];

  const f = (t - p0) / (p1 - p0);

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  const { r: r0, g: g0, b: b0 } = hexToRgb(c0);
  const { r: r1, g: g1, b: b1 } = hexToRgb(c1);

  const r = Math.round(r0 + (r1 - r0) * f);
  const g = Math.round(g0 + (g1 - g0) * f);
  const b = Math.round(b0 + (b1 - b0) * f);

  return rgbToHex(r, g, b);
};

const HeatMapLeaflet: React.FC<HeatMapLeafletProps> = ({
  points,
  attributionPoints = [],
  title,
  legendLabel = 'Value',
  height = useMediaQuery(theme.breakpoints.down('xl')) ? 400 : 650,
  radius = 18,
  blur = 15,
  maxZoom = 18,
  gradient,
  padding = 0.05,
  decimals = 5,
  minIntensity = 0.35,
  gamma = 0.5,
  tilesUrl = DEFAULT_TILES,
  className,
  syncedView,
  onViewChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<L.Layer | null>(null);
  const legendRef = useRef<L.Control | null>(null);

  const attributionLayerRef = useRef<L.LayerGroup | null>(null);
  const programmaticMoveRef = useRef(false);

  // Precompute heat data + bounds
  const { heatData, vMin, vMax, bounds } = useMemo(() => {
    const vals = points.map(p => p.value);
    const { scaled, min, max } = scaleValuesTo01(vals, minIntensity, gamma);
    const heat: [number, number, number][] = points.map((p, i) => [p.lat, p.lon, scaled[i]]);
    const b = points.length ? L.latLngBounds(points.map(p => [p.lat, p.lon] as [number, number])) : null;

    return { heatData: heat, vMin: min, vMax: max, bounds: b };
  }, [points, minIntensity, gamma]);

  const legendGradientRef = useRef<Record<number, string> | null>(null);

  const DEFAULT_HEAT_GRADIENT: Record<number, string> = useMemo(
    () => ({
      0.0: '#0000ff',
      0.25: '#00ffff',
      0.5: '#00ff00',
      0.75: '#ffff00',
      1.0: '#ff0000',
    }),
    []
  );

  const gradientToCss = (stops: Record<number, string>) => {
    const entries = Object.entries(stops)
      .map(([k, v]) => [parseFloat(k), v] as [number, string])
      .sort((a, b) => a[0] - b[0]);
    const cssStops = entries.map(([p, c]) => `${c} ${Math.round(p * 100)}%`);

    return `linear-gradient(to right, ${cssStops.join(', ')})`;
  };

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const m = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = m;

    m.setView([0, 0], 1);

    // base tiles
    L.tileLayer(tilesUrl, {
      attribution: '',
    }).addTo(m);

    if (title) {
      const badge = new L.Control({ position: 'topleft' });
      (badge as any).onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-badge');
        div.style.background = 'rgba(255,255,255,0.9)';
        div.style.padding = '4px 8px';
        div.style.borderRadius = '6px';
        div.style.fontSize = '12px';
        div.style.fontWeight = '600';
        div.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)';
        div.textContent = title!;
        return div;
      };
      badge.addTo(m);
    }

    setTimeout(() => m.invalidateSize(), 120);

    return () => {
      m.remove();
      mapRef.current = null;
    };
  }, [tilesUrl, title]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    const gradientUsed = DEFAULT_HEAT_GRADIENT;

    // heat
    if (heatRef.current) {
      heatRef.current.remove();
      heatRef.current = null;
    }
    heatRef.current = (L as any).heatLayer(heatData, {
      radius,
      blur,
      maxZoom,
      gradient: gradientUsed,
    });
    legendGradientRef.current = gradientUsed;
    heatRef.current?.addTo(m);

    // clear old attribution layer
    if (attributionLayerRef.current) {
      attributionLayerRef.current.remove();
      attributionLayerRef.current = null;
    }

    if (attributionPoints && attributionPoints.length > 0) {
      const lgAttr = L.layerGroup();
    
      const size = 0.00001;
    
      attributionPoints.forEach(p => {
        const { lat, lon, value } = p;
      
        const h = L.polyline(
          [
            [lat, lon - size],
            [lat, lon + size],
          ],
          {
            color: '#000000',
            weight: 2,
          }
        );
      
        const v = L.polyline(
          [
            [lat - size, lon],
            [lat + size, lon],
          ],
          {
            color: '#000000',
            weight: 2,
          }
        );
      
        const tooltipText = `Attribution: ${value.toFixed(decimals)}`;
      
        h.bindTooltip(tooltipText, { sticky: true });
        v.bindTooltip(tooltipText, { sticky: true });
      
        lgAttr.addLayer(h);
        lgAttr.addLayer(v);
      });
    
      lgAttr.addTo(m);
      attributionLayerRef.current = lgAttr;
    }

    // combined legend (Feature + Attribution in the same box)
    if (legendRef.current) {
      legendRef.current.remove();
      legendRef.current = null;
    }
    const cssGradient = gradientToCss(gradientUsed);
    const lg = createLegendControl('topright', cssGradient);
    lg.addTo(m);
    legendRef.current = lg;

    const container = (lg as any)._container as HTMLElement | undefined;
    if (container) {
      const titleEl = container.querySelector('.legend-title') as HTMLElement | null;
      const rangeEl = container.querySelector('.legend-range') as HTMLElement | null;
    
      const hasOverlay = !!(attributionPoints && attributionPoints.length > 0);
    
      if (titleEl) {
        // If we have overlay, show generic combined title, otherwise just use legendLabel
        titleEl.textContent = hasOverlay
          ? legendLabel || 'Feature / Attribution'
          : legendLabel || 'Value';
      }
    
      if (rangeEl) {
        let html = `
          <div style="width: 100%; height: 12px; background: ${cssGradient}; border-radius: 3px; margin: 4px 0 6px 0;"></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>${vMin.toFixed(decimals)}</span>
            <span>${vMax.toFixed(decimals)}</span>
          </div>
        `;
      
      if (attributionPoints && attributionPoints.length > 0) {
        html += `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            <div style="position:relative;width:10px;height:10px;">
              <div style="position:absolute;left:0;top:50%;width:100%;height:1px;background:#000;transform:translateY(-50%);"></div>
              <div style="position:absolute;top:0;left:50%;height:100%;width:1px;background:#000;transform:translateX(-50%);"></div>
            </div>
            <span>Attribution</span>
          </div>
        `;
      }

        rangeEl.innerHTML = html;
      }
    }

    if (!syncedView && bounds && bounds.isValid()) {
      m.fitBounds(bounds.pad(padding));
    }

    // keep size fresh
    setTimeout(() => m.invalidateSize(), 60);
  }, [
    heatData,
    vMin,
    vMax,
    legendLabel,
    decimals,
    radius,
    blur,
    maxZoom,
    padding,
    gradient,
    bounds,
    attributionPoints,
    DEFAULT_HEAT_GRADIENT,
    syncedView,
  ]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !onViewChange) return;

    const handleViewChange = () => {
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        return;
      }

      const center = m.getCenter();
      const zoom = m.getZoom();
      onViewChange({
        center: [center.lat, center.lng],
        zoom,
      });
    };

    m.on('moveend', handleViewChange);
    m.on('zoomend', handleViewChange);

    return () => {
      m.off('moveend', handleViewChange);
      m.off('zoomend', handleViewChange);
    };
  }, [onViewChange]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !syncedView) return;

    const currentCenter = m.getCenter();
    const currentZoom = m.getZoom();
    const [lat, lng] = syncedView.center;

    if (
      Math.abs(currentCenter.lat - lat) < 1e-9 &&
      Math.abs(currentCenter.lng - lng) < 1e-9 &&
      currentZoom === syncedView.zoom
    ) {
      return;
    }

    programmaticMoveRef.current = true;
    m.setView([lat, lng], syncedView.zoom, { animate: false });
  }, [syncedView?.center[0], syncedView?.center[1], syncedView?.zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height }}
    />
  );
};

export default HeatMapLeaflet;
