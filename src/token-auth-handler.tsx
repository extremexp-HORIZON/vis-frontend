import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Typography, LinearProgress } from '@mui/material';
import { checkAuthentication } from './store/slices/authSlice';
import { logger } from './shared/utils/logger';

const TokenAuthHandler = () => {
  const { token, experimentId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing authentication token');

      return;
    }

    const processToken = async () => {
      try {
        setProgress(30);

        // Call checkAuthentication and await its result
        const isAuthenticated = await checkAuthentication(token);

        setProgress(70);

        if (isAuthenticated) {
          setProgress(100);

          // If authentication was successful and we have an experimentId, navigate there
          if (experimentId) {
            setTimeout(() => {
              navigate(`/${experimentId}`, { replace: true });
            }, 800);
          } else {
            // If no experimentId but auth was successful, go to home page
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 800);
          }
        } else {
          // Authentication failed
          setError('Authentication failed');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (err) {
        logger.error('Authentication error:', err);
        setError('Authentication failed');

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    processToken();
  }, [token, experimentId, navigate]);

  return (
    <Grid
      id={'error-page'}
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid sx={{ display: 'flex', rowGap: 2, flexDirection: 'column' }}>
        <img
          src="/images/extremexp-logo.png"
          height={130}
          style={{ objectFit: 'contain' }}
          alt='Extremexp logo'
        />
        <Typography variant="h4">Authenticating...</Typography>

        {error ? (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        ) : (
          <Typography variant="h6">Setting up your session...</Typography>
        )}

        <LinearProgress
          variant="determinate"
          value={progress}
          color={error ? 'error' : 'primary'}
        />
      </Grid>
    </Grid>
  );
};

export default TokenAuthHandler;
