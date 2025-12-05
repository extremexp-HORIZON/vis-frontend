import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ListSubheader,
  TextField,
  Box,
  OutlinedInput,
  Checkbox,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchableMultiSelectProps {
  labelId: string;
  inputLabel: React.ReactNode;
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  menuMaxHeight?: number;
  menuWidth?: number;
  isOptionDisabled?: (option: string, selected: string[]) => boolean;
  disabled?: boolean;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  labelId,
  inputLabel,
  label,
  value,
  options,
  onChange,
  menuMaxHeight = 224,
  menuWidth = 250,
  isOptionDisabled,
  disabled = false
}) => {
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const newValue = event.target.value as string[];
    onChange(newValue);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{inputLabel}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={value}
        disabled={disabled}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={selected => (selected as string[]).join(', ')}
        MenuProps={{
          PaperProps: { 
            style: { maxHeight: menuMaxHeight, width: menuWidth },
            sx: {
              '& .MuiMenuItem-root:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
              },
            },
          },
          MenuListProps: {
            autoFocusItem: false,
          },
        }}
        onClose={() => setSearch('')}
      >
        <ListSubheader sx={{ p: 1 }}>
          <TextField
            size="small"
            autoFocus
            placeholder="Search..."
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation();
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SearchIcon fontSize="small" sx={{ opacity: 0.6 }} />
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
                        <CloseIcon fontSize="small" />
                      </Box>
                    ) : null
                ),
            }}
          />
        </ListSubheader>

        {filteredOptions.map(option => {
          const checked = value.includes(option);
          const disabled = isOptionDisabled
            ? isOptionDisabled(option, value)
            : false;
          return (
            <MenuItem key={option} value={option} disabled={disabled}>
              <Checkbox checked={checked} />
              {option}
            </MenuItem>
          );
        })}
        {filteredOptions.length === 0 && (
            <MenuItem disabled sx={{ opacity: 0.6, fontStyle: 'italic' }}>
              No results found
            </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default SearchableMultiSelect;
