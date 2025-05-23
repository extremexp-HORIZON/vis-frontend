import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import grey from '@mui/material/colors/grey';
import type { RootState } from '../../store/store';
import { useAppSelector } from '../../store/store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import Chip from '@mui/material/Chip';

const ProgressPageBar = () => {
  const { experimentId } = useParams();
  const { progressBar } = useAppSelector((state: RootState) => state.progressPage);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            // icon={<ScienceIcon />}
            label={`Experiment: ${experimentId}`}
            color="primary"
            variant="outlined"
            sx={{
              border: 'none',
              p: 0,
              alignContent: 'left',
              justifyContent: 'left',
              fontWeight: '600',
              '& .MuiChip-label': {
                fontSize: '1rem',
              }
            }}
          />
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            // borderRadius: '16px',
            // px: 1,
            // border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography
              variant="body2"
              fontWeight="medium"
              color="text.secondary"
              sx={{ mr: 0.5 }}
            >
              Progress:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color="secondary"
            >
              {`${progressBar.progress}%`}
            </Typography>
          </Box>
        </Box>

        {matches && (
          <Box
            sx={{ minWidth: 35, display: 'flex', columnGap: 1, flexWrap: 'wrap' }}
          >
            <Typography
              variant="body1"
              color="text.primary"
            >{`Completed: ${progressBar.completed}/${progressBar.total}`}</Typography>
            <Typography
              variant="body1"
              color="text.primary"
            >{`Running: ${progressBar.running}/${progressBar.total}`}</Typography>
            <Typography
              variant="body1"
              color="text.primary"
            >{`Failed: ${progressBar.failed}/${progressBar.total}`}</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ width: '100%', ml: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.round(progressBar.progress)}
          sx={{
            height: '1rem',
            borderRadius: 10,
            backgroundColor: grey[300],
            '& .MuiLinearProgress-bar': {
              background:
                theme => theme.palette.customGradient.main,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ProgressPageBar;
