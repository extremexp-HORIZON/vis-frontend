import { Box, Typography } from '@mui/material';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import BarChartIcon from '@mui/icons-material/BarChart';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import FolderIcon from '@mui/icons-material/Folder';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import theme from '../../../../mui-theme';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import type { RootState } from '../../../../store/store';
import { setSelectedId, setSelectedItem } from '../../../../store/slices/workflowPageSlice';

export default function NullTaskFallback() {
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();
  const { tab } = useAppSelector((s: RootState) => s.workflowPage);
  const workflowId = tab?.workflowId;

  const { fallbackParams, fallbackMetrics, fallbackInputGrouped, fallbackOutputGrouped } = useMemo(() => {
    const nullTask = (v: { task?: string | null }) => v.task == null;
    const params = tab?.workflowConfiguration.params?.filter(nullTask) ?? [];
    const datasets = tab?.workflowConfiguration.dataAssets?.filter(nullTask) ?? [];
    const metrics = tab?.workflowMetrics.data?.filter(m => nullTask(m) && m.name !== 'rating') ?? [];

    const group = (list: typeof datasets) =>
      list.reduce(
        (acc, ds) => {
          if (ds.folder) {
            if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
            acc.folders[ds.folder].push(ds);
          } else acc.noFolder.push(ds);

          return acc;
        },
        { folders: {} as Record<string, typeof datasets>, noFolder: [] as typeof datasets }
      );

    return {
      fallbackParams: params,
      fallbackMetrics: metrics,
      fallbackInputGrouped: group(datasets.filter(d => d.role === 'INPUT')),
      fallbackOutputGrouped: group(datasets.filter(d => d.role === 'OUTPUT')),
    };
  }, [tab]);

  const getDatasetIcon = (format?: string | null) => {
    if (!format || !format.trim()) {
      return <InsertDriveFileRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
    }
    switch (format.toLowerCase()) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return <TableChartRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
      case 'json':
      case 'yaml':
        return <DataObjectRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'image':
        return <ImageRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
      default:
        return <InsertDriveFileRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
    }
  };

  if (
    fallbackParams.length === 0 &&
    fallbackMetrics.length === 0 &&
    fallbackInputGrouped.noFolder.length === 0 &&
    Object.keys(fallbackInputGrouped.folders).length === 0 &&
    fallbackOutputGrouped.noFolder.length === 0 &&
    Object.keys(fallbackOutputGrouped.folders).length === 0
  )
    return null;

  return (
    <>
      {/* Parameters */}
      <TreeItem2
        itemId={'parameters-header'}
        slotProps={{ content: { style: { pointerEvents: 'none', backgroundColor: 'transparent' } } }}
        label={
          <Box sx={{ px: 1, py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Parameters
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>
                ({fallbackParams.length})
              </Typography>
            </Box>
          </Box>
        }
      />
      {fallbackParams.map((param, index) => (
        <TreeItem2
          key={`null-param-${index}`}
          itemId={`null-param-${index}`}
          label={
            <Box
              onClick={() => {
                dispatch(setSelectedId(`null-param-${index}`));
                dispatch(setSelectedItem({ type: 'param', data: { param } }));
              }}
              sx={{ px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Grid3x3Icon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  {param.name}: {String(param.value)}
                </Typography>
              </Box>
            </Box>
          }
        />
      ))}

      {/* Metrics */}
      <TreeItem2
        itemId={'metrics-header'}
        slotProps={{ content: { style: { pointerEvents: 'none', backgroundColor: 'transparent' } } }}
        label={
          <Box sx={{ px: 1, py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Metrics
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>
                ({fallbackMetrics.length})
              </Typography>
            </Box>
          </Box>
        }
      />
      {fallbackMetrics.map((metric, index) => (
        <TreeItem2
          key={`null-metric-${index}`}
          itemId={`null-metric-${index}`}
          label={
            <Box
              onClick={() => {
                dispatch(setSelectedId(`null-metric-${index}`));
                dispatch(setSelectedItem({ type: 'metric', data: { metric } }));
              }}
              sx={{ px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  {metric.name}: {Math.round(metric.value * 100) / 100}
                </Typography>
              </Box>
            </Box>
          }
        />
      ))}

      {/* Inputs */}
      {(fallbackInputGrouped.noFolder.length > 0 ||
        Object.keys(fallbackInputGrouped.folders).length > 0) && (
        <TreeItem2
          itemId="task-null-inputs"
          slotProps={{ content: { style: { padding: 0 }, onClick: (e) => e.stopPropagation() } }}
          label={
            <Box sx={{ px: 1, py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">Inputs</Typography>
              </Box>
            </Box>
          }
        >
          {fallbackInputGrouped.noFolder.map((ds, index) => (
            <TreeItem2
              key={`null-input-${index}`}
              itemId={`null-input-${index}`}
              disabled={!ds.source}
              label={
                <Box
                  onClick={() => {
                    if (!ds.source) return;
                    dispatch(setSelectedId(`null-input-${index}`));
                    dispatch(
                      setSelectedItem({
                        type: 'DATASET',
                        data: { dataset: ds },
                        meta: { experimentId, workflowId },
                      })
                    );
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: ds.source ? 'pointer' : 'default',
                  }}
                >
                  {getDatasetIcon(ds.format)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {ds.name}
                  </Typography>
                </Box>
              }
            />
          ))}
          {Object.entries(fallbackInputGrouped.folders).map(([folder, dsList], folderIndex) => (
            <TreeItem2
              key={`input-folder-${folderIndex}`}
              itemId={`input-folder-${folderIndex}`}
              slotProps={{ content: { style: { padding: 0 }, onClick: (e) => e.stopPropagation() } }}
              label={
                <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center' }}>
                  <FolderIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">{folder}</Typography>
                </Box>
              }
            >
              {dsList.map((ds, index) => (
                <TreeItem2
                  key={`null-input-${folder}-${index}`}
                  itemId={`null-input-${folder}-${index}`}
                  disabled={!ds.source}
                  label={
                    <Box
                      onClick={() => {
                        if (!ds.source) return;
                        dispatch(setSelectedId(`null-input-${folder}-${index}`));
                        dispatch(
                          setSelectedItem({
                            type: 'DATASET',
                            data: { dataset: ds },
                            meta: { experimentId, workflowId },
                          })
                        );
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: ds.source ? 'pointer' : 'default',
                      }}
                    >
                      {getDatasetIcon(ds.format)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {ds.name}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </TreeItem2>
          ))}
        </TreeItem2>
      )}

      {/* Outputs */}
      {(fallbackOutputGrouped.noFolder.length > 0 ||
        Object.keys(fallbackOutputGrouped.folders).length > 0) && (
        <TreeItem2
          itemId="task-null-outputs"
          slotProps={{ content: { style: { padding: 0 }, onClick: (e) => e.stopPropagation() } }}
          label={
            <Box sx={{ px: 1, py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OutputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">Outputs</Typography>
              </Box>
            </Box>
          }
        >
          {fallbackOutputGrouped.noFolder.map((ds, index) => (
            <TreeItem2
              key={`null-output-${index}`}
              itemId={`null-output-${index}`}
              disabled={!ds.source}
              label={
                <Box
                  onClick={() => {
                    if (!ds.source) return;
                    dispatch(setSelectedId(`null-output-${index}`));
                    dispatch(
                      setSelectedItem({
                        type: 'DATASET',
                        data: { dataset: ds },
                        meta: { experimentId, workflowId },
                      })
                    );
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: ds.source ? 'pointer' : 'default',
                  }}
                >
                  {getDatasetIcon(ds.format)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {ds.name}
                  </Typography>
                </Box>
              }
            />
          ))}
          {Object.entries(fallbackOutputGrouped.folders).map(([folder, dsList], folderIndex) => (
            <TreeItem2
              key={`output-folder-${folderIndex}`}
              itemId={`output-folder-${folderIndex}`}
              slotProps={{ content: { style: { padding: 0 }, onClick: (e) => e.stopPropagation() } }}
              label={
                <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center' }}>
                  <FolderIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">{folder}</Typography>
                </Box>
              }
            >
              {dsList.map((ds, index) => (
                <TreeItem2
                  key={`null-output-${folder}-${index}`}
                  itemId={`null-output-${folder}-${index}`}
                  disabled={!ds.source}
                  label={
                    <Box
                      onClick={() => {
                        if (!ds.source) return;
                        dispatch(setSelectedId(`null-output-${folder}-${index}`));
                        dispatch(
                          setSelectedItem({
                            type: 'DATASET',
                            data: { dataset: ds },
                            meta: { experimentId, workflowId },
                          })
                        );
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: ds.source ? 'pointer' : 'default',
                      }}
                    >
                      {getDatasetIcon(ds.format)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {ds.name}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </TreeItem2>
          ))}
        </TreeItem2>
      )}
    </>
  );
}
