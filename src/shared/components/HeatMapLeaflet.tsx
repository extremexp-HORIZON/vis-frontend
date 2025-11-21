// HeatMapLeaflet.tsx
import { useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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
    div.style.minWidth = '150px'
    div.innerHTML = `
      <div class="legend-title" style="font-weight:600"></div>
      <div class="legend-range"></div>
    `;

    return div;
  };

  (legend as any).update = (label: string, min: number, max: number, cssGradient: string, decimals = 5) => {
    const container = (legend as any)._container as HTMLElement | undefined;

    if (!container) return;
    const title = container.querySelector('.legend-title') as HTMLElement | null;
    const range = container.querySelector('.legend-range') as HTMLElement | null;

    if (title) title.textContent = label;
    if (range && min === max)
      range.innerHTML = `
              <div style="color: gray;">Unique value</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                <div style="width:24px;height:12px;background:${cssGradient};border-radius:2px;"></div>
                <span>${min?.toFixed(decimals)}</span>
              </div>
            `;
    else if (range)
      range.innerHTML = `
        <div style="width: 100%; height: 12px; background: ${cssGradient}; border-radius: 3px; margin: 4px 0 6px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>${min?.toFixed(decimals)}</span>
          <span>${max?.toFixed(decimals)}</span>
        </div>
      `;
  };

  return legend as L.Control & { update: (label: string, min: number, max: number, cssGradient: string, decimals?: number) => void };
};

// ----- helpers: intensity scaling to make near-zero visible -----
const EPS = 1e-9;

/**
 * Normalize values to [0..1], boost lows with gamma (<1), and clamp with floor
 * so that very small values remain visible in the heat layer.
 */
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

const HeatMapLeaflet: React.FC<HeatMapLeafletProps> = ({
  points,
  attributionPoints = [],
  title,
  legendLabel = 'Value',
  height = 420,
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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<L.Layer | null>(null);
  const legendRef = useRef<(L.Control & { update: (s: string, a: number, b: number, cssGradient: string, d?: number) => void }) | null>(null);

  const attributionLayerRef = useRef<L.LayerGroup | null>(null);

  // Precompute heat data + bounds
  const { heatData, vMin, vMax, bounds } = useMemo(() => {
    const vals = points.map(p => p.value);
    const { scaled, min, max } = scaleValuesTo01(vals, minIntensity, gamma);
    const heat: [number, number, number][] = points.map((p, i) => [p.lat, p.lon, scaled[i]]);
    const b = points.length ? L.latLngBounds(points.map(p => [p.lat, p.lon] as [number, number])) : null;

    return { heatData: heat, vMin: min, vMax: max, bounds: b };
  }, [points, minIntensity, gamma]);

  const legendGradientRef = useRef<Record<number, string> | null>(null);

  const DEFAULT_HEAT_GRADIENT: Record<number, string> = useMemo(() => ({
    0.0: '#0000ff',
    0.25: '#00ffff',
    0.5: '#00ff00',
    0.75: '#ffff00',
    1.0: '#ff0000',
  }), []);

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

    mapRef.current = L.map(containerRef.current, { 
      zoomControl: true,
      attributionControl: false,
    });

    // base tiles
    L.tileLayer(tilesUrl, {
      attribution: '',
    }).addTo(mapRef.current);

    // title badge (use class-style control to satisfy TS)
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
      badge.addTo(mapRef.current);
    }

    // ensure layout
    setTimeout(() => mapRef.current?.invalidateSize(), 120);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [tilesUrl, title]);

  // update heat layer + legend + fit bounds when inputs change
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
      gradient: gradientUsed
    });
    legendGradientRef.current = gradientUsed;
    heatRef.current?.addTo(m);

    if (attributionLayerRef.current) {
      attributionLayerRef.current.remove();
      attributionLayerRef.current = null;
    }
    if (attributionPoints && attributionPoints.length > 0) {
      const lg = L.layerGroup();
      attributionPoints.forEach(p => {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 4,
          color: '#000000',
          weight: 1,
          fillColor: '#ff0000',
          fillOpacity: 0.9,
        });

        marker.bindTooltip(p.value.toFixed(decimals));
        lg.addLayer(marker);
      });
      lg.addTo(m);
      attributionLayerRef.current = lg;
    }

    // legend
    if (legendRef.current) {
      legendRef.current.remove();
      legendRef.current = null;
    }
    const cssGradient = gradientToCss(legendGradientRef.current || DEFAULT_HEAT_GRADIENT);
    const lgLegend = createLegendControl('topright', cssGradient);

    lgLegend.addTo(m);
    lgLegend.update(legendLabel, vMin, vMax, cssGradient, decimals);
    legendRef.current = lgLegend;

    // fit bounds to data
    if (bounds && bounds.isValid()) m.fitBounds(bounds.pad(padding));

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
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height }}
    />
  );
};

export default HeatMapLeaflet;
