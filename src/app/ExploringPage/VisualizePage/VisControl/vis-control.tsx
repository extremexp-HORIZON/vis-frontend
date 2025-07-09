import { useState } from 'react';
import _ from 'lodash';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/store';
import {
  setCategoricalFilters,
  setTimeRange,
  triggerDatasetUiUpdate,
} from '../../../../store/slices/exploring/datasetSlice';

export interface IVisControlProps {
  dataset: IDataset;
}

export const VisControl = ({ dataset }: IVisControlProps) => {
  const dispatch = useAppDispatch();
  const { categoricalFilters } = useAppSelector(
    (state: RootState) => state.dataset,
  );
  const { facets } = useAppSelector((state: RootState) => state.map);

  const [activeDate, setActiveDate] = useState(0);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleFilterChange = (dim: string, value: string | null) => {
    const newFilters = { ...categoricalFilters, [dim]: value || null };

    dispatch(setCategoricalFilters(newFilters));
    dispatch(triggerDatasetUiUpdate());
  };

  const removeFilter = (dim: string) => {
    const newFilters = _.omit(categoricalFilters, [dim]);

    dispatch(setCategoricalFilters(newFilters));
    dispatch(triggerDatasetUiUpdate());
  };

  const handleRangeListClick = (id: number) => {
    setActiveDate(id);
    const now = Date.now();
    const start = 30 * 24 * 60 * 60 * 1000;
    let t;

    switch (id) {
      case 1:
        t = { from: now - start, to: now };
        break;
      case 2:
        t = { from: now - start / 2, to: now };
        break;
      case 3:
        t = { from: now - start / 4, to: now };
        break;
      case 4:
        t = { from: now - start / 10, to: now };
        break;
      case 5:
        t = { from: now - start / 30, to: now };
        break;
      default:
        t = { from: dataset.timeMin!, to: now };
    }

    dispatch(setTimeRange(t));
    dispatch(triggerDatasetUiUpdate());
    setDateRange([null, null]);
  };

  const handleDateChange = (newValue: [Dayjs | null, Dayjs | null]) => {
    setDateRange(newValue);

    const [from, to] = newValue;

    if (from && to) {
      dispatch(setTimeRange({ from: from.valueOf(), to: to.valueOf() }));
      dispatch(triggerDatasetUiUpdate());
    }
  };

  const open = Boolean(anchorEl);
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      variant="outlined"
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      {/* Filters popover */}
      <Box
        display="flex"
        flexDirection="row"
        gap={1}
        justifyContent="space-evenly"
      >
        <Typography variant="subtitle1">Filtering</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          onClick={handleOpenPopover}
        >
          Select one or more filters
        </Button>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            {facets &&
              dataset.dimensions?.map((dim, i) =>
                facets[dim] ? (
                  <Accordion key={i} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">{dim}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {facets[dim].map(
                          (value: string | null, idx: number) => (
                            <Chip
                              key={idx}
                              label={value}
                              color={
                                value === categoricalFilters[dim]
                                  ? 'primary'
                                  : 'default'
                              }
                              variant={
                                value === categoricalFilters[dim]
                                  ? 'filled'
                                  : 'outlined'
                              }
                              onClick={() => handleFilterChange(dim, value)}
                              clickable
                            />
                          ),
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ) : null,
              )}
          </Box>
        </Popover>
      </Box>

      {/* Active filters */}
      {categoricalFilters && Object.keys(categoricalFilters).length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(categoricalFilters).map(([dim, value]) => (
            <Chip
              key={dim}
              label={`${dim}: ${value}`}
              onDelete={() => removeFilter(dim)}
              deleteIcon={<CloseIcon />}
              color="secondary"
              variant="filled"
            />
          ))}
        </Stack>
      )}

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Typography variant="subtitle1" textAlign="start">
          Time Range
        </Typography>
        {['All', '1M', '2W', '1W', '3D', '1D'].map((label, i) => (
          <Button
            key={i}
            size="small"
            variant={activeDate === i ? 'contained' : 'text'}
            onClick={() => handleRangeListClick(i)}
          >
            {label}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="space-evenly">
        <DatePicker
          label="Start date"
          value={dateRange[0]}
          onChange={newValue => handleDateChange([newValue, dateRange[1]])}
          minDate={dayjs(dataset.timeMin!)}
          maxDate={dayjs()}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <DatePicker
          label="End date"
          value={dateRange[1]}
          onChange={newValue => handleDateChange([dateRange[0], newValue])}
          minDate={dayjs(dataset.timeMin!)}
          maxDate={dayjs()}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
      </Stack>
    </Card>
  );
};
