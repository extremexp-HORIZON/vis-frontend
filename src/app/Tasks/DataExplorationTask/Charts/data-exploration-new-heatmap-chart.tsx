import { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import * as L from 'leaflet';
import 'leaflet.heat';
import Loader from '../../../../shared/components/loader';

const HeatMapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);

  const { tab } = useAppSelector(state => state.workflowPage);
  const dispatch = useAppDispatch();

  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const radius = tab?.workflowTasks.dataExploration?.controlPanel.radius;
  const weightBy = tab?.workflowTasks.dataExploration?.controlPanel.weightBy;
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
  const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
  const loading = tab?.workflowTasks.dataExploration?.mapChart.loading;
  const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];

  // Fetch data
  useEffect(() => {
    const datasetId =
      tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';
    const dataset = tab?.dataTaskTable.selectedItem?.data?.dataset;

    if (!datasetId || !lat || !lon) return;

    const columns = [lat, lon];

    if (weightBy && weightBy !== 'None') columns.push(weightBy); // ✅ only if valid

    dispatch(
      fetchDataExplorationData({
        query: {
          dataSource: {
            source: datasetId,
            format: dataset?.format || '',
            sourceType: dataset?.sourceType || '',
            fileName: dataset?.name || ''
          },
          columns,
          filters,
          limit: 0,
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
    weightBy,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    filters,
  ]);

  // Initialize map
  useEffect(() => {
    if (loading || !mapRef.current || leafletMapRef.current || !lat || !lon || data.length === 0) return;

    const coords = data
      .map((row) => {
        const latVal = parseFloat(String(row[lat]));
        const lonVal = parseFloat(String(row[lon]));

        return !isNaN(latVal) && !isNaN(lonVal) ? [latVal, lonVal] : null;
      })
      .filter((entry): entry is [number, number] => entry !== null);

    if (coords.length === 0) return;

    const avgLat = coords.reduce((sum, [lat]) => sum + lat, 0) / coords.length;
    const avgLon = coords.reduce((sum, [, lon]) => sum + lon, 0) / coords.length;

    leafletMapRef.current = L.map(mapRef.current).setView([avgLat, avgLon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      leafletMapRef.current,
    );
  }, [lat, lon, data]);

  // Update heatmap layer
  useEffect(() => {
    if (!leafletMapRef.current || !lat || !lon) return;

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (Array.isArray(data)) {
      const heatData: [number, number, number][] = data
        .map((row) => {
          const latVal = parseFloat(String(row[lat]));
          const lonVal = parseFloat(String(row[lon]));
          const weightVal =
          weightBy && weightBy !== 'None'
            ? parseFloat(String(row[weightBy]))
            : 0.5;

          const isValid =
          !isNaN(latVal) &&
          !isNaN(lonVal) &&
          (!weightBy || weightBy === 'None' || !isNaN(weightVal));

          return isValid ? [latVal, lonVal, weightVal] : null;
        })
        .filter((entry): entry is [number, number, number] => entry !== null);

      heatLayerRef.current = L.heatLayer(heatData, {
        radius: radius,
        blur: 15,
        maxZoom: 17,
      });

      heatLayerRef.current.addTo(leafletMapRef.current);
    }

    // Clean up any existing legends
    const existingLegend = document.querySelector('.leaflet-legend');

    if (existingLegend) existingLegend.remove();
    const LegendControl = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create('div', 'leaflet-legend');

        div.style.background = 'white';
        div.style.padding = '8px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
        div.style.fontSize = '12px';
        div.innerHTML = `
      <div><b>Weight by:</b> ${weightBy || 'None'}</div>
      <div><b>Radius:</b> ${radius || 'Default'}</div>
    `;

        return div;
      },
      onRemove: function () {
        // Optional cleanup if needed
      },
    });

    const legendControl = new LegendControl({ position: 'topright' });

    legendControl.addTo(leafletMapRef.current!);
  }, [data, lat, lon, filters, radius, weightBy]);

  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);
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

export default HeatMapChart;
