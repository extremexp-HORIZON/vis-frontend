import { Typography, Breadcrumbs, Box } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useAppSelector } from '../../../store/store';
import { useEffect, useState } from 'react';
import ResponsiveCardTable from '../../../shared/components/responsive-card-table';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/material';
import type { IDataAsset } from '../../../shared/models/experiment/data-asset.model';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-scrollbarFiller': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeader[data-field="__check__"]': {
    backgroundColor: theme.palette.customGrey.main,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    whiteSpace: 'nowrap',
    overflow: 'visible',
  },
  '& .MuiDataGrid-main': {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  '& .MuiDataGrid-columnHeaders': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  '& .MuiDataGrid-virtualScroller': {
    flex: 1,
    overflow: 'auto',
  },
  '& .MuiDataGrid-footerContainer': {
    minHeight: '56px',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#ffffff',
  },
  '& .MuiTablePagination-root': {
    overflow: 'visible',
  },
  '&.MuiDataGrid-root': {
    borderRadius: '0 0 12px 12px',
    border: 'none',
    height: '100%',
  },
}));

type FileItem = {
  name: string;
  isFile: boolean;
  source?: string;
  data?: IDataAsset; // original item for file
  children?: Record<string, FileItem>;
};

interface IFileExplorer {
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
}

const FileExplorer = ({ selectedFile, setSelectedFile }: IFileExplorer) => {
  const tab = useAppSelector((state) => state.workflowPage.tab);
  const workflowId = 'IUwJDZcBpHPS2GeIyjFx';
  const [currentPath, setCurrentPath] = useState<string[]>([]); // array of folder names representing the path
  const [tree, setTree] = useState<FileItem>({ name: 'root', isFile: false, children: {} });
  // const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Build folder tree from catalog data
  useEffect(() => {
    const catalog = tab?.catalogAssets?.data || [];

    const root: FileItem = { name: 'root', isFile: false, children: {} };

    catalog.forEach((item: IDataAsset) => {
      const projectId = item?.tags?.projectId; // e.g. TestZenohExp/IEwJDZcBpHPS2GeIwzH6/IUwJDZcBpHPS2GeIyjFx/intermediate_datasets/Task1

      // We want only the part after project identifiers - to keep folder structure from intermediate_datasets down
      // So split and find the index of workflowId or experimentId to skip until there, then keep rest as folders
      if(!projectId) return;
      // Split by slash:
      const parts = projectId.split('/');
      // Find index of workflowId in parts
      const workflowIdx = parts.findIndex((p: string) => p === workflowId);

      // Take folders starting from after workflowId (e.g. intermediate_datasets/Task1)
      const folderParts = workflowIdx >= 0 ? parts.slice(workflowIdx + 1) : parts;

      // Insert into tree
      let currentNode = root;

      folderParts.forEach((folderName: string, idx: number) => {
        if (!currentNode.children) currentNode.children = {};

        if (idx === folderParts.length - 1) {
          // Last part, this is the folder containing the file

          // Add the file inside this folder
          if (!currentNode.children[folderName]) {
            currentNode.children[folderName] = { name: folderName, isFile: false, children: {} };
          }
          // Add file to this folder's children
          if (!currentNode.children[folderName].children) currentNode.children[folderName].children = {};

          currentNode.children[folderName].children![item.name] = {
            name: item.name,
            isFile: true,
            source: item.source,
            data: item,
          };
        } else {
          // Folder, drill down or create folder node
          if (!currentNode.children[folderName]) {
            currentNode.children[folderName] = { name: folderName, isFile: false, children: {} };
          }
          currentNode = currentNode.children[folderName];
        }
      });
    });

    setTree(root);
  }, [tab, workflowId]);

  // Get current folder node based on currentPath
  const getCurrentFolderNode = () => {
    let node = tree;

    for (const folder of currentPath) {
      if (!node.children || !node.children[folder]) return null;
      node = node.children[folder];
    }

    return node;
  };

  const currentFolder = getCurrentFolderNode();

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSelectedFile(null);
  };

  const handleFileClick = (file: string) => {
    setSelectedFile(file);
  };

  return (
    <ResponsiveCardTable
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            File Explorer
          <Breadcrumbs aria-label="breadcrumb" sx={{ cursor: 'pointer' }}>
            <Box
              component="span"
              onClick={() => {
                setCurrentPath([]);
                setSelectedFile(null);
              }}
              sx={{
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: currentPath.length === 0 ? 'text.primary' : '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                root
              </Typography>
            </Box>

            {currentPath.map((folder, idx) => (
              <Box
                key={folder}
                component="span"
                onClick={() => {
                  setCurrentPath(currentPath.slice(0, idx + 1));
                  setSelectedFile(null);
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: idx === currentPath.length - 1 ? 'text.primary' : '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  {folder}
                </Typography>
              </Box>
            ))}
          </Breadcrumbs>
        </Box>
      }
      showFullScreenButton={false}
      showOptionsButton={false}
      noPadding={true}
    >
      {currentFolder && (
        <StyledDataGrid
          rows={Object.values(currentFolder.children || {}).map((item, index) => ({
            id: index,
            name: item.name,
            type: item.isFile ? item?.data?.format ? item?.data?.format : '-' : 'Folder',
            role: item?.data?.role || '-',
            size: item?.data?.tags?.file_size ? `${Math.round(Number(item.data.tags.file_size) / 1024)} KB` : '-',
            created: item?.data?.tags?.created,
            isFile: item.isFile,
            raw: item,
          }))}
          columns={[
            {
              field: 'name',
              headerName: 'Name',
              flex: 1,
              minWidth: 200,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {params.row.isFile ? <InsertDriveFileIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
                  {params.row.name}
                </Box>
              ),
            },
            {
              field: 'type',
              headerName: 'Type',
              width: 200,
            },
            {
              field: 'role',
              headerName: 'Role',
              width: 200,
            },
            {
              field: 'size',
              headerName: 'Size',
              width: 200
            },
            {
              field: 'createdAt',
              headerName: 'Created',
              width: 200,
              renderCell: (params) => {
                const raw = params.row.created;

                if (!raw) return '-';
                const safe = raw.replace(/\.\d+$/, '');

                return new Date(safe).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              },
            },
          ]}
          disableColumnMenu
          disableRowSelectionOnClick
          hideFooter
          onRowClick={(params) => {
            const item = params.row.raw as FileItem;

            item.isFile ? handleFileClick(item.name) : handleFolderClick(item.name);
          }}
          getRowClassName={(params) =>
            params.row.name === selectedFile ? 'Mui-selected' : ''
          }
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              cursor: 'pointer'
            },
            '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(224, 224, 224, 0.4)',
            },
          }}
        />

      )}
    </ResponsiveCardTable>
  );
};

export default FileExplorer;
