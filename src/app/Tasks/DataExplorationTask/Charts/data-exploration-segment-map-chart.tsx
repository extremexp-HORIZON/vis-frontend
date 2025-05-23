import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';

const COLOR_PALETTE = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // olive
  '#17becf', // cyan
];

const SegmentMapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { tab } = useAppSelector(state => state.workflowPage);
  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];
  const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
  const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];
  const timestampField = 'timestamp';
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const dispatch = useAppDispatch();

  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

    if (!datasetId || !lat || !lon || segmentBy?.length === 0)
      return;

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
          columns: [lat, lon, ...segmentBy, timestampField],
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
    filters,
    segmentBy,
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

    leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      leafletMapRef.current,
    );
    layerGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
  }, []);

  // Set color map
  useEffect(() => {
    if (!segmentBy || !data.length) return;
    const categories = Array.from(
      new Set(data.map(row => segmentBy.map(field => row[field]).join('|')))
    );
    const newMap = new Map<string, string>();

    categories.forEach((cat, i) =>
      newMap.set(cat, COLOR_PALETTE[i % COLOR_PALETTE.length]),
    );
    setColorMap(newMap);
  }, [segmentBy, data]);

  // Draw polylines
  useEffect(() => {
    if (
      !leafletMapRef.current ||
      !layerGroupRef.current ||
      !lat ||
      !lon ||
      !segmentBy
    )
      return;

    layerGroupRef.current.clearLayers();

    // Group and sort data
    const groups: Record<string, { lat: number; lon: number; timestamp?: number }[]> = {};

    for (const row of data) {
      const groupKey = segmentBy.map(field => row[field]).join('|');
      const latVal = parseFloat(String(row[lat]));
      const lonVal = parseFloat(String(row[lon]));

      if (!isNaN(latVal) && !isNaN(lonVal)) {
        const point = {
          lat: latVal,
          lon: lonVal,
          timestamp: row[timestampField]
            ? new Date(row[timestampField]).getTime()
            : undefined,
        };

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(point);
      }
    }

    // Create and add polylines
    const allPoints: L.LatLngExpression[] = [];

    Object.entries(groups).forEach(([key, points]) => {
      const color = colorMap.get(key) || '#000000';
      const sorted = points.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      const path = sorted.map(p => {
        const coord: L.LatLngExpression = [p.lat, p.lon];

        allPoints.push(coord);

        return coord;
      });
      const polyline = L.polyline(path, { color, weight: 3 }).addTo(layerGroupRef.current!);

      polyline.bindTooltip(`${segmentBy.join(', ')}: ${key}`, {
        permanent: false,
        direction: 'top',
      });
    });

    // Auto center
    if (allPoints.length) {
      const bounds = L.latLngBounds(allPoints);

      leafletMapRef.current.fitBounds(bounds, { padding: [30, 30] });
    }

  }, [data, lat, lon, segmentBy, timestampField, colorMap]);

  // Fix map resizing
  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);
  }, [lat, lon]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default SegmentMapChart;
