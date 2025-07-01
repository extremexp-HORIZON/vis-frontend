import { Box, Button, ButtonGroup, Card, Checkbox, Chip, Divider, FormControlLabel, Grid, IconButton, Menu } from '@mui/material';
import type { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setIsMosaic, setSelectedModelComparisonChart, setShowMisclassifiedOnly } from '../../../store/slices/monitorPageSlice';
import theme from '../../../mui-theme';
import WindowRoundedIcon from '@mui/icons-material/WindowRounded';
import RoundedCornerRoundedIcon from '@mui/icons-material/RoundedCornerRounded';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
import { SectionHeader } from '../../../shared/components/responsive-card-table';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { useState } from 'react';

const ComparativeAnalysisControls = ()=> {
  const isMosaic = useAppSelector((state: RootState) => state.monitorPage.isMosaic);
  const selectedModelComparisonChart = useAppSelector((state: RootState) => state.monitorPage.selectedModelComparisonChart);
  const showMisclassifiedOnly = useAppSelector((state: RootState) => state.monitorPage.showMisclassifiedOnly);
  const selectedComparisonTab = useAppSelector((state: RootState) => state.monitorPage.selectedComparisonTab);
  const [anchorEl, setAnchorEl] = useState <null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const dispatch = useAppDispatch();
  const options1 = [
    { label: 'confusionMatrix', name: 'Confusion\nMatrix', icon: <WindowRoundedIcon /> },
    { label: 'rocCurve', name: 'Roc\nCurve', icon: <RoundedCornerRoundedIcon /> },
    { label: 'instanceView', name: 'Instance\nView', icon: <BlurLinearIcon /> }
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{ p: 2 }}
      >
        {selectedComparisonTab === 1 && (
          <Card
            variant="outlined"
            sx={{
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              boxShadow: 1,
              backgroundColor: theme.palette.customGrey.light,
            }}
          >
            <Box display="flex" flexWrap="wrap" gap={1}>
              {options1.map(option => (
                <Chip
                  key={option.label}
                  label={option.name}
                  icon={option.icon}
                  clickable
                  size="small"
                  sx={{
                    height: 35,
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    background:
                      selectedModelComparisonChart === option.label
                        ? undefined
                        : theme.palette.customGrey.light,
                    '& .MuiChip-icon': {
                      fontSize: 25,
                      marginLeft: 0,
                      marginRight: 0.1,
                    },
                    '& .MuiChip-label': {
                      whiteSpace: 'pre-line',
                      textAlign: 'left',
                      lineHeight: 1.2,
                    },
                  }}
                  color={selectedModelComparisonChart === option.label ? 'primary' : 'default'}
                  variant={selectedModelComparisonChart === option.label ? 'filled' : 'outlined'}
                  onClick={() => dispatch(setSelectedModelComparisonChart(option.label))}
                />
              ))}
            </Box>
          </Card>
        )}

        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ ml: 'auto' }}
        >

          {selectedModelComparisonChart === 'instanceView' && selectedComparisonTab === 1 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={showMisclassifiedOnly}
                  size="small"
                  onChange={(e) => dispatch(setShowMisclassifiedOnly(e.target.checked))}
                />
              }
              label="Misclassified"
              sx={{ ml: 0.5 }}
            />
          )}

          <Card
            variant="outlined"
            sx={{
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              boxShadow: 1,
            }}
          >
            <ButtonGroup variant="contained" aria-label="view mode" sx={{ height: '25px' }}>
              <Button
                variant={isMosaic ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => dispatch(setIsMosaic(true))}
              >
                Mosaic
              </Button>
              <Button
                variant={!isMosaic ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => dispatch(setIsMosaic(false))}
              >
                Stacked
              </Button>
            </ButtonGroup>
          </Card>
          
          {selectedModelComparisonChart === 'instanceView' && selectedComparisonTab === 1 && (
            <>
              <IconButton
                aria-label="settings"
                onClick={handleMenuClick}
                sx={{
                  position: 'relative',
                  '& svg': { zIndex: 1, position: 'relative' },
                }}
              >
                <SettingsIcon />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    width: 320,
                    maxHeight: 500,
                    padding: 0,
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    mt: 0,
                  },
                }}
                MenuListProps={{ sx: { pt: 0 } }}
              >
                <SectionHeader
                  icon={<SettingsSuggestIcon fontSize="small" />}
                  title="Control Options"
                />
                <Box sx={{ mt: 2 }} />
              </Menu>
            </>
          )}
        </Box>
      </Box>

      <Divider
        sx={{
          my: 2,
          borderBottomWidth: 2,
          borderColor: 'grey.300',
        }}
      />
    </>
  );
};

export default ComparativeAnalysisControls;
