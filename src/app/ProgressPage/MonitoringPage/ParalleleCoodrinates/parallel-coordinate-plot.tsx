import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useEffect, useMemo, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import DraggableColumns from './draggable-columns';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setParallel } from '../../../../store/slices/monitorPageSlice';
import ParallelCoordinateVega from './parallel-coordinate-vega-plot';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import InfoMessage from '../../../../shared/components/InfoMessage';
import type { IMetric } from '../../../../shared/models/experiment/metric.model';
import type { ParallelDataItem } from '../../../../shared/types/parallel.types';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, Tooltip } from '@mui/material';
import { SectionHeader } from '../../../../shared/components/responsive-card-table';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { GridTableRowsIcon } from '@mui/x-data-grid';
import PaletteIcon from '@mui/icons-material/Palette';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';

const ParallelCoordinatePlot = () => {
  const { workflows } =
    useAppSelector((state: RootState) => state.progressPage);
  const { parallel, workflowsTable } = useAppSelector((state: RootState) => state.monitorPage);
  const [parallelData, setParallelData] = useState<ParallelDataItem[]>([]);
  const foldArray = useRef<string[]>([]);
  const tooltipArray = useRef<{ [key: string]: string }[]>([]);
  const [ColoranchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null);
  const [ParamsanchorEl, setParamsAnchorEl] = useState<null | HTMLElement>(null);
  const selectedParams = parallel?.selectedParams ?? [];

  const dispatch = useAppDispatch();

  const handleColorOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => setColorAnchorEl(null);

  const colorOpen = Boolean(ColoranchorEl);

  const handleParamsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setParamsAnchorEl(event.currentTarget);
  };

  const handleParamsClose = () => setParamsAnchorEl(null);

  const paramsOpen = Boolean(ParamsanchorEl);

  useEffect(() => {
    if (workflows.data.length > 0) {
      const uniqueParameters = new Set(
        workflows.data.filter(workflow => workflow.status !== 'SCHEDULED')
          .reduce((acc: string[], workflow) => {
            const params = workflow.params;
            let paramNames = [];

            if (params) {
              paramNames = params.map(param => param.name);

              return [...acc, ...paramNames];
            } else {
              return [...acc];
            }
          }, [] as string[]),
      );

      const uniqueMetrics = new Set(
        workflows.data.filter(workflow => workflow.status !== 'SCHEDULED')
          .reduce((acc: string[], workflow) => {
            const metrics = workflow.metrics;
            let metricNames: string[] = [];

            if(metrics) {
              metricNames = metrics.map(metric => metric.name);

              return [...acc, ...metricNames];
            } else {
              return [...acc];
            }

          }, [] as string[])
      );

      const parameterKeys = Array.from(uniqueParameters);
      const metricKeys = Array.from(uniqueMetrics);

      const allAxes = [...parameterKeys, ...metricKeys];

      const data = workflows.data
        .map(workflow => {
          const params = workflow.params;

          return {
            ...Array.from(uniqueParameters).reduce((acc, variant) => {
              acc[variant] =
                params?.find(param => param.name === variant)?.value || '';

              return acc;
            }, {} as Record<string, string | number>),
            ...(workflow.metrics
              ? workflow.metrics?.reduce((acc, metric) => {
                return {
                  ...acc,
                  [metric.name]: metric.value,
                };
              }, {})
              : {}),
            workflowId: workflow.id,
          };
        });

      setParallelData(data);
      let selected = parallel.selected;
      let options = parallel.options;

      if (parallel.options.length === 0) {
        options = Array.from(
          new Set(
            workflows.data
              .filter(workflow => workflow.status !== 'SCHEDULED')
              .reduce((acc: string[], workflow) => {
                const metrics = workflow.metrics
                  ? workflow.metrics.filter(metric => metric.name !== 'rating').map((metric: IMetric) => metric.name)
                  : [];

                return [...acc, ...metrics];
              }, []),
          ),
        );
        selected = options[0];
      }

      foldArray.current = allAxes.filter(name => name !== selected).slice(0, 10);
      tooltipArray.current = Object.keys(parallelData.at(0) ?? {}).map(key => ({ field: key }));

      dispatch(
        setParallel({
          data,
          options,
          selected,
          selectedParams: foldArray.current
        }),
      );
    }
  }, [workflows.data]);

  const handleMetricSelection = (feature: string) => {
    const cleanedSelectedParams = (parallel.selectedParams ?? []).filter(
      (p) => p !== feature,
    );

    foldArray.current = cleanedSelectedParams;

    dispatch(
      setParallel({
        selected: feature,
        selectedParams: cleanedSelectedParams,
      }),
    );
  };

  const handleParamsSelesction = (params: string[]) => {
    const metricSet = new Set(parallel.options);

    const ordered = [
      ...params.filter((p) => !metricSet.has(p)),
      ...params.filter((p) => metricSet.has(p)),
    ];

    foldArray.current = ordered;
    dispatch(setParallel({ selectedParams: ordered }));
  };

  const processedData = useMemo(() => {
    const selectedSet = new Set<string>();
    const isGrouped = workflowsTable.groupBy.length > 0;

    workflowsTable.selectedWorkflows.forEach(id => {
      if (isGrouped) {
        const groupMembers = workflowsTable.grouppedWorkflows[id] || [];

        groupMembers.forEach(id => selectedSet.add(id));
      } else {
        selectedSet.add(id);
      }
    });

    return parallelData.map((item, index) => {
      const newItem = { ...item };

      for (const key in newItem) {
        if (Array.isArray(newItem[key])) {
          newItem[key] = newItem[key].join(',');
        }
      }

      newItem.selected = selectedSet.has(item.workflowId);

      return newItem;
    }) as (ParallelDataItem & { selected: boolean })[];
  }, [parallelData, workflowsTable.selectedWorkflows]);

  return (
    <Paper elevation={2} sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '10%' }}>
        <Typography/>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5 }}>
          <Tooltip title="Parameters">
            <IconButton onClick={handleParamsOpen}>
              <Grid3x3Icon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Color By">
            <IconButton onClick={handleColorOpen}>
              <PaletteIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Popover
          id='Parameters'
          open={paramsOpen}
          anchorEl={ParamsanchorEl}
          onClose={handleParamsClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 300,
              maxHeight: 250,
              overflow: 'hidden',
              padding: 0,
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
              border: '1px solid rgba(0,0,0,0.04)',
              mt: 1,
              '& .MuiList-root': {
                padding: 0,
              }
            },
          }}
        >
          <SectionHeader icon={<GridTableRowsIcon fontSize="small" />} title="Axes" />
          <List sx={{ width: '100%', py: 0, maxHeight: 200, overflow: 'auto' }}>
            {Array.from(new Set(parallelData.flatMap(item => Object.keys(item)).filter(k => !['workflowId', 'selected', 'rating'].includes(k))))
              .map(param => (
                <ListItem
                  key={param}
                  disablePadding
                  sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                >
                  <ListItemButton
                    dense
                    onClick={() => {
                      const isSelected = selectedParams.includes(param);

                      let updated: string[];

                      if (isSelected) {
                        if (selectedParams.length === 1) {
                          return;
                        }
                        updated = selectedParams.filter(paramName => paramName !== param);
                      } else {
                        updated = [...selectedParams, param];
                      }

                      handleParamsSelesction(updated);

                    }}
                    disabled={param === parallel.selected ||  (!selectedParams.includes(param) && selectedParams.length >= 10)}
                  >
                    <ListItemIcon>
                      {parallel.selectedParams?.includes(param) ? (
                        <CheckBoxIcon color="primary" fontSize="small" />
                      ) : (
                        <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={param}
                      primaryTypographyProps={{ fontSize: '0.95rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Popover>
        <Popover
          id='ColorBy'
          open={colorOpen}
          anchorEl={ColoranchorEl}
          onClose={handleColorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 300,
              maxHeight: 250,
              overflow: 'hidden',
              padding: 0,
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
              border: '1px solid rgba(0,0,0,0.04)',
              mt: 1,
              '& .MuiList-root': {
                padding: 0,
              }
            },
          }}
        >
          <SectionHeader icon={<GridTableRowsIcon fontSize="small" />} title="Color By" />
          <List sx={{ width: '100%', py: 0, maxHeight: 200, overflow: 'auto' }}>
            {parallel.options.map(feature => (
              <ListItem
                key={feature}
                disablePadding
                sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
              >
                <ListItemButton
                  dense
                  onClick={() => {
                    handleMetricSelection(feature);
                  }}
                >
                  <ListItemIcon>
                    {feature === parallel.selected ? (
                      <CheckBoxIcon color="primary" fontSize="small" />
                    ) : (
                      <CheckBoxOutlineBlankIcon fontSize="small" color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ fontSize: '0.95rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Popover>
      </Box>
      {
        parallel.options.length > 0 ? (
          <Box sx={{ width: '99%', px: 1, position: 'relative' }}>
            <DraggableColumns
              foldArray={foldArray}
              onOrderChange={() => {
                dispatch(setParallel({ ...parallel }));
              }}
              metricIds={parallel.options}
            />
            <ParallelCoordinateVega
              parallelData={parallelData}
              progressParallel={parallel}
              foldArray={foldArray}
              selectedWorkflows={workflowsTable.selectedWorkflows}
              processedData={processedData}
            ></ParallelCoordinateVega>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '90%' }}>
            <InfoMessage
              message="No Metric Data Available."
              type="info"
              icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
              fullHeight
            />
          </Box>
        )
      }
    </Paper>
  );
};

export default ParallelCoordinatePlot;
