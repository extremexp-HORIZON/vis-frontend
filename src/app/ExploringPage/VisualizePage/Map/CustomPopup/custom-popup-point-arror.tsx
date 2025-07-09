import React from 'react';

interface CustomPopupPointArrowProps {
  direction: 'top' | 'bottom' | 'left' | 'right';
}

const CustomPopupPointArrow: React.FC<CustomPopupPointArrowProps> = ({
  direction,
}) => (
  <div
    style={{
      position: 'absolute',
      ...(direction === 'top' && {
        left: '50%',
        bottom: -10,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #fff',
      }),
      ...(direction === 'bottom' && {
        left: '50%',
        top: -10,
        transform: 'translateX(-50%) rotate(180deg)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #fff',
      }),
      ...(direction === 'left' && {
        top: '50%',
        right: -10,
        transform: 'translateY(-50%) rotate(-90deg)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #fff',
      }),
      ...(direction === 'right' && {
        top: '50%',
        left: -10,
        transform: 'translateY(-50%) rotate(90deg)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #fff',
      }),
      pointerEvents: 'none',
      zIndex: 2001,
    }}
  />
);

export default CustomPopupPointArrow;
