import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const ExploringPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hardoced datasets until we find a proper dynamic way for it.
  const datasets = [
    {
      id: 'holistic-p3-measurements-athens',
      name: 'holistic-p3-measurements-athens',
      dimensions: ['net_type', 'mcc_nr', 'mnc_nr', 'provider', 'eci_cid'],
      objectCount: 99999,
    },
    {
      id: 'p3-measurements-athens',
      name: 'p3-measurements-athens',
      dimensions: ['net_type', 'mcc_nr', 'mnc_nr', 'provider', 'eci_cid'],
      objectCount: 99999,
    },
    {
      id: 'patra',
      name: 'patra',
      dimensions: ['net_type', 'mcc_nr', 'mnc_nr', 'provider', 'eci_cid'],
      objectCount: 48354,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Typography variant="h4" textAlign="center">
        Available Datasets
      </Typography>
      <TableContainer component={Paper} sx={{ marginTop: 2, width: '80%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Dimensions</TableCell>
              <TableCell align="center">Object Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map(dataset => (
              <TableRow
                key={`dataset-row-${dataset.id}`}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() =>
                  navigate(
                    `${location.pathname.replace(/\/$/, '')}/visualize/${dataset.id}`,
                  )
                }
              >
                <TableCell sx={{ textAlign: 'center' }}>
                  {dataset.name}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {dataset.dimensions?.join(', ')}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {dataset.objectCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ExploringPage;
