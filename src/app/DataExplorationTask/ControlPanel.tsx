import React, { useState } from 'react';
import { Drawer, TextField, Button, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
const ControlPanel = ({ onPathSubmit }: { onPathSubmit: (path: string) => void }) => {
  const [useCase, setUseCase] = useState('');
  const [folder, setFolder] = useState('');
  const [subfolder, setSubfolder] = useState('');
  const [filename, setFilename] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = () => {
    const fullPath = `/${useCase}/${folder}/${subfolder}/${filename}`;
    console.log("Submitting path:", fullPath);
    onPathSubmit(fullPath);
  };

  return (
    <div>
      <IconButton onClick={toggleDrawer} color="primary">
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
        <Box p={2} width="250px" role="presentation" textAlign="center">
          <TextField
            label="Use Case"
            fullWidth
            margin="normal"
            value={useCase}
            onChange={e => setUseCase(e.target.value)}
          />
          <TextField
            label="Folder"
            fullWidth
            margin="normal"
            value={folder}
            onChange={e => setFolder(e.target.value)}
          />
          <TextField
            label="Subfolder"
            fullWidth
            margin="normal"
            value={subfolder}
            // onChange={e => setSubfolder(e.target(value)}
          />
          <TextField
            label="Filename"
            fullWidth
            margin="normal"
            value={filename}
            onChange={e => setFilename(e.target.value)}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
            Submit Path
          </Button>
        </Box>
      </Drawer>
    </div>
  );
};

export default ControlPanel;




