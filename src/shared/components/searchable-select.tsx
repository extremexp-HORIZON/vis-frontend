import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ListSubheader,
  TextField,
  Tooltip,
  Box,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchableSingleSelectProps {
  labelId: string;
  inputLabel: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  menuMaxHeight?: number;
  menuWidth?: number;
  disabled?: boolean;
  getOptionLabel?: (option: string) => string;
  /** Render the control in an error state (e.g. unfilled required field). */
  error?: boolean;
  /** When true, the field is marked required (asterisk on the label). */
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSingleSelectProps> = ({
  labelId,
  inputLabel,
  label,
  value,
  options,
  onChange,
  menuMaxHeight = 224,
  menuWidth = 250,
  disabled = false,
  getOptionLabel,
  error = false,
  required = false,
}) => {
  const [search, setSearch] = useState('');

  const optionToLabel = (option: string) =>
    getOptionLabel ? getOptionLabel(option) : option;

  const filteredOptions = options.filter(option =>
    optionToLabel(option).toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as string);
  };

  return (
    <FormControl fullWidth size="small" error={error} required={required}>
      <InputLabel id={labelId}>{inputLabel}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        label={label}
        size="small"
        sx={{
          '& .MuiSelect-select': { py: 0.75 },
        }}
        MenuProps={{
          PaperProps: {
            style: { maxHeight: menuMaxHeight, width: menuWidth },
            sx: {
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.customSurface.cardBorder}`,
              boxShadow: theme => theme.customShadows.popover,
              '& .MuiMenuItem-root': {
                py: 0.5,
                minHeight: 0,
              },
              '& .MuiMenuItem-root:hover': {
                backgroundColor: 'action.selected',
              },
            },
          },
          MenuListProps: {
            autoFocusItem: false,
            dense: true,
          },
        }}
        onClose={() => setSearch('')}
      >
        <ListSubheader sx={{ p: 0.75 }}>
          <TextField
            size="small"
            autoFocus
            placeholder="Search…"
            fullWidth
            value={search}
            onChange={e => {
              setSearch(e.target.value);
            }}
            onKeyDown={e => {
              e.stopPropagation();
            }}
            sx={{ '& .MuiInputBase-input': { py: 0.75 } }}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                  <SearchIcon fontSize="small" sx={{ opacity: 0.6, fontSize: 16 }} />
                </Box>
              ),
              endAdornment: (
                search ? (
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch('');
                    }}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.6,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <CloseIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </Box>
                ) : null
              ),
            }}
          />
        </ListSubheader>
        {filteredOptions.map(option => {
          const optionLabel = optionToLabel(option);

          return (
            <MenuItem key={option} value={option} dense>
              <Tooltip title={optionLabel} placement="right" enterDelay={500}>
                <Box
                  component="span"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {optionLabel}
                </Box>
              </Tooltip>
            </MenuItem>
          );
        })}
        {filteredOptions.length === 0 && (
          <MenuItem disabled dense sx={{ opacity: 0.6, fontStyle: 'italic' }}>
            No results found
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default SearchableSelect;
