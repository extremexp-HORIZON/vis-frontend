import { Box, Typography } from '@mui/material';
import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import FolderIcon from '@mui/icons-material/Folder';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import theme from '../../../../mui-theme';
import { useMemo } from 'react';
import { useAppDispatch } from '../../../../store/store';
import { setSelectedId, setSelectedItem } from '../../../../store/slices/workflowPageSlice';
import type { IDataAsset } from '../../../../shared/models/experiment/data-asset.model';
type Props = {
  taskId: string;
  datasets: IDataAsset[];
  experimentId?: string;
  workflowId?: string | number | null;
};

export default function DatasetsSection({ taskId, datasets, experimentId, workflowId }: Props) {
  const dispatch = useAppDispatch();

  const getDatasetIcon = (format?: string | null) => {
    if (!format || !format.trim()) return <InsertDriveFileRoundedIcon style={{ color: theme.palette.primary.main }} fontSize="small" />;
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

  const { inputGrouped, outputGrouped } = useMemo(() => {
    const input = datasets.filter(d => d.role === 'INPUT');
    const output = datasets.filter(d => d.role === 'OUTPUT');

    const group = (list: IDataAsset[]) =>
      list.reduce(
        (acc, ds) => {
          if (ds.folder) {
            if (!acc.folders[ds.folder]) acc.folders[ds.folder] = [];
            acc.folders[ds.folder].push(ds);
          } else {
            acc.noFolder.push(ds);
          }
          return acc;
        },
        { folders: {} as Record<string, IDataAsset[]>, noFolder: [] as IDataAsset[] }
      );

    return { inputGrouped: group(input), outputGrouped: group(output) };
  }, [datasets]);

  const renderFolderGroup = (kind: 'input' | 'output', folder: string, dsList: IDataAsset[], folderIndex: number) => (
    <TreeItem2
      key={`${kind}-folder-${taskId}-${folderIndex}`}
      itemId={`${kind}-folder-${taskId}-${folderIndex}`}
      slotProps={{ content: { style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }, onClick: (e) => e.stopPropagation() } }}
      label={
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, display: 'flex', alignItems: 'center', cursor: 'default' }}>
          <FolderIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="body2">{folder}</Typography>
        </Box>
      }
    >
      {dsList.map((ds, index) => (
        <TreeItem2
          key={`${kind}-${taskId}-${folder}-${index}`}
          itemId={`${kind}-ds-${taskId}-${folder}-${index}`}
          disabled={!ds.source}
          label={
            <Box
              onClick={() => {
                if (!ds.source) return;
                const itemId = `${kind}-ds-${taskId}-${folder}-${index}`;
                dispatch(setSelectedId(itemId));
                dispatch(setSelectedItem({ type: 'DATASET', data: { dataset: ds }, meta: { experimentId, workflowId } }));
              }}
              sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: 1, cursor: ds.source ? 'pointer' : 'default' }}
            >
              {getDatasetIcon(ds.format)}
              <Typography variant="body2" sx={{ ml: 1 }}>{ds.name}</Typography>
            </Box>
          }
        />
      ))}
    </TreeItem2>
  );

  const renderFlatList = (kind: 'input' | 'output', list: IDataAsset[]) =>
    list.map((ds, index) => (
      <TreeItem2
        key={`${kind}-${taskId}-nofolder-${index}`}
        itemId={`${kind}-ds-${taskId}-nofolder-${index}`}
        disabled={!ds.source}
        label={
          <Box
            onClick={() => {
              if (!ds.source) return;
              const itemId = `${kind}-ds-${taskId}-nofolder-${index}`;
              dispatch(setSelectedId(itemId));
              dispatch(setSelectedItem({ type: 'DATASET', data: { dataset: ds }, meta: { experimentId, workflowId } }));
            }}
            sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: 1, cursor: ds.source ? 'pointer' : 'default' }}
          >
            {getDatasetIcon(ds.format)}
            <Typography variant="body2" sx={{ ml: 1 }}>{ds.name}</Typography>
          </Box>
        }
      />
    ));

  return (
    <>
      {/* Inputs */}
      {datasets.some(d => d.role === 'INPUT') && (
        <TreeItem2
          itemId={`task-${taskId}-inputs`}
          slotProps={{ content: { style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }, onClick: (e) => e.stopPropagation() } }}
          label={
            <Box sx={{ px: 1, py: 0.5, borderRadius: 1, cursor: 'default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography>Inputs ({(datasets.filter(d => d.role === 'INPUT')).length})</Typography>
              </Box>
            </Box>
          }
        >
          {renderFlatList('input', inputGrouped.noFolder)}
          {Object.entries(inputGrouped.folders).map(([folder, dsList], i) => renderFolderGroup('input', folder, dsList, i))}
        </TreeItem2>
      )}

      {/* Outputs */}
      {datasets.some(d => d.role === 'OUTPUT') && (
        <TreeItem2
          itemId={`task-${taskId}-outputs`}
          slotProps={{ content: { style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }, onClick: (e) => e.stopPropagation() } }}
          label={
            <Box sx={{ px: 1, py: 0.5, borderRadius: 1, cursor: 'default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OutputIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography>Outputs ({(datasets.filter(d => d.role === 'OUTPUT')).length})</Typography>
              </Box>
            </Box>
          }
        >
          {renderFlatList('output', outputGrouped.noFolder)}
          {Object.entries(outputGrouped.folders).map(([folder, dsList], i) => renderFolderGroup('output', folder, dsList, i))}
        </TreeItem2>
      )}
    </>
  );
}
