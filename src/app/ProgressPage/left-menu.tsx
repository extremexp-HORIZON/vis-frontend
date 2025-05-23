import {
  Box,
  Tooltip,
  ListItem,
  List,
  ListItemText,
  Paper,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import type { RootState } from '../../store/store';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMenuOptions } from '../../store/slices/progressPageSlice';

const LeftMenu = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { menuOptions } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const dispatch = useAppDispatch();

  const navItems = [
    {
      icon: <ListRoundedIcon />,
      label: 'Monitoring',
      path: 'monitoring'
    },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <Box>
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: menuOptions.collapsed ? "center" : "flex-start",
            gap: 1,
            padding: 1,
            height: "64px", // Fixed height to match experiment controls
            boxSizing: "border-box",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box
            component="img"
            src="/images/extremexp-logo-removebg-preview.png"
            alt="ExtremeXP logo"
            sx={{
              width: "40px",
              borderRadius: "8px",
              objectFit: "cover",
              userSelect: "none",
            }}
          />
          {!menuOptions.collapsed && (
            <Box
              sx={{
                whiteSpace: 'nowrap',
                overflow: "hidden"
              }}
            >
              <Tooltip title={experimentId} arrow>
                <Typography variant="h6" sx={{ fontWeight: "bold" }} noWrap>
                  {experimentId}
                </Typography>
              </Tooltip>
            </Box>
          )}
        </Box> */}
        {menuOptions.collapsed && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              padding: 1,
              height: '64px', // Fixed height to match experiment controls
              boxSizing: 'border-box',
              borderBottom: '1px solid #ddd',
            }}
          >
            <Box
              component="img"
              src="/images/extremexp-logo-removebg-preview.png"
              alt="ExtremeXP logo"
              sx={{
                width: '40px',
                borderRadius: '8px',
                objectFit: 'cover',
                userSelect: 'none',
              }}
            />
          </Box>
        )}
        {!menuOptions.collapsed && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1,
              padding: 1,
              height: '64px', // Fixed height to match experiment controls
              boxSizing: 'border-box',
              borderBottom: '1px solid #ddd',
            }}
          >
            <Box
              component="img"
              src="/images/extremexp-logo-full.png"
              alt="ExtremeXP logo"
              sx={{
                width: '80%',
                borderRadius: '8px',
                objectFit: 'cover',
                userSelect: 'none',
              }}
            />
          </Box>
        )}
        <Box>
          <List sx={{ p: 0 }}>
            {navItems.map(({ icon, label, path }) => {
              const selected = menuOptions.selected === path;
              const item = (
                <ListItem
                  key={path}
                  component="button"
                  sx={{
                    bgcolor: selected ? theme => theme.palette.customBlue.selected : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ddd',
                    justifyContent: menuOptions.collapsed ? 'center' : 'flex-start',
                    height: '48px', // 48px is the standard MUI component height
                    '&:hover': {
                      bgcolor: theme => theme.palette.customGrey.main
                    },
                  }}
                  onClick={() => navigate(`/${experimentId}/${path}`)}
                >
                  {icon}
                  {!menuOptions.collapsed && (
                    <ListItemText sx={{ ml: 1.5 }} primary={label} />
                  )}
                </ListItem>
              );

              return menuOptions.collapsed ? (
                <Tooltip key={path} title={label} arrow placement="right">
                  {item}
                </Tooltip>
              ) : (
                item
              );
            })}
          </List>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: menuOptions.collapsed ? 'center' : 'flex-end',
          alignItems: 'center',
          padding: 1,
          marginBottom: 1,
        }}
      >
        <IconButton
          onClick={() => dispatch(setMenuOptions({ ...menuOptions, collapsed: !menuOptions.collapsed }))}
          sx={{
            backgroundColor: theme => theme.palette.customGrey.light || '#f5f5f5',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            '&:hover': {
              backgroundColor: theme => theme.palette.customGrey.main || '#e0e0e0',
            },
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {menuOptions.collapsed ?
            <ChevronRightRoundedIcon fontSize="small" /> :
            <ChevronLeftRoundedIcon fontSize="small" />
          }
        </IconButton>
      </Box>
    </Paper>
  );
};

export default LeftMenu;
