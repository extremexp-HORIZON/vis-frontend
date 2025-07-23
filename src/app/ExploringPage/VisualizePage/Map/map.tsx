import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  generateRsrpColor,
  MAX_ZOOM,
  rsrpIntensityExtractor,
  type IPointType,
} from '../../../../shared/utils/clusterUtils';
import { MapContainer, Marker, TileLayer, ZoomControl } from 'react-leaflet';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
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
import { setSelectedGeohash } from '../../../../store/slices/exploring/mapSlice';

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

  //   const [map, setMap] = useState(null);
  const { clusters, viewRect, zoom, selectedGeohash } = useAppSelector(
    (state: RootState) => state.map,
  );
  const [clusterMap, setClusterMap] = useState<boolean>(true);
  const [selectedClusterMarker, setSelectedClusterMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSinglePointMarker, setSelectedSinglePointMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showGeohashGrid, setShowGeohashGrid] = useState(false);

  // Initialize selectedGeohash from URL params
  useEffect(() => {
    if (geohash && geohash !== selectedGeohash) {
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

  const points = useMemo(() => {
    if (!clusters) return [];

    // return clusters.flatMap((cluster) =>
    //   cluster.properties.points
    //     .filter((point) => typeof point[0] === 'number' && typeof point[1] === 'number')
    //     .map((point) => [point[0] as number, point[1] as number, point[4] as number | undefined]),
    // );
    return getPoints(clusters);
  }, [clusters]);

  const toggleClusterMap = useCallback(() => setClusterMap(prev => !prev), []);
  const toggleGeohashGrid = useCallback(() => {
    if (showGeohashGrid) {
      resetGeohashSelection();
    }
    setShowGeohashGrid(prev => !prev);
  }, [showGeohashGrid, dispatch]);

  const resetGeohashSelection = useCallback(() => {
    dispatch(setSelectedGeohash(null));
    navigate('?');
  }, [dispatch, navigate]);

  let content: React.ReactNode;

  const center: [number, number] =
    viewRect != null
      ? [
        (viewRect.lat[0] + viewRect.lat[1]) / 2, // Midpoint of latitude
        (viewRect.lon[0] + viewRect.lon[1]) / 2, // Midpoint of longitude
      ]
      : [51.505, -0.09];

  if (clusters) {
    content = (
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        maxZoom={MAX_ZOOM}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapControl
          id={id}
          toggleClusterMap={toggleClusterMap}
          toggleGeohashGrid={toggleGeohashGrid}
        />
        {showGeohashGrid || selectedGeohash !== null ? (
          <GeohashGridLayer
            dataset={dataset}
            points={points}
            selectedGeohash={selectedGeohash}
            setSelectedGeohash={(geohash: string | null) =>
              dispatch(setSelectedGeohash(geohash))
            }
          />
        ) : clusterMap ? (
          clusters.map((cluster, index) => {
            // every cluster point has coordinates
            // the point may be either a cluster or a single point
            const { totalCount, points, rsrp_rscp_rssi } = cluster.properties;

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
                  generateRsrpColor(dataset, rsrp_rscp_rssi as number),
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
                          {cluster.properties[dataset.measure0!] &&
                              (
                                cluster.properties[dataset.measure0!] as number
                              ).toFixed(4)}
                        </span>
                        <br></br>
                      </div>
                      <div>
                        <span>
                          <b>{dataset.measure1}:</b>{' '}
                          {cluster.properties[dataset.measure1!] &&
                              (
                                cluster.properties[dataset.measure1!] as number
                              ).toFixed(4)}
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
        ) : (
          points && (
            <HeatmapLayer
              fitBoundsOnLoad
              points={points}
              latitudeExtractor={latitudeExtractor}
              longitudeExtractor={longitudeExtractor}
              intensityExtractor={intensityExtractor}
              radius={zoom}
              // points={clusters.filter(c => c.properties.totalCount > 1)}
              // latitudeExtractor={(r:ICluster) => r.geometry.coordinates[1]}
              // longitudeExtractor={(r:ICluster) =>  r.geometry.coordinates[0]}
              // intensityExtractor={(r:ICluster) => {
              //   return rsrpIntensityExtractor(dataset, r.properties.rsrp_rscp_rssi);
              // }}
              useLocalExtrema={false}
              gradient={{
                0: '#00FFFF',
                0.2: '#00FF00',
                0.4: '#66FF33',
                0.6: '#FFFF00',
                0.8: '#FF6600',
                1.0: '#FF0000',
              }}
            />
          )
        )}
        <ZoomControl position="topright" />
        <MapSearch />
      </MapContainer>
    );
  }

  return content;
};
