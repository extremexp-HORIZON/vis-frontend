import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useEffect, useMemo, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DraggableColumns from './draggable-columns';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { setParallel } from '../../../../store/slices/monitorPageSlice';
import ParallelCoordinateVega from './parallel-coordinate-vega-plot';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import InfoMessage from '../../../../shared/components/InfoMessage';
import type { IMetric } from '../../../../shared/models/experiment/metric.model';
import type { ParallelDataItem } from '../../../../shared/types/parallel.types';

const ParallelCoordinatePlot = () => {
  const { workflows } =
    useAppSelector((state: RootState) => state.progressPage);
  const { parallel, workflowsTable } = useAppSelector((state: RootState) => state.monitorPage);
  const [parallelData, setParallelData] = useState<ParallelDataItem[]>([]);
  const foldArray = useRef<string[]>([]);
  const tooltipArray = useRef<{ [key: string]: string }[]>([]);

  const dispatch = useAppDispatch();

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

      foldArray.current = Array.from(uniqueParameters);
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
      tooltipArray.current = Object.keys(parallelData.at(0) ?? {}).map(key => ({ field: key }));
      dispatch(
        setParallel({
          data,
          options,
          selected,
        }),
      );
    }
  }, [workflows.data]);

  const handleMetricSelection = (event: SelectChangeEvent) => {
    dispatch(setParallel({ selected: event.target.value as string }));
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography/>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5 }}>
          <Typography fontSize={'0.8rem'}>Color by:</Typography>
          <FormControl
            sx={{ m: 1, minWidth: 120, maxHeight: 120 }}
            size="small"
          >
            <Select
              value={parallel.selected}
              sx={{ fontSize: '0.8rem' }}
              onChange={handleMetricSelection}
              disabled={parallel.options.length === 0}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250,
                    maxWidth: 300,
                  },
                },
              }}
            >
              {parallel.options.map(feature => (
                <MenuItem key={`${feature}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {
        parallel.options.length > 0 ? (
          <Box sx={{ width: '99%', px: 1, position: 'relative' }}>
            <DraggableColumns
              foldArray={foldArray}
              onOrderChange={() => {
                dispatch(setParallel({ ...parallel }));
              }}
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
          <Box sx={{ width: '100%', px: 1 }}>
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
