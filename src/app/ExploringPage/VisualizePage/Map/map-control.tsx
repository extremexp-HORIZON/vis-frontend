import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import {
  setDrawnRect,
  updateMapBounds,
} from '../../../../store/slices/exploring/mapSlice';
import { useAppDispatch } from '../../../../store/store';

export const MapControl = ({ id }: { id: string }) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    if (!map) return;

    function onCreated(e: L.LeafletEvent) {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;

      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      if ('getBounds' in layer) {
        const bounds = layer.getBounds();

        dispatch(
          setDrawnRect({
            id,
            bounds: {
              south: bounds.getSouth(),
              west: bounds.getWest(),
              north: bounds.getNorth(),
              east: bounds.getEast(),
            },
          }),
        );
      }
    }

    function onDeleted() {
      dispatch(setDrawnRect({ id, bounds: null }));
    }

    function onMoveEnd() {
      const bounds = map.getBounds();

      dispatch(
        updateMapBounds({
          id,
          bounds: {
            south: bounds.getSouth(),
            west: bounds.getWest(),
            north: bounds.getNorth(),
            east: bounds.getEast(),
          },
          zoom: map.getZoom(),
        }),
      );
    }

    if (!hasInitialized.current) {
      onMoveEnd();
      hasInitialized.current = true;
    }

    const drawnItems = drawnItemsRef.current;

    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: { showArea: false }, // disable showArea
        polyline: false,
        polygon: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: true,
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.DELETED, onDeleted);
    map.on('moveend', onMoveEnd);

    const legend = new L.Control({ position: 'topright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');

      div.innerHTML +=
        '<div class="color-block" style="background-color: #FC6666;"></div> <span class="label">Poor</span><br>';
      div.innerHTML +=
        '<div class="color-block" style="background-color: orange;"></div> <br><span class="label">Fair</span><br>';
      div.innerHTML +=
        '<div class="color-block" style="background-color: #FFF966;"></div> <span class="label">Good</span><br>';
      div.innerHTML +=
        '<div class="color-block" style="background-color: #99FF99;"></div> <span class="label">Excellent</span>';

      return div;
    };

    legend.addTo(map);

    return () => {
      map.removeLayer(drawnItems);
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.off('moveend', onMoveEnd);
      map.removeControl(legend);
    };
  }, [id, map, dispatch]);

  return null;
};
