import { useState, useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';
import { logger } from '../../../../shared/utils/logger';
import * as L from 'leaflet';
import 'leaflet.heat';
const COLOR_PALETTE = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
];

const HeatMapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
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
  const dispatch = useAppDispatch();

  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const useHeatmap = true;
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
  const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
  const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];
  // const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy;
  // const timestampField = 'timestamp';

  // Fetch data
  useEffect(() => {
    const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
    const datasetId =
      tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

    if (!datasetId || !lat || !lon )
      return;

    dispatch(
      fetchDataExplorationData({
        query: {
          ...defaultDataExplorationQuery,
          datasetId,
          columns: [lat, lon],
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
    tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
    filters,
  ]);

  // Initialize map
  useEffect(() => {
    if (
      !mapRef.current ||
      leafletMapRef.current ||
      !lat ||
      !lon 
    )
      return;

    leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      leafletMapRef.current,
    );

    markerLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
  }, [lat, lon, data, filters]);


  // Update markers
  useEffect(() => {
    if (
      !leafletMapRef.current ||
      !lat ||
      !lon ||
      !markerLayerRef.current 
     
    )
      return;

    if (markerLayerRef.current) markerLayerRef.current.clearLayers();
    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (useHeatmap && Array.isArray(data)) {
      const heatData: [number, number, number][] = data
        .map((row) => {
          const latVal = parseFloat(String(row[lat]));
          const lonVal = parseFloat(String(row[lon]));

          return !isNaN(latVal) && !isNaN(lonVal) ? [latVal, lonVal, 0.5] : null;
        })
        .filter((entry): entry is [number, number, number] => entry !== null);

      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      });
      if (heatLayerRef.current) heatLayerRef.current.addTo(leafletMapRef.current!);
    }
    // Remove existing legend if it exists
    const existingLegend = document.querySelector('.leaflet-legend');

    if (existingLegend) existingLegend.remove();
    
    // Optionally pan to average center
    if (Array.isArray(data) && data.length) {
      const avgLat =
        data.reduce(
          (sum: number, r: { [x: string]: string | number }) => sum + parseFloat(String(r[lat])),
          0
        ) / data.length;

      const avgLon =
        data.reduce(
          (sum: number, r: { [x: string]: string | number }) => sum + parseFloat(String(r[lon])),
          0
        ) / data.length;

      leafletMapRef.current.setView([avgLat, avgLon], 16);
    }
  }, [data, lat, lon, useHeatmap, filters]);
  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100); // give the layout a moment to settle
  }, [lat, lon]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default HeatMapChart;
