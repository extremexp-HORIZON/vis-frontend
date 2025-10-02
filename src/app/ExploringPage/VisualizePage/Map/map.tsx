import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  generateRsrpColor,
  MAX_ZOOM,
  rsrpIntensityExtractor,
  type IPointType,
} from '../../../../shared/utils/clusterUtils';
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet';
import {
  defaultValue,
  type MapLayer,
  type IDataset,
} from '../../../../shared/models/exploring/dataset.model';
import type { ICluster } from '../../../../shared/models/exploring/cluster.model';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import MapSearch from './map-search';
import { MapControl } from './map-control';
import { BeautifyIcon } from '../../../../shared/utils/beautify-marker/leaflet-beautify-marker-icon';
import CustomPopup from './CustomPopup/custom-popup';
import { HeatmapLayer } from './heatmap-layer';
import { getRow } from '../../../../store/slices/exploring/datasetSlice';
import { GeohashGridLayer } from './geohash-grid-layer';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  setMapLayer,
  setSelectedGeohash,
} from '../../../../store/slices/exploring/mapSlice';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  Album as HeatmapIcon,
  GridView as GeohashIcon,
  Spoke as ClusterIcon,
} from '@mui/icons-material';
import { LatLngBounds, type LatLngBoundsExpression } from 'leaflet';

export interface IMapProps {
  id: string;
  dataset: IDataset;
}

const fetchIcon = (
  count: number,
  clickable: number | boolean,
  backgroundColor: string | null,
) => {
  if (count === 1)
    return BeautifyIcon.icon({
      iconShape: 'doughnut',
      isAlphaNumericIcon: false,
      backgroundColor: 'rgba(212,62,42)',
      borderColor: '#ffffff',
      borderWidth: 2,
      iconSize: [18, 18],
      hasBadge: false,
      iconStyle: clickable && 'cursor: pointer',
    });

  const borderColor =
    count < 100
      ? 'rgba(102, 194, 164, 0.5)'
      : count < 1000
        ? 'rgba(44, 162, 95, 0.5)'
        : 'rgba(0, 109, 44, 0.5)';

  return BeautifyIcon.icon({
    customClasses: 'cluster',
    isAlphaNumericIcon: true,
    textColor: 'black',
    text: count,
    hasBadge: false,
    badgeText: '',
    backgroundColor,
    borderColor,
    borderWidth: 5,
    iconSize: [40, 40],
    iconStyle: clickable && 'cursor: pointer',
  });
};

const SinglePoint = (props: {
  dataset: IDataset;
  point: IPointType;
  coordinates: number[];
  selectedMarker: { lat: number; lng: number } | null;
  setSelectedMarker: (marker: { lat: number; lng: number } | null) => void;
}) => {
  const { dataset, point, coordinates, selectedMarker, setSelectedMarker } =
    props;

  const dispatch = useAppDispatch();
  const { row } = useAppSelector((state: RootState) => state.dataset);

  return (
    <Marker
      key={point[2]}
      icon={fetchIcon(1, 1, null)}
      position={[coordinates[1], coordinates[0]]}
      eventHandlers={{
        click: () => {
          if (dataset.id && point[3]) {
            dispatch(getRow({ datasetId: dataset.id, rowId: point[3] }));
            setSelectedMarker({ lat: coordinates[1], lng: coordinates[0] });
          }
        },
      }}
    >
      {selectedMarker !== null &&
        row &&
        row.length > 0 &&
        dataset.originalColumns && (
        <CustomPopup
          latlng={[selectedMarker.lat, selectedMarker.lng]}
          onClose={() => {
            setSelectedMarker(null);
            // reset();
          }}
        >
          <div>
            {dataset.originalColumns.map((col, colIndex) => {
              if (col.name === 'id') return null;

              let val = row[colIndex];

              if (val == null) val = '';

              return (
                <div key={colIndex}>
                  <span>
                    <b>{col.name}: </b>
                    {val.startsWith('http') ? <a href={val}>{val}</a> : val}
                  </span>
                  <br></br>
                </div>
              );
            })}
          </div>
        </CustomPopup>
      )}
    </Marker>
  );
};

export const Map = (props: IMapProps) => {
  const { id, dataset } = props;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const geohash = searchParams.get('geohash');
  const dispatch = useAppDispatch();
  const mapLayer = useAppSelector((state: RootState) => state.map.mapLayer);
  const { clusters, viewRect, zoom, selectedGeohash, drawnRect } =
    useAppSelector((state: RootState) => state.map);
  const {
    results,
    predictionDisplay,
    selectedTimeIndex,
    selectedHeight,
  } = useAppSelector((state: RootState) => state.prediction);

  const [selectedClusterMarker, setSelectedClusterMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSinglePointMarker, setSelectedSinglePointMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Initialize selectedGeohash from URL params
  useEffect(() => {
    if (
      dataset !== defaultValue &&
      geohash &&
      geohash !== selectedGeohash.string
    ) {
      dispatch(setMapLayer('geohash'));
      dispatch(setSelectedGeohash(geohash));
    }
  }, [geohash, selectedGeohash, dispatch]);

  const latitudeExtractor = useCallback(
    (r: [number, number, number?] | null) => (r && r[0] != null ? r[0] : 0),
    [],
  );
  const longitudeExtractor = useCallback(
    (r: [number, number, number?] | null) => (r && r[1] != null ? r[1] : 0),
    [],
  );
  const intensityExtractor = useCallback(
    (r: [number, number, number?] | null) =>
      r ? rsrpIntensityExtractor(dataset, r[2]!) : 1,
    [dataset],
  );

  const getPoints = (clusters: ICluster[]): [number, number, number?][] => {
    return clusters.flatMap(cluster =>
      cluster.properties.points.map(
        point =>
          [point[0], point[1], point[4] ?? undefined] as [
            number,
            number,
            number?,
          ],
      ),
    );
  };

  // Filter prediction data based on timeline selection
  const filteredPredictionData = useMemo(() => {
    if (!predictionDisplay || selectedHeight === null) {
      return [];
    }

    const allResults = Object.values(results).flat();

    if (allResults.length === 0) return [];

    // Get all unique timestamps from prediction data and sort them
    const uniqueTimestamps = [
      ...new Set(allResults.map(result => result.timestamp)),
    ];
    const sortedTimestamps = uniqueTimestamps.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    // Get the target timestamp based on selectedTimeIndex
    const targetTimestamp = sortedTimestamps[selectedTimeIndex];

    if (!targetTimestamp) return [];

    // Filter results by the selected timestamp and height
    const filtered = allResults.filter(
      result =>
        result.timestamp === targetTimestamp &&
        result.height === selectedHeight,
    );

    return filtered;
  }, [results, selectedTimeIndex, selectedHeight, predictionDisplay]);

  const points = useMemo(() => {
    if (!clusters) return [];

    // return clusters.flatMap((cluster) =>
    //   cluster.properties.points
    //     .filter((point) => typeof point[0] === 'number' && typeof point[1] === 'number')
    //     .map((point) => [point[0] as number, point[1] as number, point[4] as number | undefined]),
    // );
    return getPoints(clusters);
  }, [clusters]);

  const resetGeohashSelection = useCallback(() => {
    dispatch(setSelectedGeohash(null));
    navigate('?');
  }, [dispatch, navigate]);

  const toggleMapLayer = useCallback(
    (layer: MapLayer) => {
      if (layer !== 'geohash' && selectedGeohash != null) {
        resetGeohashSelection();
      }
      dispatch(setMapLayer(layer));
    },
    [dispatch, resetGeohashSelection, selectedGeohash],
  );

  let content: React.ReactNode;

  const bounds = viewRect
    ? new LatLngBounds(
      [viewRect.lat[0], viewRect.lon[0]],
      [viewRect.lat[1], viewRect.lon[1]],
    )
    : null;

  if (clusters) {
    content = (
      <MapContainer
        bounds={bounds as LatLngBoundsExpression}
        boundsOptions={{ padding: [200, 200] }}
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        maxZoom={MAX_ZOOM}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxNativeZoom={18} // This will allow zooming beyond level 18 by scaling the available tiles, though with some quality degradation.
          maxZoom={MAX_ZOOM}
        />
        <ZoomControl position="topright" />
        <MapControl id={id} />
        {!predictionDisplay && <ToggleButtonGroup
          exclusive
          value={mapLayer}
          orientation="vertical"
          onChange={(_, value) => value && toggleMapLayer(value)}
          sx={{
            position: 'absolute',
            top: drawnRect == null ? 120 : 200,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 2,
          }}
        >
          <Tooltip title="Points" placement="left" arrow>
            <ToggleButton value="cluster" sx={{ width: 30, height: 30 }}>
              <ClusterIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Heatmap" placement="left" arrow>
            <ToggleButton value="heatmap" sx={{ width: 30, height: 30 }}>
              <HeatmapIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Geohash" placement="left" arrow>
            <span>
              <ToggleButton
                value="geohash"
                sx={{ width: 30, height: 30 }}
                disabled={drawnRect != null}
              >
                <GeohashIcon />
              </ToggleButton>
            </span>
          </Tooltip>
        </ToggleButtonGroup>}
        {mapLayer === 'cluster' ? (
          clusters.map((cluster, index) => {
            // every cluster point has coordinates
            // the point may be either a cluster or a single point
            const { totalCount, points } = cluster.properties;

            // Dynamically extract the measure value that matches dataset.measure0 or dataset.measure1
            const getMeasureValue = () => {
              if (
                dataset.measure0 &&
                cluster.properties[dataset.measure0] !== undefined
              ) {
                return cluster.properties[dataset.measure0];
              }
              if (
                dataset.measure1 &&
                cluster.properties[dataset.measure1] !== undefined
              ) {
                return cluster.properties[dataset.measure1];
              }

              return undefined;
            };

            const measureValue = getMeasureValue();

            if (totalCount === 1) {
              return (
                <SinglePoint
                  key={`single-point-${index}`}
                  dataset={{ ...dataset, id }}
                  point={points[0]}
                  coordinates={cluster.geometry.coordinates}
                  selectedMarker={selectedSinglePointMarker}
                  setSelectedMarker={setSelectedSinglePointMarker}
                />
              );
            }

            return (
              <Marker
                key={'cluster' + index}
                position={[
                  cluster.geometry.coordinates[1],
                  cluster.geometry.coordinates[0],
                ]}
                icon={fetchIcon(
                  totalCount,
                  true,
                  measureValue !== undefined
                    ? generateRsrpColor(dataset, measureValue as number)
                    : null,
                )}
                eventHandlers={{
                  click: () => {
                    setSelectedClusterMarker({
                      lat: cluster.geometry.coordinates[1],
                      lng: cluster.geometry.coordinates[0],
                    });
                  },
                }}
              >
                {selectedClusterMarker &&
                  selectedClusterMarker.lat ===
                    cluster.geometry.coordinates[1] &&
                  selectedClusterMarker.lng ===
                    cluster.geometry.coordinates[0] && (
                  <CustomPopup
                    latlng={[
                      cluster.geometry.coordinates[1],
                      cluster.geometry.coordinates[0],
                    ]}
                    onClose={() => {
                      setSelectedClusterMarker(null);
                    }}
                  >
                    <div>
                      <div>
                        <span>
                          <b>{dataset.measure0}:</b>{' '}
                          {dataset.measure0 &&
                            cluster.properties[dataset.measure0] !== undefined
                            ? typeof cluster.properties[dataset.measure0] ===
                                'number'
                              ? (
                                    cluster.properties[
                                      dataset.measure0
                                    ] as number
                              ).toFixed(4)
                              : cluster.properties[dataset.measure0]
                            : 'N/A'}
                        </span>
                        <br></br>
                      </div>
                      <div>
                        <span>
                          <b>{dataset.measure1}:</b>{' '}
                          {dataset.measure1 &&
                            cluster.properties[dataset.measure1] !== undefined
                            ? typeof cluster.properties[dataset.measure1] ===
                                'number'
                              ? (
                                    cluster.properties[
                                      dataset.measure1
                                    ] as number
                              ).toFixed(4)
                              : cluster.properties[dataset.measure1]
                            : 'N/A'}
                        </span>
                        <br></br>
                      </div>
                      {dataset.dimensions &&
                          dataset.dimensions.map(dim => (
                            <div key={dim}>
                              <span>
                                <b>{dim}:</b>{' '}
                                {Array.isArray(cluster.properties[dim])
                                  ? // Check if there are more than 10 items
                                  cluster.properties[dim].length > 10
                                    ? // Join the first 10 items and add ellipsis
                                    `${cluster.properties[dim].slice(0, 10).join(', ')}...`
                                    : // Join all items if 10 or fewer
                                    cluster.properties[dim].join(', ')
                                  : // Handle the case where it's not an array
                                  cluster.properties[dim]}
                              </span>
                              <br />
                            </div>
                          ))}
                    </div>
                  </CustomPopup>
                )}
              </Marker>
            );
          })
        ) : mapLayer === 'heatmap' ? (
          points && (
            <HeatmapLayer
              fitBoundsOnLoad
              points={points}
              latitudeExtractor={latitudeExtractor}
              longitudeExtractor={longitudeExtractor}
              intensityExtractor={intensityExtractor}
              radius={Math.min(Math.max(zoom * 1.5, 15), 40)}
              useLocalExtrema={false}
              gradient={{
                0: '#00FFFF', // Cyan
                0.2: '#00FF00', // Green
                0.4: '#66FF33', // Light Green
                0.6: '#FFFF00', // Yellow
                0.8: '#FF6600', // Orange
                1.0: '#FF0000', // Red
              }}
            />
          )
        ) : mapLayer === 'geohash' ? (
          <GeohashGridLayer
            dataset={dataset}
            points={points}
            selectedGeohash={selectedGeohash.string}
            setSelectedGeohash={(geohash: string | null) =>
              dispatch(setSelectedGeohash(geohash))
            }
            predictionData={filteredPredictionData}
            predictionDisplay={predictionDisplay}
          />
        ) : null}
        <MapSearch />
      </MapContainer>
    );
  }

  return content;
};
