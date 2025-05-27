// import { Typography } from "@mui/material";
// import { DetailsCard } from "../../../shared/components/details-card";
// import { useAppDispatch, useAppSelector } from "../../../store/store";
// import { useEffect, useState } from "react";
// import { fetchCatalogAssets } from "../../../store/slices/workflowPageSlice";

// const FileExplorer = () => { 
    
    
//     const dispatch = useAppDispatch();
//     const tab= useAppSelector((state) => state.workflowPage.tab);
//     const experimentId='IEwJDZcBpHPS2GeIwzH6';
//       const workflowId='IUwJDZcBpHPS2GeIyjFx';
//     const [selectedItem, setSelectedItem] = useState<any>(null);
    

//       useEffect(() => {
//         // Dispatch the thunk to fetch catalog assets
//         dispatch(fetchCatalogAssets({ project_id:`${experimentId}/${workflowId}` , page: '1', perPage: '10', sort: 'created,desc' }));
//       }, [dispatch]);
    
//       const catalog=tab?.catalogAssets.data || [];
//       console.log('catalog', catalog);
//       console.log('tab', tab);
      
//   return (
//     <DetailsCard title={""}>
//     <Typography>
//         This is a placeholder for the File Explorer component. 
//         It can be used to display files and directories in a structured format.
//     </Typography>

//     </DetailsCard>
//   );
// }
// export default FileExplorer;
import { Typography, Breadcrumbs, Link, List, ListItem, ListItemText, ListItemIcon, IconButton, Box } from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useEffect, useState } from "react";
import { fetchCatalogAssets } from "../../../store/slices/workflowPageSlice";
import { Details } from "@mui/icons-material";
import { DetailsCard } from "../../../shared/components/details-card";

type FileItem = {
  name: string;
  isFile: boolean;
  source?: string;
  data?: any; // original item for file
  children?: Record<string, FileItem>;
};

const FileExplorer = () => {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((state) => state.workflowPage.tab);
  const experimentId = 'IEwJDZcBpHPS2GeIwzH6';
  const workflowId = 'IUwJDZcBpHPS2GeIyjFx';
  const [currentPath, setCurrentPath] = useState<string[]>([]); // array of folder names representing the path
  const [tree, setTree] = useState<FileItem>({ name: "root", isFile: false, children: {} });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Build folder tree from catalog data
  useEffect(() => {
    const catalog = tab?.catalogAssets?.data || [];

    const root: FileItem = { name: "root", isFile: false, children: {} };

    catalog.forEach((item: any) => {
      const projectId = item.tags.projectId; // e.g. TestZenohExp/IEwJDZcBpHPS2GeIwzH6/IUwJDZcBpHPS2GeIyjFx/intermediate_datasets/Task1
      // We want only the part after project identifiers - to keep folder structure from intermediate_datasets down
      // So split and find the index of workflowId or experimentId to skip until there, then keep rest as folders

      // Split by slash:
      const parts = projectId.split('/');
      // Find index of workflowId in parts
      const workflowIdx = parts.findIndex(p => p === workflowId);

      // Take folders starting from after workflowId (e.g. intermediate_datasets/Task1)
      const folderParts = workflowIdx >= 0 ? parts.slice(workflowIdx + 1) : parts;

      // Insert into tree
      let currentNode = root;
      folderParts.forEach((folderName, idx) => {
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

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedFile(null);
  };

  return (
<DetailsCard
  title={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
        File Explorer
      </Typography>
    <Breadcrumbs aria-label="breadcrumb" sx={{ cursor: 'pointer' }}>
      <Link
        color={currentPath.length === 0 ? "text.primary" : "inherit"}
        underline="hover"
        onClick={() => {
          setCurrentPath([]);
          setSelectedFile(null);
        }}
        style={{ cursor: 'pointer' }}
      >
        root
      </Link>
      {currentPath.map((folder, idx) => (
        <Link
          key={folder}
          color={idx === currentPath.length - 1 ? "text.primary" : "inherit"}
          underline="hover"
          onClick={() => {
            setCurrentPath(currentPath.slice(0, idx + 1));
            setSelectedFile(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          {folder}
        </Link>
      ))}
    </Breadcrumbs>
    </Box>}
>
      {/* <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          color={currentPath.length === 0 ? "text.primary" : "inherit"}
          onClick={() => {
            setCurrentPath([]);
            setSelectedFile(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          root
        </Link>
        {currentPath.map((folder, idx) => (
          <Link
            key={folder}
            color={idx === currentPath.length - 1 ? "text.primary" : "inherit"}
            onClick={() => handleBreadcrumbClick(idx)}
            style={{ cursor: 'pointer' }}
          >
            {folder}
          </Link>
        ))}
      </Breadcrumbs> */}

      {/* <Typography variant="h6" gutterBottom>
        {selectedFile ? `File: ${selectedFile.name}` : `Folder: /${currentPath.join('/')}`}
      </Typography> */}

      {!selectedFile && currentFolder && (
        <List>
          {currentFolder.children &&
            Object.values(currentFolder.children).map((item) => (
              <ListItem
                key={item.name}
                button
                onClick={() => (item.isFile ? handleFileClick(item) : handleFolderClick(item.name))}
              >
                <ListItemIcon>
                  {item.isFile ? <InsertDriveFileIcon /> : <FolderIcon />}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
        </List>
      )}

      {selectedFile && (
        <div>
          <Typography variant="body1">
            {/* Example: show link to file */}
            <a href={selectedFile.source} target="_blank" rel="noopener noreferrer">
              Open {selectedFile.name}
            </a>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {JSON.stringify(selectedFile.data, null, 2)}
          </Typography>
        </div>
      )}
    </DetailsCard>
  );
};

export default FileExplorer;
