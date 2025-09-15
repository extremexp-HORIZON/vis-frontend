import { useState, useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import * as L from 'leaflet';
import Loader from '../../../../shared/components/loader';
const COLOR_PALETTE = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
];

const MapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const rendererRef = useRef<L.Renderer | null>(null);

  const isNumericField = (values: string[]): boolean => {
    return values.every(v => !isNaN(parseFloat(v)));
  };

  const getColorForValue = (
    value: number,
    min: number,
    max: number,
  ): string => {
    const percent = (value - min) / (max - min);
    const hue = (1 - percent) * 72; // 240 = blue, 0 = red

    return `hsl(${hue}, 100%, 50%)`;
  };

  const { tab } = useAppSelector(state => state.workflowPage);
  const meta = tab?.workflowTasks.dataExploration?.metaData;
  const dispatch = useAppDispatch();

  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
  const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
  const data: Record<string, string | number>[] = Array.isArray(rawData)
    ? rawData
    : [];
  const colorByMap = tab?.workflowTasks.dataExploration?.controlPanel.colorByMap;
  const loading = tab?.workflowTasks.dataExploration?.mapChart.loading;
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());

  // Fetch data
  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
    const datasetId =
      tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';
    const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;

    if (!datasetId || !lat || !lon || meta?.source !== tab?.dataTaskTable.selectedItem?.data?.dataset?.source) return;

    const columns = [lat, lon];

    if (colorByMap && colorByMap !== 'None') {
      columns.push(colorByMap);
    }

    dispatch(
      fetchDataExplorationData({
        query: {
          dataSource: {
            source: datasetId,
            format: dataset?.format || '',
            sourceType: dataset?.sourceType || '',
            fileName: dataset?.name || '',
            runId: tab?.workflowId || ''
          },
          columns,
          filters,
          // limit: 0,
        },
        metadata: {
          workflowId: tab?.workflowId || '',
          queryCase: 'mapChart',
        },
      }),
    );
  }, [
    lat,
    lon,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    colorByMap,
    filters,
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

    leafletMapRef.current = L.map(mapRef.current, {
      preferCanvas: true,
    }).setView([38.015, 23.834], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      leafletMapRef.current,
    );

    markerLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
    rendererRef.current = L.canvas({ padding: 0.5 }); // shared canvas renderer
  }, [lat, lon]);

  useEffect(() => {
    if (!Array.isArray(data) || !data.length || !colorByMap) return;

    const categories = Array.from(
      new Set(
        data.map((row: Record<string, string | number>) => row[colorByMap]),
      ),
    );
    const newColorMap = new Map<string, string>();

    categories.forEach((category, index) => {
      // Get a color from the COLOR_PALETTE or generate your own strategy here
      newColorMap.set(
        String(category),
        COLOR_PALETTE[index % COLOR_PALETTE.length],
      );
    });

    setColorMap(newColorMap);
  }, [colorByMap, data, filters]);

  // Update markers
  useEffect(() => {
    if (
      loading ||
      !leafletMapRef.current ||
      !lat ||
      !lon ||
      !markerLayerRef.current ||
      !colorMap ||
      !rendererRef.current
    )
      return;

    if (markerLayerRef.current) markerLayerRef.current.clearLayers();

    let min: number | undefined, max: number | undefined;
    let numericMode = false;

    if (colorByMap && isNumericField(data.map(r => String(r[colorByMap])))) {
      const values = data.map(r => parseFloat(String(r[colorByMap])));

      min = Math.min(...values);
      max = Math.max(...values);
      numericMode = true;
    }
    data.forEach(row => {
      const latVal = parseFloat(String(row[lat]));
      const lonVal = parseFloat(String(row[lon]));

      if (isNaN(latVal) || isNaN(lonVal)) return;

      let color = '#000';

      if (colorByMap && colorByMap !== 'None') {
        const value = row[colorByMap];

        if (numericMode && min !== undefined && max !== undefined) {
          color = getColorForValue(parseFloat(String(value)), min, max);
        } else {
          color = colorMap.get(String(value)) || '#000';
        }
      }

      L.circleMarker([latVal, lonVal], {
        renderer: rendererRef.current, // ✅ use shared renderer
        radius: 3,
        fillColor: color,
        fillOpacity: 0.8,
        stroke: false, // ✅ no border for speed
      }).addTo(markerLayerRef.current!);
    });

    if (data.length) {
      const avgLat =
        data.reduce((sum, r) => sum + parseFloat(String(r[lat])), 0) /
        data.length;
      const avgLon =
        data.reduce((sum, r) => sum + parseFloat(String(r[lon])), 0) /
        data.length;

      leafletMapRef.current.setView([avgLat, avgLon], 16);
    }

    // Remove existing legend if it exists
    const existingLegend = document.querySelector('.leaflet-legend');

    if (existingLegend) existingLegend.remove();
    if (colorByMap && colorByMap !== 'None') {
      if (Array.isArray(data) && data.length > 0) {
        const LegendControl = L.Control.extend({
          onAdd: function () {
            const div = L.DomUtil.create('div', 'leaflet-legend');

            div.style.background = 'white';
            div.style.padding = '8px';
            div.style.borderRadius = '4px';
            div.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
            div.innerHTML = `<div style="text-align: center;"><strong>${colorByMap}</strong></div><br/>`;

            const isNumeric = isNumericField(
              data.map(r => String(r[colorByMap || ''])),
            );

            if (isNumeric) {
              const values = data.map(r =>
                parseFloat(String(r[colorByMap || ''])),
              );
              const min = Math.min(...values);
              const max = Math.max(...values);

              if (min === max) {
                div.innerHTML += `
      <div style="color: gray; font-size: 12px;">Unique value: ${min.toFixed(2)}</div>
    `;
              } else {
                div.innerHTML += `
            <div style="width: 200px;">
              <div style="background: linear-gradient(to right, hsl(72, 100%, 50%), hsl(0, 100%, 50%)); height: 12px; margin-bottom: 4px;"></div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>${min.toFixed(2)}</span>
                <span>${max.toFixed(2)}</span>
              </div>
            </div>
          `;
              }
            } else {
              Array.from(colorMap.entries())
                .slice(0, 10)
                .forEach(([category, color]) => {
                  div.innerHTML += `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background:${color}; border-radius: 50%; margin-right: 6px;"></div>
                ${category}
              </div>
            `;
                });
            }

            return div;
          },
        });

        const legend = new LegendControl({ position: 'topright' });

        legend.addTo(leafletMapRef.current!);
      }
    }
    // Optionally pan to average center
    if (Array.isArray(data) && data.length) {
      const avgLat =
        data.reduce(
          (sum: number, r: { [x: string]: string | number }) =>
            sum + parseFloat(String(r[lat])),
          0,
        ) / data.length;

      const avgLon =
        data.reduce(
          (sum: number, r: { [x: string]: string | number }) =>
            sum + parseFloat(String(r[lon])),
          0,
        ) / data.length;

      leafletMapRef.current.setView([avgLat, avgLon], 16);
    }
  }, [data, lat, lon, colorMap, filters]);
  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100); // give the layout a moment to settle
  }, [lat, lon]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Loader />
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapChart;
