import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Menu,
  MenuItem,
  Grid,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import {
  type RootState,
  useAppSelector,
  useAppDispatch,
} from '../../../../store/store';
import type { IRectStats } from '../../../../shared/models/exploring/rect-stats.model';
import Loader from '../../../../shared/components/loader';
import { setSelectedGeohash } from '../../../../store/slices/exploring/mapSlice';
import { useNavigate } from 'react-router-dom';

export interface IStatsPanelProps {
  dataset: IDataset;
  pointCount?: number;
}

export const Stats = ({ dataset, pointCount }: IStatsPanelProps) => {
  const [selectedMeasure, setSelectedMeasure] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElFields, setAnchorElFields] = useState<null | HTMLElement>(
    null,
  );
  const [geohashInput, setGeohashInput] = useState('');
  const [isEditingGeohash, setIsEditingGeohash] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rectStats } = useAppSelector((state: RootState) => state.stats);
  const { viewZone } = useAppSelector((state: RootState) => state.zone);
  const { activeRect, selectedGeohash } = useAppSelector(
    (state: RootState) => state.map,
  );
  const {
    loading: { executeQuery: loadingExecuteQuery },
  } = useAppSelector((state: RootState) => state.dataset);

  const formatStat = (stat: number | null) =>
    stat !== null ? stat.toFixed(2) : 'N/A';
  // const formatStatPercent = (stat: string | null) =>
  //   stat !== null ? (parseFloat(stat) * 100).toFixed(3) + ' %' : 'N/A';

  const measureOptions = [
    { label: dataset.measure0, value: 0 },
    { label: dataset.measure1, value: 1 },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMeasure = (value: number) => {
    setSelectedMeasure(value);
    handleMenuClose();
  };

  const handleFieldsMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFields(event.currentTarget);
  };

  const handleFieldsMenuClose = () => {
    setAnchorElFields(null);
  };

  const handleGeohashEdit = () => {
    setIsEditingGeohash(true);
    setGeohashInput(selectedGeohash.string || '');
  };

  const handleGeohashSubmit = () => {
    if (geohashInput.trim()) {
      dispatch(setSelectedGeohash(geohashInput.trim()));
      navigate(`?geohash=${geohashInput.trim()}`);
    }
    setIsEditingGeohash(false);
  };

  const handleGeohashCancel = () => {
    setIsEditingGeohash(false);
    setGeohashInput('');
  };

  const handleGeohashKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGeohashSubmit();
    } else if (event.key === 'Escape') {
      handleGeohashCancel();
    }
  };

  return (
    <Card sx={{ gap: 1, borderRadius: 2, boxShadow: 2 }}>
      {loadingExecuteQuery ? (
        <Box sx={{ p: 2 }}>
          <Loader />
        </Box>
      ) : (
        rectStats && (
          <>
            <CardHeader
              sx={{ backgroundColor: 'action.hover', pt: 2, pb: 1 }}
              title={
                <Typography variant="h6" component="div" textAlign="center">
                  Statistics for <i>{rectStats.count}</i> measurements
                </Typography>
              }
              subheader={
                activeRect === 'selectedGeohash' ? (
                  isEditingGeohash ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-evenly"
                      gap={1}
                    >
                      <TextField
                        size="small"
                        value={geohashInput}
                        onChange={e => setGeohashInput(e.target.value)}
                        onKeyDown={handleGeohashKeyPress}
                        onBlur={handleGeohashSubmit}
                        autoFocus
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            fontStyle: 'italic',
                            color: 'primary.main',
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleGeohashSubmit}
                        sx={{ color: 'primary.main' }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      component="div"
                      fontWeight={500}
                      textAlign="center"
                      sx={{
                        fontStyle: 'italic',
                        color: 'primary.main',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                      onClick={handleGeohashEdit}
                    >
                      GeoHash: {selectedGeohash.string}
                    </Typography>
                  )
                ) : activeRect === 'drawnRect' ? (
                  <Typography
                    variant="subtitle2"
                    component="div"
                    fontWeight={500}
                    textAlign="center"
                    sx={{
                      fontStyle: 'italic',
                      color: 'primary.main',
                    }}
                  >
                    {viewZone.id ? `Zone: ${viewZone.id}` : 'Drawn Rectangle'}
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle2"
                    component="div"
                    fontWeight={500}
                    textAlign="center"
                    sx={{
                      fontStyle: 'italic',
                      color: 'primary.main',
                    }}
                  >
                    {''}
                  </Typography>
                )
              }
            />
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2" fontWeight={500}>
                  Statistics for field:
                </Typography>
                <Button variant="text" onClick={handleMenuOpen}>
                  {measureOptions[selectedMeasure].label}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {measureOptions.map(opt => (
                    <MenuItem
                      key={opt.value}
                      selected={selectedMeasure === opt.value}
                      onClick={() => handleSelectMeasure(opt.value)}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Grid container spacing={1}>
                <Stat
                  label="Min"
                  value={formatStat(
                    rectStats[('min' + selectedMeasure) as keyof IRectStats],
                  )}
                />
                <Stat
                  label="Max"
                  value={formatStat(
                    rectStats[('max' + selectedMeasure) as keyof IRectStats],
                  )}
                />
                <Stat
                  label="Mean"
                  value={formatStat(
                    rectStats[('mean' + selectedMeasure) as keyof IRectStats],
                  )}
                />
                <Stat
                  label="SD"
                  value={formatStat(
                    rectStats[
                      ('standardDeviation' +
                        selectedMeasure) as keyof IRectStats
                    ],
                  )}
                />
                <Stat
                  label="Var"
                  value={formatStat(
                    rectStats[
                      ('variance' + selectedMeasure) as keyof IRectStats
                    ],
                  )}
                />
              </Grid>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2" fontWeight={500}>
                  Statistics between fields:
                </Typography>
                <Button variant="text" onClick={handleFieldsMenuOpen}>
                  {`${dataset.measure0} ~ ${dataset.measure1}`}
                </Button>
                <Menu
                  anchorEl={anchorElFields}
                  open={Boolean(anchorElFields)}
                  onClose={handleFieldsMenuClose}
                >
                  <MenuItem
                    disabled
                  >{`${dataset.measure0} ~ ${dataset.measure1}`}</MenuItem>
                </Menu>
              </Box>

              <Grid container justifyContent="center" spacing={1}>
                <Stat
                  label="Pearson Correlation"
                  value={formatStat(rectStats.pearsonCorrelation)}
                />
                <Stat
                  label="Covariance"
                  value={formatStat(rectStats.covariance)}
                />
              </Grid>
            </CardContent>
          </>
        )
      )}
    </Card>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Box p={2} textAlign="center">
    <Typography variant="subtitle1" fontWeight={600}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default Stats;
