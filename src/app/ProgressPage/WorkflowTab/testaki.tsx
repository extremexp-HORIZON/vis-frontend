import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAppSelector } from '../../../store/store';
import DataExplorationComponent from '../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent';
import {
  DetailsCardItem
} from '../../../shared/components/details-card';
import { useState } from 'react';
import ClosableCardTable from '../../../shared/components/closable-card-table';
import Dialog from '@mui/material/Dialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';

const DataAssetMetadata = ({ dataset, onClose }: {dataset: IDataAsset | undefined; onClose: () => void;}) => (
  <ClosableCardTable title={'Data asset Metadata'} children={
    <>
      <DetailsCardItem label="Name" value={dataset?.name} />
      <DetailsCardItem label="Format" value={dataset?.format} />
      <DetailsCardItem label="Role" value={dataset?.role} />
      <DetailsCardItem label="Source" value={dataset?.source} />
      <DetailsCardItem label="Type" value={dataset?.sourceType} />
      <DetailsCardItem label="Task" value={dataset?.task} />
    </>

  } onClose={onClose}
  >

  </ClosableCardTable>
);



const Testaki = () => {
  const { tab } = useAppSelector((state) => state.workflowPage);
  const selectedItem = tab?.dataTaskTable?.selectedItem || null;
  const { dataset } = selectedItem?.data || {};
  const source = selectedItem?.data?.dataset?.source || '';
  const isDirectory = !source.includes('.') || source.endsWith('/');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const handleOpenMetadataDialog = () => setMetadataDialogOpen(true);
  const handleCloseMetadataDialog = () => setMetadataDialogOpen(false);
  console.log('selectedItem', selectedItem?.data.dataset?.source);

  return (
    <Box overflow={'hidden'} sx={{ height: '99%' }}>
      {isDirectory && (
        <Box>
          {/* Render something for directories here */}
          <p>This is a directory. Maybe show directory listing or nested files.</p>
        </Box>
      )}
      {/* Preview Panel */}
      <ResponsiveCardTable
        title={
          <Box display='flex' alignItems="center" justifyContent="space-between">
            {`Preview ${selectedFile || ''}`}
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
  );
};

export default Testaki;
