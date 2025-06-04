// // import { useEffect, useRef, useState } from 'react';
// // import L from 'leaflet';
// // import 'leaflet/dist/leaflet.css';
// // import { useAppDispatch, useAppSelector } from '../../../../store/store';
// // import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
// // import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';

// // const COLOR_PALETTE = [
// //   '#1f77b4', // blue
// //   '#ff7f0e', // orange
// //   '#2ca02c', // green
// //   '#d62728', // red
// //   '#9467bd', // purple
// //   '#8c564b', // brown
// //   '#e377c2', // pink
// //   '#7f7f7f', // gray
// //   '#bcbd22', // olive
// //   '#17becf', // cyan
// // ];

// // const SegmentMapChart = () => {
// //   const mapRef = useRef<HTMLDivElement | null>(null);
// //   const leafletMapRef = useRef<L.Map | null>(null);
// //   const layerGroupRef = useRef<L.LayerGroup | null>(null);

// //   const { tab } = useAppSelector(state => state.workflowPage);
// //   const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
// //   const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
// //   const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];
// //   const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
// //   const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];
// //   const timestampField = 'timestamp';
// //   const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
// //   const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
// //   const dispatch = useAppDispatch();

// //   useEffect(() => {
// //     const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
// //     const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

// //     if (!datasetId || !lat || !lon || segmentBy?.length === 0)
// //       return;

// //     dispatch(
// //       fetchDataExplorationData({
// //         query: {
// //           ...defaultDataExplorationQuery,
// //           datasetId,
// //           columns: [lat, lon, ...segmentBy, timestampField],
// //           filters,
// //           limit: 0,
// //         },
// //         metadata: {
// //           workflowId: tab?.workflowId || '',
// //           queryCase: 'mapChart',
// //         },
// //       }),
// //     );
// //   }, [
// //     lat,
// //     lon,
// //     filters,
// //     segmentBy,
// //     tab?.dataTaskTable.selectedItem?.data?.dataset?.source
// //   ]);

// //   // Initialize map
// //   useEffect(() => {
// //     if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

// //     leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
// //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
// //       leafletMapRef.current,
// //     );
// //     layerGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
// //   }, []);

// //   // Set color map
// //   useEffect(() => {
// //     if (!segmentBy || !data.length) return;
// //     const categories = Array.from(
// //       new Set(data.map(row => segmentBy.map(field => row[field]).join('|')))
// //     );
// //     const newMap = new Map<string, string>();

// //     categories.forEach((cat, i) =>
// //       newMap.set(cat, COLOR_PALETTE[i % COLOR_PALETTE.length]),
// //     );
// //     setColorMap(newMap);
// //   }, [segmentBy, data]);

// //   // Draw polylines
// //   useEffect(() => {
// //     if (
// //       !leafletMapRef.current ||
// //       !layerGroupRef.current ||
// //       !lat ||
// //       !lon ||
// //       !segmentBy
// //     )
// //       return;

// //     layerGroupRef.current.clearLayers();

// //     // Group and sort data
// //     const groups: Record<string, { lat: number; lon: number; timestamp?: number }[]> = {};

// //     for (const row of data) {
// //       const groupKey = segmentBy.map(field => row[field]).join('|');
// //       const latVal = parseFloat(String(row[lat]));
// //       const lonVal = parseFloat(String(row[lon]));

// //       if (!isNaN(latVal) && !isNaN(lonVal)) {
// //         const point = {
// //           lat: latVal,
// //           lon: lonVal,
// //           timestamp: row[timestampField]
// //             ? new Date(row[timestampField]).getTime()
// //             : undefined,
// //         };

// //         if (!groups[groupKey]) groups[groupKey] = [];
// //         groups[groupKey].push(point);
// //       }
// //     }

// //     // Create and add polylines
// //     const allPoints: L.LatLngExpression[] = [];

// //     Object.entries(groups).forEach(([key, points]) => {
// //       const color = colorMap.get(key) || '#000000';
// //       const sorted = points.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
// //       const path = sorted.map(p => {
// //         const coord: L.LatLngExpression = [p.lat, p.lon];

// //         allPoints.push(coord);

// //         return coord;
// //       });
// //       const polyline = L.polyline(path, { color, weight: 3 }).addTo(layerGroupRef.current!);

// //       polyline.bindTooltip(`${segmentBy.join(', ')}: ${key}`, {
// //         permanent: false,
// //         direction: 'top',
// //       });
// //     });

// //     // Auto center
// //     if (allPoints.length) {
// //       const bounds = L.latLngBounds(allPoints);

// //       leafletMapRef.current.fitBounds(bounds, { padding: [30, 30] });
// //     }

// //   }, [data, lat, lon, segmentBy, timestampField, colorMap]);

// //   // Fix map resizing
// //   useEffect(() => {
// //     setTimeout(() => {
// //       leafletMapRef.current?.invalidateSize();
// //     }, 100);
// //   }, [lat, lon]);

// //   return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
// // };

// // export default SegmentMapChart;

// import { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { useAppDispatch, useAppSelector } from '../../../../store/store';
// import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
// import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';

// const COLOR_PALETTE = [
//   '#1f77b4', // blue
//   '#ff7f0e', // orange
//   '#2ca02c', // green
//   '#d62728', // red
//   '#9467bd', // purple
//   '#8c564b', // brown
//   '#e377c2', // pink
//   '#7f7f7f', // gray
//   '#bcbd22', // olive
//   '#17becf', // cyan
// ];

// const SegmentMapChart = () => {
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const leafletMapRef = useRef<L.Map | null>(null);
//   const layerGroupRef = useRef<L.LayerGroup | null>(null);

//   const { tab } = useAppSelector(state => state.workflowPage);
//   const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
//   const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
//   const segmentBy =
//     tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];
//   const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
//   const data: Record<string, string | number>[] = Array.isArray(rawData)
//     ? rawData
//     : [];
//   const timestampField = 'timestamp';
//   const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
//   const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
//     const datasetId =
//       tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

//     if (!datasetId || !lat || !lon || segmentBy?.length === 0) return;

//     dispatch(
//       fetchDataExplorationData({
//         query: {
//           ...defaultDataExplorationQuery,
//           datasetId,
//           columns: [lat, lon, ...segmentBy, timestampField],
//           filters,
//           limit: 0,
//         },
//         metadata: {
//           workflowId: tab?.workflowId || '',
//           queryCase: 'mapChart',
//         },
//       }),
//     );
//   }, [
//     lat,
//     lon,
//     filters,
//     segmentBy,
//     tab?.dataTaskTable.selectedItem?.data?.dataset?.source,
//   ]);

//   // Initialize map
//   useEffect(() => {
//     if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

//     leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
//       leafletMapRef.current,
//     );
//     layerGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
//   }, []);

//   // Set color map
//   useEffect(() => {
//     if (!segmentBy || !data.length) return;
//     const categories = Array.from(
//       new Set(data.map(row => segmentBy.map(field => row[field]).join('|'))),
//     );
//     const newMap = new Map<string, string>();

//     categories.forEach((cat, i) =>
//       newMap.set(cat, COLOR_PALETTE[i % COLOR_PALETTE.length]),
//     );
//     setColorMap(newMap);
//   }, [segmentBy, data]);

//   // Draw polylines
//   useEffect(() => {
//     if (
//       !leafletMapRef.current ||
//       !layerGroupRef.current ||
//       !lat ||
//       !lon ||
//       !segmentBy
//     )
//       return;

//     layerGroupRef.current.clearLayers();

//     // Group and sort data
//     const groups: Record<
//       string,
//       { lat: number; lon: number; timestamp?: number }[]
//     > = {};

//     for (const row of data) {
//       const groupKey = segmentBy.map(field => row[field]).join('|');
//       const latVal = parseFloat(String(row[lat]));
//       const lonVal = parseFloat(String(row[lon]));

//       if (!isNaN(latVal) && !isNaN(lonVal)) {
//         const point = {
//           lat: latVal,
//           lon: lonVal,
//           timestamp: row[timestampField]
//             ? new Date(row[timestampField]).getTime()
//             : undefined,
//         };

//         if (!groups[groupKey]) groups[groupKey] = [];
//         groups[groupKey].push(point);
//       }
//     }

//     // Create and add polylines
//     const allPoints: L.LatLngExpression[] = [];

//     Object.entries(groups).forEach(([key, points]) => {
//       const color = colorMap.get(key) || '#000000';
//       const sorted = points.sort(
//         (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
//       );
//       const path = sorted.map(p => {
//         const coord: L.LatLngExpression = [p.lat, p.lon];

//         allPoints.push(coord);

//         return coord;
//       });
//       const polyline = L.polyline(path, { color, weight: 3 }).addTo(
//         layerGroupRef.current!,
//       );

//       polyline.bindTooltip(`${segmentBy.join(', ')}: ${key}`, {
//         permanent: false,
//         direction: 'top',
//       });
//     });

//     // Auto center
//     if (allPoints.length) {
//       const bounds = L.latLngBounds(allPoints);

//       leafletMapRef.current.fitBounds(bounds, { padding: [30, 30] });
//     }
//   }, [data, lat, lon, segmentBy, timestampField, colorMap]);

//   // Fix map resizing
//   useEffect(() => {
//     setTimeout(() => {
//       leafletMapRef.current?.invalidateSize();
//     }, 100);
//   }, [lat, lon]);

//   return (
//     <div style={{ width: '100%', height: '100%', position: 'relative' }}>
//       <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
//       {/* Legend */}
//       {colorMap.size > 0 && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 10,
//             right: 10,
//             background: 'rgba(255, 255, 255, 0.8)',
//             padding: '8px',
//             borderRadius: '4px',
//             boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
//             maxHeight: '50%',
//             overflowY: 'auto',
//             zIndex: 1000,
//           }}
//         >
//           <h4 style={{ margin: '0 0 6px' }}>{segmentBy.join(', ')}</h4>
//           {Array.from(colorMap.entries()).map(([key, color]) => (
//             <div
//               key={key}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 marginBottom: '4px',
//               }}
//             >
//               <span
//                 style={{
//                   display: 'inline-block',
//                   width: '14px',
//                   height: '14px',
//                   backgroundColor: color,
//                   marginRight: '6px',
//                 }}
//               />
//               <span style={{ fontSize: '12px' }}>{key}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SegmentMapChart;

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { fetchDataExplorationData } from '../../../../store/slices/dataExplorationSlice';
import { defaultDataExplorationQuery } from '../../../../shared/models/dataexploration.model';

const COLOR_PALETTE = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
];

const SegmentMapChart = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [highlightedPolyline, setHighlightedPolyline] = useState<L.Polyline | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [markerMap, setMarkerMap] = useState<Map<string, { start: L.CircleMarker, end: L.CircleMarker }>>(new Map());

  const { tab } = useAppSelector(state => state.workflowPage);
  const lat = tab?.workflowTasks.dataExploration?.controlPanel.lat;
  const lon = tab?.workflowTasks.dataExploration?.controlPanel.lon;
  const segmentBy = tab?.workflowTasks.dataExploration?.controlPanel.segmentBy || [];
  const filters = tab?.workflowTasks.dataExploration?.controlPanel.filters;
  const rawData = tab?.workflowTasks.dataExploration?.mapChart.data?.data;
  const data: Record<string, string | number>[] = Array.isArray(rawData) ? rawData : [];
  const timestampField = 'timestamp';
  const dispatch = useAppDispatch();

  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [pathMap, setPathMap] = useState<Map<string, L.Polyline>>(new Map());

  // Fetch data
  useEffect(() => {
    const datasetId = tab?.dataTaskTable.selectedItem?.data?.dataset?.source || '';

    if (!datasetId || !lat || !lon || segmentBy.length === 0) return;

    dispatch(fetchDataExplorationData({
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
    }));
  }, [lat, lon, filters, segmentBy, tab?.dataTaskTable.selectedItem?.data?.dataset?.source]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || !lat || !lon) return;

    leafletMapRef.current = L.map(mapRef.current).setView([38.015, 23.834], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMapRef.current);
    layerGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
  }, []);

  // Color mapping
  useEffect(() => {
    if (!segmentBy || !data.length) return;

    const categories = Array.from(new Set(data.map(row => segmentBy.map(field => row[field]).join('|'))));
    const newMap = new Map<string, string>();

    categories.forEach((cat, i) =>
      newMap.set(cat, COLOR_PALETTE[i % COLOR_PALETTE.length])
    );
    setColorMap(newMap);
  }, [segmentBy, data]);

  // Draw polylines with enhancements
  useEffect(() => {
    if (!leafletMapRef.current || !layerGroupRef.current || !lat || !lon || !segmentBy) return;

    layerGroupRef.current.clearLayers();
    const newPathMap = new Map<string, L.Polyline>();
    const allPoints: L.LatLngExpression[] = [];

    const groups: Record<string, { lat: number; lon: number; timestamp?: number }[]> = {};

    for (const row of data) {
      const groupKey = segmentBy.map(field => row[field]).join('|');
      const latVal = parseFloat(String(row[lat]));
      const lonVal = parseFloat(String(row[lon]));

      if (!isNaN(latVal) && !isNaN(lonVal)) {
        const point = {
          lat: latVal,
          lon: lonVal,
          timestamp: row[timestampField] ? new Date(row[timestampField]).getTime() : undefined,
        };

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(point);
      }
    }

    const markerMapTemp = new Map<string, { start: L.CircleMarker, end: L.CircleMarker }>();

    Object.entries(groups).forEach(([key, points]) => {
      const color = colorMap.get(key) || '#000000';
      const sorted = points.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
      const path = sorted.map(p => [p.lat, p.lon] as L.LatLngExpression);

      if (!path.length) return;

      const polyline = L.polyline(path, { color, weight: 3 }).addTo(layerGroupRef.current!);

      polyline.bindTooltip(`
        <div>
          <strong>${segmentBy.join(', ')}: ${key}</strong><br/>
          Start: ${new Date(sorted[0].timestamp ?? 0).toLocaleString()}<br/>
          End: ${new Date(sorted[sorted.length - 1].timestamp ?? 0).toLocaleString()}
        </div>
      `);

      // Start/End markers
      const startMarker = L.circleMarker(path[0], { radius: 5, color: 'green' }).addTo(layerGroupRef.current!);
      const endMarker = L.circleMarker(path[path.length - 1], { radius: 5, color: 'red' }).addTo(layerGroupRef.current!);

      markerMapTemp.set(key, { start: startMarker, end: endMarker });
      newPathMap.set(key, polyline);
      allPoints.push(...path);
    });

    setPathMap(newPathMap);
    setMarkerMap(markerMapTemp);

    if (allPoints.length) {
      leafletMapRef.current.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
    }
  }, [data, lat, lon, segmentBy, colorMap]);

  useEffect(() => {
    markerMap.forEach((markers, key) => {
      const visible = !selectedKey || key === selectedKey;

      markers.start.setStyle({ opacity: visible ? 1 : 0 });
      markers.end.setStyle({ opacity: visible ? 1 : 0 });
    });
  }, [selectedKey, markerMap]);
  // Fix map resizing
  useEffect(() => {
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 100);
  }, [lat, lon]);

  const handleLegendHover = (key: string) => {
    const polyline = pathMap.get(key);

    if (!polyline) return;

    polyline.setStyle({ weight: 6 });
    setHighlightedPolyline(polyline);
  };

  const handleLegendLeave = () => {
    highlightedPolyline?.setStyle({ weight: 3 });
    setHighlightedPolyline(null);
  };

  const handleLegendClick = (key: string) => {
    setSelectedKey(prev => (prev === key ? null : key)); // toggle selection

    const polyline = pathMap.get(key);

    if (polyline) {
      leafletMapRef.current?.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    }
  };

  console.log('selectedKey', selectedKey);

  useEffect(() => {
    pathMap.forEach((polyline, key) => {
      polyline.setStyle({
        opacity: selectedKey ? (key === selectedKey ? 1 : 0.1) : 1,
      });
    });
  }, [selectedKey, pathMap]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {colorMap.size > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            maxHeight: '50%',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          <h4 style={{ margin: '0 0 6px' }}>{segmentBy.join(', ')}</h4>
          {Array.from(colorMap.entries()).map(([key, color]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px',
                cursor: 'pointer',
              }}
              onMouseEnter={() => handleLegendHover(key)}
              onMouseLeave={handleLegendLeave}
              onClick={() => handleLegendClick(key)}
              title="Click to zoom to path"
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  backgroundColor: color,
                  marginRight: '6px',
                }}
              />
              <span style={{ fontSize: '12px' }}>{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentMapChart;
