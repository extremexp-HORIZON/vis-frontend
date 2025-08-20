import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TableRow,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import { Launch as LaunchIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { getZonesByFileName, setModalOpen, reset, deleteZone } from '../../../../store/slices/exploring/zoneSlice';
import Loader from '../../../../shared/components/loader';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import { useEffect, useState } from 'react';

export interface IZonesProps {
  dataset: IDataset;
}

export const Zones = ({ dataset }: IZonesProps) => {
  const { modalOpen, zone, zones, loading, error } = useAppSelector((state) => state.zone);
  const dispatch = useAppDispatch();
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);

  useEffect(() => {
    if (dataset.id && modalOpen) {
      dispatch(getZonesByFileName(dataset.id));
    }

    if (!modalOpen) {
      dispatch(reset());
      setHighlightedZoneId(null);
    }
  }, [dataset.id, dispatch, modalOpen]);

  // Effect to handle temporary highlighting when zone changes
  useEffect(() => {
    if (zone?.id) {
      // Set the highlighted zone
      setHighlightedZoneId(zone.id);

      // Clear the highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedZoneId(null);
      }, 3000);

      // Cleanup timer on unmount or when zone changes
      return () => clearTimeout(timer);
    }
  }, [zone?.id]);

  return (
    <>
      {/* Zones Button */}
      <IconButton
        onClick={() => dispatch(setModalOpen(true))}
        color="primary"
        size="small"
        sx={{ border: '1px solid', borderRadius: 1 }}
      >
        <LaunchIcon />
      </IconButton>

      {/* Zones Dialog */}
      <Dialog open={modalOpen} onClose={() => dispatch(setModalOpen(false))} fullWidth maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle>Zones for {dataset.id}</DialogTitle>
          <IconButton onClick={() => dispatch(setModalOpen(false))}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent dividers>
          <Box>
            {loading.getZones ? (
              <Loader />
            ) : error.getZones || error.deleteZone ? (
              <Typography color="error">{error.getZones || error.deleteZone}</Typography>
            ) : zones.length === 0 ? (
              <Typography>No zones found</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: 'lightgray' }}>
                    <TableRow>
                      <TableCell sx={{ textAlign: 'center' }}>ID</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Name</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Type</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Description</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Created At</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Heights</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Rectangle</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {zones
                      .slice()
                      .sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

                        return dateB - dateA; // Most recent first
                      })
                      .map((z) => (
                        <TableRow
                          key={z.id}
                          sx={{
                            backgroundColor: highlightedZoneId === z.id ? 'lightblue' : 'white',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              backgroundColor: highlightedZoneId === z.id ? 'lightblue' : '#f5f5f5'
                            }
                          }}
                        >
                          <TableCell>{z.id}</TableCell>
                          <TableCell>{z.name}</TableCell>
                          <TableCell>{z.type}</TableCell>
                          <TableCell>{z.description}</TableCell>
                          <TableCell>{z.status}</TableCell>
                          <TableCell>{z.createdAt ? new Date(z.createdAt).toLocaleString() : '-'}</TableCell>
                          <TableCell>{z.heights?.join(', ')}</TableCell>
                          <TableCell>
                            {z.rectangle ? (
                              <Box>
                                <Typography>
                                  <strong>lat:</strong> [{z.rectangle.lat?.join(', ')}], <strong>lon:</strong> [{z.rectangle.lon?.join(', ')}]
                                </Typography>
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => dispatch(deleteZone({ fileName: dataset.id!, id: z.id! }))} disabled={loading.deleteZone}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
