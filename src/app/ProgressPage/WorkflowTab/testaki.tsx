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
} from "@mui/material";
import { useAppSelector } from "../../../store/store";
import DataExplorationComponent from "../../Tasks/DataExplorationTask/ComponentContainer/DataExplorationComponent";
import {
  DetailsCard,
  DetailsCardItem
} from "../../../shared/components/details-card";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import InfoMessage from "../../../shared/components/InfoMessage";

const DataAssetMetadata = ({ dataset }) => (
  <DetailsCard title="Data Asset Metadata" minWidth="10%">
    <DetailsCardItem label="Name" value={dataset?.name} />
    <DetailsCardItem label="Format" value={dataset?.format} />
    <DetailsCardItem label="Role" value={dataset?.role} />
    <DetailsCardItem label="Source" value={dataset?.source} />
    <DetailsCardItem label="Type" value={dataset?.sourceType} />
    <DetailsCardItem label="Task" value={dataset?.task} />
  </DetailsCard>
);

// Example dataset as a tree
const treeData = [
  {
    name: "root",
    type: "folder",
    children: [
      {
        name: "data.csv",
        size: "2MB",
        type: "file"
      },
      {
        name: "image.png",
        size: "500KB",
        type: "file"
      },
      {
        name: "subfolder",
        type: "folder",
        children: [
          {
            name: "nestedfile.txt",
            size: "1KB",
            type: "file"
          },
          {
            name: "deepfolder",
            type: "folder",
            children: [
              {
                name: "deepfile.docx",
                size: "20KB",
                type: "file"
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
    if (node.type === "folder") {
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
          {node.type === "folder" ? (
            <FolderIcon color="primary" />
          ) : (
            <InsertDriveFileIcon color="action" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={node.name}
          secondary={node.size || ""}
        />
        {node.type === "folder" ? (
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
      {node.type === "folder" && (
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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        overflow: "auto"
      }}
    >
      {isDirectory ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            overflow: "auto"
          }}
        >
          <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
            <DataAssetMetadata dataset={dataset} />
          </Box>

          <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
            <DetailsCard title="File Explorer" minWidth="10%">
              <Paper elevation={3} sx={{ p: 2 }}>
                <List dense>
                  {treeData.map((node) => (
                    <TreeItem
                      key={node.name}
                      node={node}
                      onSelect={(fileName) => setSelectedFile(fileName)}
                      selectedFile={selectedFile}
                    />
                  ))}
                </List>
              </Paper>
            </DetailsCard>
          </Box>
        </Box>
      ) : (
        <DataAssetMetadata dataset={dataset} />
      )}

      {/* Preview Panel */}
      <DetailsCard title={`Preview ${selectedFile || ""}`} minWidth="10%">
        {selectedFile|| !isDirectory ? (
          <Box mt={1}>
            {/* Replace with actual preview component logic */}
            <DataExplorationComponent />
          </Box>
        ) : (
          <InfoMessage
            type="info"
            message="No file selected. Select a file from the explorer to preview."
            fullHeight={false}
          />
        )}
      </DetailsCard>
    </Box>
  );
};

export default Testaki;
