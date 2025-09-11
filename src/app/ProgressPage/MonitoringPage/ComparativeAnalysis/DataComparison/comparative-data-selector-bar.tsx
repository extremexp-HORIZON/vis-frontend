import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  Typography,
  Button,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';
import type { RootState } from '../../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../../store/store';
import { setSelectedDataset } from '../../../../../store/slices/monitorPageSlice';
import ClearAllIcon from '@mui/icons-material/ClearAll';

export default function DatasetSelectorBar() {
  const dispatch = useAppDispatch();
  const { commonDataAssets, selectedDataset } = useAppSelector(
    (state: RootState) => state.monitorPage.comparativeDataExploration
  );

  const datasetNames = Object.keys(commonDataAssets);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllDatasets, setShowAllDatasets] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredSuggestions(
      datasetNames.filter(name =>
        name.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
    setSelectedIndex(0);
  }, [inputValue, datasetNames]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      handleSelect(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (dataset: string) => {
    if (dataset === selectedDataset) {
      dispatch(setSelectedDataset(null));
    } else {
      dispatch(setSelectedDataset(dataset));
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleClear = () => {
    dispatch(setSelectedDataset(null));
  };

  const renderInputField = () => (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      placeholder="Type to search datasets..."
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      disabled={!!selectedDataset}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          inputValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setInputValue('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        ),
        sx: {
          pl: 0.5,
          alignItems: 'center',
          gap: 0.5
        }
      }}
    />
  );

  const renderSuggestions = () => {
    if (!showSuggestions || selectedDataset || filteredSuggestions.length === 0) return null;

    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          width: '100%',
          mt: 0.5,
          zIndex: 1000,
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        {filteredSuggestions.map((suggestion, i) => (
          <Box
            key={suggestion}
            ref={i === selectedIndex ? suggestionRef : null}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              backgroundColor: i === selectedIndex ? 'action.selected' : 'inherit',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
            onClick={() => handleSelect(suggestion)}
          >
            <Typography variant="body2">{suggestion}</Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const renderAvailableDatasets = () => {
    const base = showAllDatasets ? datasetNames : datasetNames.slice(0, 5);

    // Ensure the selected dataset is visible even when showing only a subset
    let datasetsToShow = base;

    if (selectedDataset && !base.includes(selectedDataset)) {
      datasetsToShow = [selectedDataset, ...base.filter(n => n !== selectedDataset).slice(0, 4)];
    }

    const hasMore = datasetNames.length > 5;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Available Datasets
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {datasetsToShow.map((name, i) => {
            const isActive = name === selectedDataset;

            return (
              <Chip
                key={`${name}-${i}`}
                size="small"
                label={name}
                onClick={() => handleSelect(name)}
                clickable
                variant={isActive ? 'filled' : 'outlined'}
                color={isActive ? 'primary' : 'default'}
              />
            );
          })}
          {hasMore && !showAllDatasets && (
            <Button
              size="small"
              onClick={() => setShowAllDatasets(true)}
              sx={{ fontSize: '0.75rem', ml: 1 }}
            >
              Show More ({datasetNames.length - 5})
            </Button>
          )}
          {showAllDatasets && (
            <Button
              size="small"
              onClick={() => setShowAllDatasets(false)}
              sx={{ fontSize: '0.75rem', ml: 1 }}
            >
              Show Less
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ position: 'relative', mt: 2 }}>
        {renderInputField()}
        {renderSuggestions()}
        {renderAvailableDatasets()}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Type to search or click a dataset name
        </Typography>

        { selectedDataset && <Divider sx={{ my: 2 }} /> }
      </Box>
      {
        selectedDataset && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Button
              onClick={() => { handleClear(); }}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ClearAllIcon />}
            >
              Clear Dataset
            </Button>
          </Box>
        )
      }
    </Box>
  );
}
