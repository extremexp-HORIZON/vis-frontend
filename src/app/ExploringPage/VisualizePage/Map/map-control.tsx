import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { setDrawnRect, updateMapBounds } from '../../../../store/slices/exploring/mapSlice';
import { useAppDispatch } from '../../../../store/store';

declare module 'leaflet' {
  interface Map {
    _toggleClusterMap?: () => void;
  }
}

// Custom control for toggling cluster/heatmap view (define once)
const ToggleControl = L.Control.extend({
  onAdd: function (map: L.Map) {
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control leaflet-control-custom',
    );
    container.style.backgroundColor = 'white';
    container.style.width = '34px';
    container.style.height = '34px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.cursor = 'pointer';
    container.title = 'Toggle cluster/heatmap';
    container.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    `;
    L.DomEvent.on(container, 'click', function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      if (map._toggleClusterMap) {
        map._toggleClusterMap();
      }
    });
    return container;
  },
  onRemove: function () {},
});

export const MapControl = ({
  id,
  toggleClusterMap,
}: {
  id: string;
  toggleClusterMap: () => void;
}) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const toggleInstanceRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map) return;
    // Attach the toggleClusterMap function to the map instance for access in the control
    // (This avoids closure issues and repeated class creation)
    map._toggleClusterMap = toggleClusterMap;

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

    // Add the toggle control only once
    if (!toggleInstanceRef.current) {
      toggleInstanceRef.current = new ToggleControl({ position: 'topright' });
      map.addControl(toggleInstanceRef.current);
    }

    return () => {
      map.removeLayer(drawnItems);
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.off('moveend', onMoveEnd);
      map.removeControl(legend);
      if (toggleInstanceRef.current) {
        map.removeControl(toggleInstanceRef.current);
        toggleInstanceRef.current = null;
      }
      delete map._toggleClusterMap;
    };
  }, [id, map, dispatch, toggleClusterMap]);

  return null;
};
