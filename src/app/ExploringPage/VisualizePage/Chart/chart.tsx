import {
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  BubbleChart as BubbleChartIcon,
  GridOn as GridOnIcon,
} from '@mui/icons-material';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Popover,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import React from 'react';
import type { VisualizationSpec } from 'react-vega';
import ResponsiveVegaLite from '../../../../shared/components/responsive-vegalite';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { IDataset } from '../../../../shared/models/exploring/dataset.model';
import { AggregateFunctionType } from '../../../../shared/models/exploring/enum/aggregate-function-type.model';
import {
  setAggType,
  setChartType,
  setGroupByCols,
  setMeasureCol,
  triggerChartUpdate,
} from '../../../../store/slices/exploring/chartSlice';
import Loader from '../../../../shared/components/loader';

export interface IChartProps {
  dataset: IDataset;
}

export const Chart = (props: IChartProps) => {
  const { dataset } = props;
  const dimensions = dataset.dimensions || [];
  const { series } = useAppSelector((state: RootState) => state.stats);
  const { aggType, chartType, measureCol, groupByCols } = useAppSelector(
    (state: RootState) => state.chart,
  );
  const {
    loading: { executeQuery: loadingExecuteQuery },
  } = useAppSelector((state: RootState) => state.dataset);
  const dispatch = useAppDispatch();
  const xAxisOptions = dimensions.map(dim => ({
    key: dim,
    value: dim,
    text: dim,
  }));

  const aggTypeOptions = Object.values(AggregateFunctionType).map(
    (type, index) => ({
      key: `agg-type-${index}`,
      value: type,
      text: type,
    }),
  );

  let vegaSeriesData: Record<string, any>[] = [];

  if (chartType === 'heatmap') {
    vegaSeriesData = series?.map(groupedStat => ({
      x: groupedStat.group?.[0] ?? '',
      y: groupedStat.group?.[1] ?? '',
      value: groupedStat.value ?? 0,
    }));
  } else {
    vegaSeriesData = series?.map(s => ({
      category: s.group?.[0] ?? '',
      series: s.group?.[1] ?? '',
      value: s.value ?? 0,
    }));
  }

  const [popoverAnchor, setPopoverAnchor] = React.useState<null | HTMLElement>(
    null,
  );
  const [popoverText, setPopoverText] = React.useState<string>('');

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    text: string,
  ) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverText(text);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverText('');
  };

  const handleChartTypeChange = (type: string) => {
    if (type !== chartType) {
      if (type === 'heatmap') {
        const secondDim = dimensions.find(d => d !== groupByCols[0]);

        dispatch(setGroupByCols([groupByCols[0], secondDim!]));
      } else if (chartType === 'heatmap') {
        dispatch(setGroupByCols([groupByCols[0]]));
      }
      dispatch(setChartType(type));
      dispatch(triggerChartUpdate());
    }
  };

  const getVegaMarkType = (chartType: string) => {
    switch (chartType) {
      case 'column':
        return { type: 'bar' };
      case 'line':
        return { type: 'line', point: true };
      case 'area':
        return { type: 'area', point: true };
      case 'heatmap':
        return { type: 'rect' };
      default:
        return { type: 'bar' };
    }
  };

  const xAxis =
    groupByCols && groupByCols.length > 0
      ? dataset.dimensions?.find(d => d === groupByCols[0])
      : dataset.dimensions?.find(d => d === xAxisOptions[0].key);
  const yAxis =
    groupByCols && groupByCols.length > 1
      ? dataset.dimensions?.find(d => d === groupByCols[1])
      : dataset.dimensions?.find(d => d === xAxisOptions[1]?.key);

  const measure =
    dataset.measure0 == null
      ? null
      : dataset.measure0 === measureCol
        ? dataset.measure0
        : dataset.measure1;

  const spec: VisualizationSpec = {
    mark: getVegaMarkType(chartType) as any, // Type assertion to fix type error
    encoding:
      chartType === 'heatmap'
        ? {
          x: { field: 'x', type: 'nominal', title: xAxis },
          y: { field: 'y', type: 'nominal', title: yAxis },
          color: { field: 'value', type: 'quantitative' },
          tooltip: { field: 'value', type: 'quantitative' },
        }
        : {
          x: {
            field: 'category',
            type: 'nominal',
            title: xAxis,
            sort: { field: 'value', order: 'ascending' },
          },
          y: {
            field: 'value',
            type: 'quantitative',
            title: `${aggType}${aggType === AggregateFunctionType.COUNT ? '' : `(${measure})`}`,
          },
          tooltip: { field: 'value', type: 'quantitative' },
        },
    data: {
      values: vegaSeriesData,
    },
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'grey.300',
        boxShadow: 2,
        borderRadius: 2,
        p: 3,
        bgcolor: 'white',
      }}
    >
      {loadingExecuteQuery ? (
        <Loader />
      ) : (
        <>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mb={2}>
            <IconButton
              color={chartType === 'column' ? 'primary' : 'default'}
              onClick={e => {
                handleChartTypeChange('column');
                handlePopoverOpen(e, 'Bar Chart');
              }}
              onMouseLeave={handlePopoverClose}
            >
              <BarChartIcon />
            </IconButton>
            <IconButton
              color={chartType === 'line' ? 'primary' : 'default'}
              onClick={e => {
                handleChartTypeChange('line');
                handlePopoverOpen(e, 'Line Chart');
              }}
              onMouseLeave={handlePopoverClose}
            >
              <ShowChartIcon />
            </IconButton>
            <IconButton
              color={chartType === 'area' ? 'primary' : 'default'}
              onClick={e => {
                handleChartTypeChange('area');
                handlePopoverOpen(e, 'Area Chart');
              }}
              onMouseLeave={handlePopoverClose}
            >
              <BubbleChartIcon />
            </IconButton>
            <IconButton
              color={chartType === 'heatmap' ? 'primary' : 'default'}
              onClick={e => {
                handleChartTypeChange('heatmap');
                handlePopoverOpen(e, 'Heatmap');
              }}
              onMouseLeave={handlePopoverClose}
            >
              <GridOnIcon />
            </IconButton>
            <Popover
              open={Boolean(popoverAnchor)}
              anchorEl={popoverAnchor}
              onClose={handlePopoverClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              disableRestoreFocus
            >
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">{popoverText}</Typography>
              </Box>
            </Popover>
          </Stack>

          {vegaSeriesData.length > 0 && (
            <ResponsiveVegaLite
              minWidth={100}
              minHeight={100}
              aspectRatio={1 / 0.75}
              actions={false}
              spec={spec}
            />
          )}

          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            mt={3}
          >
            {dataset.measure0 && (
              <>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Find
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    labelId="agg-type-label"
                    value={aggType}
                    label="Aggregate"
                    onChange={e => {
                      dispatch(
                        setAggType(e.target.value as AggregateFunctionType),
                      );
                      dispatch(triggerChartUpdate());
                    }}
                    variant="standard"
                  >
                    {aggTypeOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {dataset.measure0 && aggType !== AggregateFunctionType.COUNT && (
              <>
                <Typography variant="caption" sx={{ mx: 1 }}>
                  of
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    labelId="measure-label"
                    value={measure!}
                    label="Measure"
                    onChange={e => {
                      dispatch(setMeasureCol(e.target.value));
                      dispatch(triggerChartUpdate());
                    }}
                    variant="standard"
                  >
                    {[dataset.measure0, dataset.measure1].map(m => (
                      <MenuItem key={m} value={m!}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <Typography variant="caption" sx={{ mx: 1 }}>
              per
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                labelId="xaxis-label"
                value={xAxis || ''}
                label="X axis"
                onChange={e => {
                  dispatch(setGroupByCols([e.target.value]));
                  dispatch(triggerChartUpdate());
                }}
                variant="standard"
              >
                {xAxisOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {chartType === 'heatmap' && (
              <>
                <Typography variant="caption" sx={{ mx: 1 }}>
                  and
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    labelId="yaxis-label"
                    value={yAxis || ''}
                    label="Y axis"
                    onChange={e => {
                      dispatch(setGroupByCols([xAxis!, e.target.value]));
                      dispatch(triggerChartUpdate());
                    }}
                    variant="standard"
                  >
                    {xAxisOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
};
