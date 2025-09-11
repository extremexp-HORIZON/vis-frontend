import {
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  BubbleChart as BubbleChartIcon,
  GridOn as GridOnIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
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
import { Zones } from '../Zones/zones';

export interface IChartProps {
  dataset: IDataset;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Chart = React.memo((props: IChartProps) => {
  const { dataset, isFullscreen = false, onToggleFullscreen } = props;
  const dimensions = dataset.dimensions || [];
  const { series } = useAppSelector((state: RootState) => state.stats);
  const { aggType, chartType, measureCol, groupByCols } = useAppSelector(
    (state: RootState) => state.chart,
  );
  const {
    loading: { executeQuery: loadingExecuteQuery },
  } = useAppSelector((state: RootState) => state.dataset);
  const dispatch = useAppDispatch();

  // State for viewport dimensions
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update viewport dimensions on resize with throttling
  useEffect(() => {
    // Only track viewport changes when in fullscreen mode
    if (!isFullscreen) return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Throttle resize events to prevent excessive re-renders
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100); // 100ms throttle
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

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

  let vegaSeriesData: Record<string, unknown>[] = [];

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

  const getVegaMarkType = (
    chartType: string,
  ): { type: 'bar' | 'line' | 'area' | 'rect'; point?: boolean } => {
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

  // Calculate viewport-based dimensions with memoization
  const chartDimensions = React.useMemo(() => {
    if (isFullscreen) {
      return {
        minWidth: Math.floor(viewportDimensions.width * 0.6), // 60vw
        minHeight: Math.floor(viewportDimensions.height * 0.4), // 40vh
        maxHeight: Math.floor(viewportDimensions.height * 0.6), // 60vh
      };
    }

    return {
      minWidth: 100,
      minHeight: 100,
      maxHeight: 300,
    };
  }, [isFullscreen, viewportDimensions.width, viewportDimensions.height]);

  const spec: VisualizationSpec = {
    mark: getVegaMarkType(chartType),
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
        ...(isFullscreen && {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999,
          borderRadius: 0,
          height: '80vh',
          width: '80vw',
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      {loadingExecuteQuery ? (
        <Loader />
      ) : (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1}>
              {onToggleFullscreen && (
                <Tooltip
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  placement="top"
                >
                  <IconButton color="default" onClick={onToggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
              )}
              <Zones dataset={dataset} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Bar Chart" placement="top">
                <IconButton
                  color={chartType === 'column' ? 'primary' : 'default'}
                  onClick={() => handleChartTypeChange('column')}
                >
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Line Chart" placement="top">
                <IconButton
                  color={chartType === 'line' ? 'primary' : 'default'}
                  onClick={() => handleChartTypeChange('line')}
                >
                  <ShowChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Area Chart" placement="top">
                <IconButton
                  color={chartType === 'area' ? 'primary' : 'default'}
                  onClick={() => handleChartTypeChange('area')}
                >
                  <BubbleChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Heatmap" placement="top">
                <IconButton
                  color={chartType === 'heatmap' ? 'primary' : 'default'}
                  onClick={() => handleChartTypeChange('heatmap')}
                >
                  <GridOnIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {vegaSeriesData.length > 0 && (
            <Box sx={{ flex: 1, minHeight: isFullscreen ? '60vh' : 'auto' }}>
              <ResponsiveVegaLite
                minWidth={chartDimensions.minWidth}
                minHeight={chartDimensions.minHeight}
                maxHeight={chartDimensions.maxHeight}
                aspectRatio={isFullscreen ? 16 / 9 : 1 / 0.5}
                actions={false}
                spec={spec}
              />
            </Box>
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
});
