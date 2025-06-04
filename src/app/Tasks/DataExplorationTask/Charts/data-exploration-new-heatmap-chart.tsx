import { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';
import * as L from 'leaflet';
import 'leaflet.heat';

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
  const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];

  // Fetch data
  useEffect(() => {
    const datasetId =
      tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

    if (!datasetId || !lat || !lon) return;

    const columns = [lat, lon];

    if (weightBy && weightBy !== 'None') columns.push(weightBy); // ✅ only if valid

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
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
    if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

    leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      leafletMapRef.current,
    );
  }, [lat, lon]);

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
  }, [data, lat, lon, filters, radius, weightBy]);

  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);
  }, [lat, lon]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default HeatMapChart;
