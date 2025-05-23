import { Box, CircularProgress, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';

const Loader = () => {
  return(<Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <CircularProgress />
    <Typography variant="body2" sx={{ ml: 1, color: grey[600] }}>
          Loading...
    </Typography>
  </Box>);
};

export default Loader;
