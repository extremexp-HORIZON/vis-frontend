import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse
} from '@mui/material';
import { useAppSelector } from '../../../store/store';
import DataExplorationComponent from '../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent';
import {
  DetailsCard,
  DetailsCardItem
} from '../../../shared/components/details-card';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import InfoMessage from '../../../shared/components/InfoMessage';
import ClosableCardTable from '../../../shared/components/closable-card-table';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';

const DataAssetMetadata = ({ dataset, onClose }) => (
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

// Example dataset as a tree
const treeData = [
  {
    name: 'root',
    type: 'folder',
    children: [
      {
        name: 'data.csv',
        size: '2MB',
        type: 'file'
      },
      {
        name: 'image.png',
        size: '500KB',
        type: 'file'
      },
      {
        name: 'subfolder',
        type: 'folder',
        children: [
          {
            name: 'nestedfile.txt',
            size: '1KB',
            type: 'file'
          },
          {
            name: 'deepfolder',
            type: 'folder',
            children: [
              {
                name: 'deepfile.docx',
                size: '20KB',
                type: 'file'
              }
            ]
          }
        ]
      }
    ]
  }
];

// Recursive tree item renderer
const TreeItem = ({
  node,
  level = 0,
  onSelect,
  selectedFile
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (node.type === 'folder') {
      setOpen(!open);
    } else {
      onSelect(node.name);
    }
  };

  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        selected={selectedFile === node.name}
        sx={{ pl: 2 + level * 2 }}
      >
        <ListItemIcon>
          {node.type === 'folder' ? (
            <FolderIcon color="primary" />
          ) : (
            <InsertDriveFileIcon color="action" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={node.name}
          secondary={node.size || ''}
        />
        {node.type === 'folder' ? (
          open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )
        ) : (
          <IconButton edge="end">
            <DownloadIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
      {node.type === 'folder' && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {node.children?.map((child) => (
              <TreeItem
                key={child.name}
                node={child}
                level={level + 1}
                onSelect={onSelect}
                selectedFile={selectedFile}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const Testaki = () => {
  const { tab } = useAppSelector((state) => state.workflowPage);
  const selectedItem = tab?.dataTaskTable?.selectedItem || null;
  const { dataset } = selectedItem?.data || {};
  const isDirectory = false;
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(true); // Added

  const handleCloseMetadata = () => setShowMetadata(false);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const handleOpenMetadataDialog = () => setMetadataDialogOpen(true);
  const handleCloseMetadataDialog = () => setMetadataDialogOpen(false);

  return (
    <Box overflow={'hidden'} sx={{ height: '99%' }}>
      {/* Preview Panel */}
      <ResponsiveCardTable
        title={
          <Box display='flex' alignItems="center" justifyContent="space-between" overflow={'hidden'}>
            {`Preview ${selectedFile || ''}`}
            <IconButton
              size="small"
              onClick={handleOpenMetadataDialog}
              sx={{ ml: 1 }}
            >
              <VisibilityIcon  />
            </IconButton>
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
  );
};

export default Testaki;
