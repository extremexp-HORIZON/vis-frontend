import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
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
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  getDataSourceList,
  setDataSource,
} from '../../store/slices/exploring/datasourceSlice';
import { useEffect } from 'react';
import Loader from '../../shared/components/loader';
import { FileUpload } from '../../shared/components/file-upload';

const ExploringPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { dataSources, loading, error } = useAppSelector(
    state => state.dataSource,
  );

  useEffect(() => {
    dispatch(getDataSourceList());
  }, [dispatch]);

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
      ) : error.fetch ? (
        <Alert severity="error" sx={{ width: '80%', margin: 'auto' }}>
          {error.fetch}
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
                sx={{ marginTop: 2, width: '80%' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Source</TableCell>
                      {/* <TableCell align="center">Source Type</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataSources.map(dataSource => (
                      <TableRow
                        key={`dataSource-row-${dataSource.fileName}`}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          dispatch(setDataSource(dataSource));
                          navigate(
                            `${location.pathname.replace(/\/$/, '')}/visualize/${dataSource.fileName}`,
                          );
                        }}
                      >
                        <TableCell sx={{ textAlign: 'center' }}>
                          {dataSource.fileName}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {dataSource.source}
                        </TableCell>
                        {/* <TableCell sx={{ textAlign: 'center' }}>
                      {dataSource.sourceType}
                    </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Upload Section */}
          <Box sx={{ width: '40%', mt: 3 }}>
            <FileUpload />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ExploringPage;
