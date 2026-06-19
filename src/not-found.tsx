import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const NotFound = () => {

  return (
    <Box id="error-page">
      <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 0.5, userSelect: 'none' }}>
        <Typography component="h1" sx={{ fontSize: 130, m: 0 }}>4</Typography>
        <Box component="img" src="/images/extremexp-logo.png" alt="Extremexp logo" sx={{ height: 130 }} />
        <Typography component="h1" sx={{ fontSize: 130, m: 0 }}>4</Typography>
      </Box>

      <Typography sx={{ userSelect: 'none' }}>Page not found.</Typography>
      <Typography sx={{ userSelect: 'none' }}>It looks like you&apos;ve been lost.</Typography>
    </Box>
  );
};

export default NotFound;
