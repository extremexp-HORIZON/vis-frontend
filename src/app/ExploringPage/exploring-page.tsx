import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  deleteDataSource,
  getDataSourceList,
  setDataSource,
} from '../../store/slices/exploring/datasourceSlice';
import { useEffect, useState } from 'react';
import Loader from '../../shared/components/loader';
import { DataSourceFileUpload } from './data-source-file-upload';
import { ConfirmationModal } from '../../shared/components/confirmation-modal';
import { listModels, listProcessedData } from '../../store/slices/exploring/eusomeSlice';

const ExploringPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    fileName: string | null;
  }>({
    open: false,
    fileName: null,
  });
  const { dataSources, loading, error } = useAppSelector(
    state => state.dataSource,
  );
  const { modelsList, processedDataList } = useAppSelector(state => state.eusome);

  useEffect(() => {
    if (dataSources.length === 0) {
      dispatch(getDataSourceList());
    }
    if (!modelsList) {
      dispatch(listModels());
    }
    if (!processedDataList) {
      dispatch(listProcessedData());
    }
  }, [dispatch]);

  const handleViewClick = (fileName: string) => {
    dispatch(
      setDataSource(
        dataSources.find(dataSource => dataSource.fileName === fileName)!,
      ),
    );
    navigate(`${location.pathname.replace(/\/$/, '')}/visualize/${fileName}`);
  };

  const handleDeleteClick = (fileName: string) => {
    setDeleteConfirmation({
      open: true,
      fileName,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.fileName) {
      dispatch(deleteDataSource(deleteConfirmation.fileName));
      setDeleteConfirmation({ open: false, fileName: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, fileName: null });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {loading.fetch ? (
        <Loader />
      ) : error.fetch || error.delete ? (
        <Alert severity="error" sx={{ width: '80%', margin: 'auto' }}>
          {error.fetch || error.delete}
        </Alert>
      ) : (
        <>
          {dataSources.length === 0 ? (
            <Alert severity="info" sx={{ width: '80%' }}>
              No data sources found. Please upload a data source.
            </Alert>
          ) : (
            <>
              <Typography variant="h4" textAlign="center">
                Available Data Sources
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ marginTop: 2, width: '85%', maxHeight: '60%' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Source</TableCell>
                      <TableCell align="center">Measures</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataSources.map(dataSource => (
                      <TableRow key={`dataSource-row-${dataSource.fileName}`}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {dataSource.fileName}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {dataSource.source}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {dataSource.measure0}, {dataSource.measure1}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleViewClick(dataSource.fileName)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                              handleDeleteClick(dataSource.fileName)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Upload Section */}
          <Box sx={{ width: '40%', mt: 3 }}>
            <DataSourceFileUpload />
          </Box>

          <ConfirmationModal
            open={deleteConfirmation.open}
            title="Delete Data Source"
            message={`Are you sure you want to delete data source with id: "${deleteConfirmation.fileName}"?`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmColor="error"
            severity="warning"
            loading={loading.delete}
          />
        </>
      )}
    </Box>
  );
};

export default ExploringPage;
