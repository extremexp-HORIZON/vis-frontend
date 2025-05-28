import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import DataExplorationComponent from '../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent';
import {
  DetailsCardItem
} from '../../../shared/components/details-card';
import { useEffect, useState } from 'react';
import ClosableCardTable from '../../../shared/components/closable-card-table';
import Dialog from '@mui/material/Dialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';
import LeftPanel from '../../Tasks/DataExplorationTask/ComponentContainer/data-exploration-left-panel';
import { fetchCatalogAssets } from '../../../store/slices/workflowPageSlice';
import FileExplorer from './fileexplorer';

const DataAssetMetadata = ({ dataset, onClose }: {dataset: IDataAsset | undefined; onClose: () => void;}) => {

  const getDate = (date: string | undefined) => {
    if(!date) return '-';
    const safe = date.replace(/\.\d+$/, '');

    return new Date(safe).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ClosableCardTable title={'Data asset Metadata'} children={
      <>
        <DetailsCardItem label="Name" value={dataset?.name ?? '-'} />
        <DetailsCardItem label="Format" value={dataset?.format ?? '-'} />
        <DetailsCardItem label="Role" value={dataset?.role ?? '-'} />
        <DetailsCardItem label="Source" value={dataset?.source ?? '-'} />
        <DetailsCardItem label="Type" value={dataset?.sourceType ?? '-'} />
        <DetailsCardItem label="Task" value={dataset?.task} />
        <DetailsCardItem label="Size" value={ dataset?.tags?.file_size ? `${Math.round(Number(dataset.tags.file_size) / 1024)} KB` : '-'} />
        <DetailsCardItem label="Created" value={getDate(dataset?.tags?.created)} />
      </>

    } onClose={onClose}
    >

    </ClosableCardTable>
  );
};

const Testaki = () => {
  const { tab } = useAppSelector((state) => state.workflowPage);
  const selectedItem = tab?.dataTaskTable?.selectedItem || null;
  const { dataset } = selectedItem?.data || {};
  const isDirectory = true;
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const handleOpenMetadataDialog = () => setMetadataDialogOpen(true);
  const handleCloseMetadataDialog = () => setMetadataDialogOpen(false);
  const dispatch = useAppDispatch();

  const experimentId = 'IEwJDZcBpHPS2GeIwzH6';
  const workflowId = 'IUwJDZcBpHPS2GeIyjFx';

  useEffect(() => {
    // Dispatch the thunk to fetch catalog assets
    dispatch(fetchCatalogAssets({ project_id: `${experimentId}/${workflowId}`, page: '1', perPage: '10', sort: 'created,desc' }));
  }, [dispatch]);

  return (
    <Box sx={{ height: '99%' }}>
      {isDirectory && (
        <Box sx={{ pb: 1, height: '39%', minHeight: '250px' }}>
          <FileExplorer
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </Box>
      )}
      {(!isDirectory || selectedFile) &&
        <Box sx={{ height: '60%', minHeight: '450px' }}>
          <ResponsiveCardTable
            title={
              <Box display='flex' alignItems="center" justifyContent="space-between">
                {`Preview ${dataset?.name || ''}`}
                <Tooltip title="File Metadata">
                  <IconButton
                    size="small"
                    onClick={handleOpenMetadataDialog}
                    sx={{ ml: 1 }}
                  >
                    <VisibilityIcon  />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            showFullScreenButton={false}
            showOptionsButton={false}
            showControlsInHeader={true}
            controlPanel={
              <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1, height: '100%', overflow: 'auto' }}>
                <LeftPanel />
              </Box>
            }
          >
            <DataExplorationComponent />
          </ResponsiveCardTable>
          <Dialog
            open={metadataDialogOpen}
            onClose={handleCloseMetadataDialog}
            maxWidth="sm"
            fullWidth
          >

            <Box>
              <DataAssetMetadata dataset={dataset} onClose={handleCloseMetadataDialog} />
            </Box>
          </Dialog>
        </Box>
      }
    </Box>
  );
};

export default Testaki;
