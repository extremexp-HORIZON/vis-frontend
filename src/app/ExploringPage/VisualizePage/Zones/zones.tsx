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
  Tooltip,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
  getZonesByFileName,
  setModalOpen,
  deleteZone,
  setViewZone,
} from '../../../../store/slices/exploring/zoneSlice';
import Loader from '../../../../shared/components/loader';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import { useEffect, useState } from 'react';
import type { IZone } from '../../../../shared/models/exploring/zone.model';

export interface IZonesProps {
  dataset: IDataset;
}

export const Zones = ({ dataset }: IZonesProps) => {
  const { modalOpen, zone, zones, loading, error } = useAppSelector(
    state => state.zone,
  );
  const dispatch = useAppDispatch();
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(
    null,
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    zoneId: string | null;
    zoneName: string | null;
  }>({
    open: false,
    zoneId: null,
    zoneName: null,
  });

  useEffect(() => {
    if (dataset.id && modalOpen) {
      dispatch(getZonesByFileName(dataset.id));
    }

    if (!modalOpen) {
      // dispatch(reset());
      setHighlightedZoneId(null);
      setDeleteConfirmation({ open: false, zoneId: null, zoneName: null });
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

  const handleDeleteClick = (zoneId: string, zoneName: string) => {
    setDeleteConfirmation({
      open: true,
      zoneId,
      zoneName,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.zoneId && dataset.id) {
      dispatch(
        deleteZone({ fileName: dataset.id, id: deleteConfirmation.zoneId }),
      );
      setDeleteConfirmation({ open: false, zoneId: null, zoneName: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, zoneId: null, zoneName: null });
  };

  const handleOpenZonesModal = () => {
    dispatch(setModalOpen(true));
  };

  const handleViewZone = (zone: IZone) => {
    if (zone.id) {
      dispatch(setViewZone(zone));
      dispatch(setModalOpen(false));
    }
  };

  return (
    <>
      {/* Zones Button */}
      <Tooltip title="Zones" placement="top" arrow>
        <IconButton
          onClick={handleOpenZonesModal}
          color="primary"
          size="small"
          sx={{ border: '1px solid', borderRadius: 1 }}
        >
          <LaunchIcon />
        </IconButton>
      </Tooltip>

      {/* Zones Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => dispatch(setModalOpen(false))}
        fullWidth
        maxWidth="xl"
      >
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
              <Typography color="error">
                {error.getZones || error.deleteZone}
              </Typography>
            ) : zones.length === 0 ? (
              <Typography>No zones found</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: 'lightgray' }}>
                    <TableRow>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        ID
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Created At
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Geohashes
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Heights
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Rectangle
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'center', fontWeight: 'bold' }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {zones
                      .slice()
                      .sort((a, b) => {
                        const dateA = a.createdAt
                          ? new Date(a.createdAt).getTime()
                          : 0;
                        const dateB = b.createdAt
                          ? new Date(b.createdAt).getTime()
                          : 0;

                        return dateB - dateA; // Most recent first
                      })
                      .map(z => (
                        <TableRow
                          key={z.id}
                          sx={{
                            backgroundColor:
                              highlightedZoneId === z.id
                                ? 'lightblue'
                                : 'white',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              backgroundColor:
                                highlightedZoneId === z.id
                                  ? 'lightblue'
                                  : '#f5f5f5',
                            },
                          }}
                        >
                          <TableCell>{z.id}</TableCell>
                          <TableCell>{z.name}</TableCell>
                          <TableCell>{z.type}</TableCell>
                          <TableCell>
                            {z.createdAt
                              ? new Date(z.createdAt).toLocaleString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {z.geohashes ? (
                              <Box>
                                <Typography>
                                  <strong>Precision:</strong>{' '}
                                  {z.geohashes[0].length}
                                </Typography>
                                <Typography>
                                  <strong>Total:</strong> {z.geohashes.length}
                                </Typography>
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{z.heights?.join(', ')}</TableCell>
                          <TableCell>
                            {z.rectangle ? (
                              <Box>
                                <Typography>
                                  <strong>lat:</strong> [
                                  {z.rectangle.lat?.join(', ')}],{' '}
                                  <strong>lon:</strong> [
                                  {z.rectangle.lon?.join(', ')}]
                                </Typography>
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Zone" placement="right">
                              <IconButton
                                onClick={() => handleViewZone(z)}
                                disabled={loading.getZone}
                                color="primary"
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="right">
                              <IconButton
                                onClick={() =>
                                  handleDeleteClick(
                                    z.id!,
                                    z.name || 'Unknown Zone',
                                  )
                                }
                                disabled={loading.deleteZone}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmation.open}
        title="Delete Zone"
        message={`Are you sure you want to delete zone with id: "${deleteConfirmation.zoneId}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        severity="warning"
        loading={loading.deleteZone}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
