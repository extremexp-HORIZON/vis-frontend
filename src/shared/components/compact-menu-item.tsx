import type React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';

interface CompactMenuItemProps {
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const CompactMenuItem = ({
  icon,
  primary,
  secondary,
  onClick,
  selected = false,
  disabled = false,
}: CompactMenuItemProps) => (
  <MenuItem
    dense
    onClick={onClick}
    disabled={disabled}
    sx={{
      py: 0.75,
      px: 1.5,
      minHeight: 0,
      borderRadius: 1,
      mx: 0.5,
    }}
  >
    <ListItemIcon sx={{ minWidth: 28, color: selected ? 'primary.main' : 'text.secondary' }}>
      {icon}
    </ListItemIcon>
    <ListItemText
      primary={primary}
      secondary={secondary}
      primaryTypographyProps={{
        fontSize: '0.8rem',
        fontWeight: selected ? 600 : 500,
        color: selected ? 'primary.main' : 'text.primary',
      }}
      secondaryTypographyProps={{ fontSize: '0.7rem' }}
    />
  </MenuItem>
);

export default CompactMenuItem;
