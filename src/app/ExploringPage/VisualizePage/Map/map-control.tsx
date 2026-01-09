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
import { postZone, setZone } from '../../../../store/slices/exploring/zoneSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useMapDrawing } from './useMapDrawing';
import { resetZoneState } from '../../../../store/slices/exploring/zoneSlice';

export const MapControl = ({ id }: { id: string }) => {
  const map = useMap();
  const dispatch = useAppDispatch();
  const { zone } = useAppSelector(state => state.zone);
  const hasInitialized = useRef(false);

  // Use the custom hook for all drawing functionality
  const {
    drawnItemsRef,
    addDrawnLayer,
    clearDrawnItems,
    setVisibilityChangeCallback,
  } = useMapDrawing(map, id);

  useEffect(() => {
    if (!map) return;

    function onCreated(e: L.LeafletEvent) {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;

      // Use the hook's method to add the layer
      addDrawnLayer(layer);

      if ('getBounds' in layer) {
        const bounds = layer.getBounds();

        dispatch(resetZoneState());
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

    // Custom drawing control with separate save/clear functionality
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
        remove: false, // Disable default remove control
      },
    });

    map.addControl(drawControl);

    // Custom save/clear control
    const saveClearControl = new L.Control({ position: 'topright' });

    saveClearControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

      div.style.marginTop = '10px';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.gap = '2px';
      div.style.display = 'none'; // Initially hidden

      // Save button
      const saveButton = L.DomUtil.create('a', 'leaflet-control-save', div);

      saveButton.innerHTML = '💾';
      saveButton.title = 'Save drawn rectangle as zone';
      saveButton.style.width = '30px';
      saveButton.style.height = '30px';
      saveButton.style.lineHeight = '30px';
      saveButton.style.textAlign = 'center';
      saveButton.style.fontSize = '16px';
      saveButton.style.cursor = 'pointer';
      // saveButton.style.backgroundColor = '#4CAF50';
      saveButton.style.color = 'white';
      saveButton.style.border = 'none';
      saveButton.style.borderRadius = '4px';

      // Disable saveButton if zone rectangle is drawn
      if (zone?.id) {
        saveButton.setAttribute('disabled', 'true');
        saveButton.style.opacity = '0.5';
        saveButton.style.pointerEvents = 'none';
      } else {
        saveButton.removeAttribute('disabled');
        saveButton.style.opacity = '1';
        saveButton.style.pointerEvents = 'auto';
      }

      // Clear button
      const clearButton = L.DomUtil.create('a', 'leaflet-control-clear', div);

      clearButton.innerHTML = '✖️';
      clearButton.title = 'Clear drawn rectangle';
      clearButton.style.width = '30px';
      clearButton.style.height = '30px';
      clearButton.style.lineHeight = '30px';
      clearButton.style.textAlign = 'center';
      clearButton.style.fontSize = '16px';
      clearButton.style.cursor = 'pointer';
      // clearButton.style.backgroundColor = '#f44336';
      clearButton.style.color = 'white';
      clearButton.style.border = 'none';
      clearButton.style.borderRadius = '4px';

      // Function to show/hide the control based on drawn layers
      const updateControlVisibility = () => {
        // Use the hook's drawnItemsRef instead of the local drawnItems variable
        const layers = drawnItemsRef.current.getLayers();

        div.style.display = layers.length > 0 ? 'flex' : 'none';
      };

      // Save functionality
      saveButton.onclick = function () {
        const layers = drawnItems.getLayers();

        if (layers.length > 0) {
          const layer = layers[0];

          if ('getBounds' in layer && typeof layer.getBounds === 'function') {
            const bounds = layer.getBounds();

            // Create zone object from bounds
            const zone = {
              fileName: id, // Use dataset ID as filename
              name: `Drawn Zone ${new Date().toLocaleString()}`,
              rectangle: {
                lat: [bounds.getSouth(), bounds.getNorth()],
                lon: [bounds.getWest(), bounds.getEast()],
              },
              // Add other zone properties as needed
            };

            // Dispatch postZone action
            dispatch(postZone(zone));

            // Keep the drawn rectangle visible (don't clear it)
            // Zone saved successfully
          }
        }
      };

      // Clear functionality
      clearButton.onclick = function () {
        // Use the hook's clear method
        clearDrawnItems();
        dispatch(setDrawnRect({ id, bounds: null }));
        if (zone?.id) {
          dispatch(setZone({}));
        }
        updateControlVisibility(); // Hide the control after clearing
      };

      // Store the update function on the control for external access
      (
        saveClearControl as L.Control & { updateVisibility?: () => void }
      ).updateVisibility = updateControlVisibility;

      // Set up the visibility change callback from the hook
      setVisibilityChangeCallback(updateControlVisibility);

      // Initial visibility check
      updateControlVisibility();

      return div;
    };

    map.addControl(saveClearControl);

    // Create wrapper functions that show/hide the control
    const onCreatedWrapper = (e: L.LeafletEvent) => {
      onCreated(e);
      // Show the save/clear control after drawing
      const control = saveClearControl as L.Control & {
        updateVisibility?: () => void;
      };

      if (control.updateVisibility) {
        control.updateVisibility();
      }
    };

    const onDeletedWrapper = (e: L.LeafletEvent) => {
      onDeleted();
      // Hide the save/clear control after deletion
      const control = saveClearControl as L.Control & {
        updateVisibility?: () => void;
      };

      if (control.updateVisibility) {
        control.updateVisibility();
      }
    };

    map.on(L.Draw.Event.CREATED, onCreatedWrapper);
    map.on(L.Draw.Event.DELETED, onDeletedWrapper);
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
      map.removeControl(saveClearControl);
      map.off(L.Draw.Event.CREATED, onCreatedWrapper);
      map.off(L.Draw.Event.DELETED, onDeletedWrapper);
      map.off('moveend', onMoveEnd);
      map.removeControl(legend);
    };
  }, [map, id, dispatch, addDrawnLayer, clearDrawnItems]);

  return null;
};
