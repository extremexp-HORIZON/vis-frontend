import { Box } from '@mui/material';
import { getToken } from '../../../store/slices/authSlice';
import { useMemo } from 'react';

const GamificationPage = () => {
  const gamificationUrl = useMemo(() => {
    const token = getToken();
    const baseUrl = 'https://i4dxp.eu/game/iframe/';

    // Append token after # sign as agreed with the gamification team
    return token ? `${baseUrl}#${token}` : baseUrl;
  }, []);

  return (
    <Box
      component="iframe"
      src={gamificationUrl}
      title="Gamification Panel"
      allowFullScreen
      allow="fullscreen"
      sx={{
        width: '100%',
        height: '2200px',

      }}
    />

  );
};

export default GamificationPage;
