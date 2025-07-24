import { Box } from '@mui/material';
const GamificationPage = () => {
  return (
    <Box
      component="iframe"
      src="https://i4dxp.eu/game/iframe/"
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
