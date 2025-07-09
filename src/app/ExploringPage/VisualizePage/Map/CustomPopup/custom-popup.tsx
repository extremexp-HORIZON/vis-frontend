import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import CustomPopupPointArrow from './custom-popup-point-arror';

interface CustomPopupProps {
  latlng: [number, number];
  children: React.ReactNode;
  onClose?: () => void;
}

const EDGE_MARGIN = 200;
const POPUP_MARGIN = 12;

const CustomPopup: React.FC<CustomPopupProps> = ({
  latlng,
  children,
  onClose,
}) => {
  const map = useMap();
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const [direction, setDirection] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >('top');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map) return;
    const point = map.latLngToContainerPoint(latlng);
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    const left = rect.left + point.x;
    const top = rect.top + point.y;

    setPos({ left, top });

    // Determine direction

    let dir: typeof direction = 'top';

    if (point.y < EDGE_MARGIN) dir = 'bottom';
    else if (point.x < EDGE_MARGIN) dir = 'right';
    else if (point.x > rect.width - EDGE_MARGIN) dir = 'left';
    setDirection(dir);

    const update = () => {
      const pt = map.latLngToContainerPoint(latlng);
      const rect = container.getBoundingClientRect();

      const l = rect.left + pt.x;
      const t = rect.top + pt.y;

      setPos({ left: l, top: t });

      let d: typeof direction = 'top';

      if (pt.y < EDGE_MARGIN) d = 'bottom';
      else if (pt.x < EDGE_MARGIN) d = 'right';
      else if (pt.x > rect.width - EDGE_MARGIN) d = 'left';
      setDirection(d);
    };

    map.on('move zoom', update);
    window.addEventListener('resize', update);

    return () => {
      map.off('move zoom', update);
      window.removeEventListener('resize', update);
    };
  }, [map, latlng]);

  // Optional: close popup on map click
  useEffect(() => {
    if (!map || !onClose) return;
    map.on('click', onClose);

    return () => {
      map.off('click', onClose);
    };
  }, [map, onClose]);

  // Prevent scroll/zoom propagation to map
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  // Choose transform based on direction
  let transform = `translate(-50%, calc(-100% - ${POPUP_MARGIN}px))`; // top

  if (direction === 'bottom') transform = `translate(-50%, ${POPUP_MARGIN}px)`;
  else if (direction === 'left')
    transform = `translate(calc(-100% - ${POPUP_MARGIN}px), -50%)`;
  else if (direction === 'right')
    transform = `translate(${POPUP_MARGIN}px, -50%)`;

  // SSR fallback
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        transform,
        zIndex: 2000,
        background: 'white',
        border: '1px solid #888',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: 12,
        pointerEvents: 'auto',
      }}
      onPointerDown={handlePointerDown}
    >
      <CustomPopupPointArrow direction={direction} />
      <button
        style={{
          position: 'absolute',
          top: 2,
          right: 4,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
        onClick={onClose}
      >
        ×
      </button>
      <div
        style={{
          maxHeight: `${EDGE_MARGIN}px`,
          overflowY: 'auto',
          pointerEvents: 'auto',
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
      >
        {children}
      </div>
    </div>,
    window.document.body,
  );
};

export default CustomPopup;
