import React from 'react';

const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = React.useState({ x: 0, y: 0});
  React.useEffect(() => {
    const updateMousePosition = (ev: { pageX: any; pageY: any; }) => {
      setMousePosition({ x: ev.pageX, y: ev.pageY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

export default useMousePosition;