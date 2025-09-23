import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TableRow,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
  getZonesByFileName,
  setModalOpen,
  deleteZone,
  setZone,
} from '../../../../store/slices/exploring/zoneSlice';
import Loader from '../../../../shared/components/loader';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import { useEffect, useState } from 'react';
import type { IZone } from '../../../../shared/models/exploring/zone.model';
import { Prediction } from '../Prediction/prediction';
import { type RootState } from '../../../../store/store';

export interface IZonesProps {
  dataset: IDataset;
}

export const Zones = ({ dataset }: IZonesProps) => {
  const { modalOpen, zone, zones, loading, error } = useAppSelector(
    (state: RootState) => state.zone,
  );
  const { zoneIds: predictionZoneIds } =
    useAppSelector((state: RootState) => state.prediction);
  const dispatch = useAppDispatch();
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
    if (dataset.id && modalOpen && zones.length === 0) {
      dispatch(getZonesByFileName(dataset.id));
    }

    if (!modalOpen) {
      // dispatch(reset());
      setDeleteConfirmation({ open: false, zoneId: null, zoneName: null });
    }
  }, [dataset.id, dispatch, modalOpen, zones.length]);

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

  const handleViewZone = (z: IZone) => {
    if (z.id) {
      dispatch(setZone(z));
      dispatch(setModalOpen(false));
    }
  };

  return (
    <>
      {/* Zones Button */}
      <Button
        variant="text"
        color="primary"
        size="medium"
        onClick={handleOpenZonesModal}
        sx={{ borderRadius: 1, textTransform: 'none' }}
      >
        Zones
      </Button>

      {/* Zones Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => dispatch(setModalOpen(false))}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            px: 3,
            py: 1.5,
          }}
        >
          Zones for {dataset.id}
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => dispatch(setModalOpen(false))}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading.getZones ? (
            <Loader />
          ) : error.getZones || error.deleteZone ? (
            <Typography color="error">
              {error.getZones || error.deleteZone}
            </Typography>
          ) : zones.length === 0 ? (
            <Typography>No zones found</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ maxHeight: '60vh', overflow: 'auto' }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Created At
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Geohashes
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      Heights
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
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
                          z.id && predictionZoneIds.includes(z.id)
                            ? theme => `${theme.palette.secondary.main}66`
                            : zone?.id === z.id
                              ? theme => `${theme.palette.primary.main}66`
                              : 'white',
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center' }}>
                          {z.id}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {z.createdAt
                            ? new Date(z.createdAt).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {z.geohashes ? (
                            <>
                              <Typography>
                                <strong>Sample:</strong>{' '}
                                {z.geohashes.slice(0, 5).join(', ')}
                                {z.geohashes.length > 5 && '...'}
                              </Typography>
                              <Typography>
                                <strong>Precision:</strong>{' '}
                                {z.geohashes[0].length}{' '}
                                <strong>Total:</strong> {z.geohashes.length}
                              </Typography>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {z.heights && z.heights.length > 0
                            ? (() => {
                              const sortedHeights = [...z.heights].sort(
                                (a, b) => a - b,
                              );

                              return (
                                <>
                                  <Typography>
                                    {z.heights.length} values
                                  </Typography>
                                  <Typography>
                                    <strong>Min:</strong> {sortedHeights[0]}m
                                  </Typography>
                                  <Typography>
                                    <strong>Max:</strong>{' '}
                                    {sortedHeights[sortedHeights.length - 1]}m
                                  </Typography>
                                </>
                              );
                            })()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip
                            title="View"
                            placement="top"
                            slotProps={{
                              popper: {
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [0, -14],
                                    },
                                  },
                                ],
                              },
                            }}
                          >
                            <IconButton
                              onClick={() => handleViewZone(z)}
                              disabled={loading.getZone}
                              color="primary"
                              size="small"
                              aria-label="view zone"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {z && <Prediction zone={z} />}
                          <Tooltip
                            title="Delete"
                            placement="top"
                            slotProps={{
                              popper: {
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [0, -14],
                                    },
                                  },
                                ],
                              },
                            }}
                          >
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
                              aria-label="delete zone"
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
