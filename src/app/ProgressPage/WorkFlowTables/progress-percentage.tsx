import * as React from 'react';
import type {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{color: theme => theme.palette.customGrey.text}}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function ProgressPercentage({ progressNumber }: { progressNumber: string }) {
  const progress = parseFloat(progressNumber);
  if (!Number.isNaN(progress)) {
    return <CircularProgressWithLabel value={progress * 100} />;

  } else {
    return progressNumber;
  }
}