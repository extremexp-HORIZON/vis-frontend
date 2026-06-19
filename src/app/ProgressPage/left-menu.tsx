import {
  Box,
  Tooltip,
  ListItem,
  List,
  ListItemText,
  Paper,
  IconButton,
  ListItemButton,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import type { RootState } from '../../store/store';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMenuOptions } from '../../store/slices/progressPageSlice';
import { toggleThemeMode } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const LeftMenu = () => {
  const { experimentId } = useParams();
  const navigate = useNavigate();
  const { menuOptions } = useAppSelector(
    (state: RootState) => state.progressPage
  );
  const themeMode = useAppSelector((state: RootState) => state.ui.themeMode);
  const dispatch = useAppDispatch();

  const navItems = [
    {
      icon: <ScienceOutlinedIcon />,
      label: 'Experiments',
      path: 'experiments',
      to: '/',
    },
    {
      icon: <ListRoundedIcon />,
      label: 'Monitoring',
      path: 'monitoring',
      to: experimentId ? `/${experimentId}/monitoring` : null,
    },
    {
      icon: <HubRoundedIcon />,
      label: 'LLM Observability',
      path: 'llm-observability',
      to: experimentId ? `/${experimentId}/llm-observability` : null,
    },
    // {
    //   icon: <ViewInArIcon />,
    //   label: 'Gamification',
    //   path: 'gamification'
    // },

  ];

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderRight: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        zIndex: theme => theme.zIndex.appBar,
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
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
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
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
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
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
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
            {navItems.map(({ icon, label, path, to }) => {
              const selected = menuOptions.selected === path;
              const disabled = !to;
              const item = (
                <ListItem key={path} disablePadding>
                  <ListItemButton
                    component={disabled ? 'div' : RouterLink}
                    to={disabled ? undefined : to}
                    selected={selected}
                    sx={{
                      justifyContent: menuOptions.collapsed ? 'center' : 'flex-start',
                      height: '46px',
                      opacity: disabled ? 0.5 : 1,
                      pointerEvents: disabled ? 'none' : 'auto',
                      // Accent stripe reserved on every item so selection
                      // doesn't shift the icon; only colored when active.
                      borderLeft: '3px solid transparent',
                      color: 'text.secondary',
                      '& .MuiListItemIcon-root, & svg': {
                        color: 'inherit',
                        transition: theme => theme.transitions.create('color', { duration: 160 }),
                      },
                      '&.Mui-selected': {
                        borderLeftColor: theme => theme.palette.primary.main,
                        bgcolor: theme => theme.palette.customBlue.selected,
                        color: theme => theme.palette.primary.main,
                        '& .MuiListItemText-primary': { fontWeight: 700 },
                        '&:hover': {
                          bgcolor: theme => theme.palette.customBlue.selected,
                        },
                      },
                      '&:hover': {
                        bgcolor: disabled
                          ? 'transparent'
                          : theme => theme.palette.action.hover,
                      },
                    }}
                  >
                    {icon}
                    {!menuOptions.collapsed && (
                      <ListItemText sx={{ ml: 1.5 }} primary={label} />
                    )}
                  </ListItemButton>
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
          flexDirection: 'column',
          alignItems: menuOptions.collapsed ? 'center' : 'flex-end',
          padding: 1,
          marginBottom: 1,
          gap: 1,
        }}
      >
        <Tooltip title="Logout" placement="right" arrow>
          <IconButton
            onClick={() => {
              dispatch(logoutUser()).then(() => {
                navigate('/login', { replace: true });
              });
            }}
            sx={{
              backgroundColor: theme => theme.palette.customGrey.light,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              '&:hover': {
                backgroundColor: theme => theme.palette.error.light,
                color: 'common.white',
                transform: 'translateY(-1px)',
                boxShadow: theme => theme.customShadows.cardHover,
              },
              boxShadow: theme => theme.customShadows.card,
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={themeMode === 'light' ? 'Dark mode' : 'Light mode'} placement="right" arrow>
          <IconButton
            onClick={() => dispatch(toggleThemeMode())}
            sx={{
              backgroundColor: theme => theme.palette.customGrey.light,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              '&:hover': {
                backgroundColor: theme => theme.palette.customGrey.main,
                transform: 'translateY(-1px)',
                boxShadow: theme => theme.customShadows.cardHover,
              },
              boxShadow: theme => theme.customShadows.card,
            }}
          >
            {themeMode === 'light'
              ? <DarkModeRoundedIcon fontSize="small" />
              : <LightModeRoundedIcon fontSize="small" />
            }
          </IconButton>
        </Tooltip>
        <IconButton
          onClick={() => dispatch(setMenuOptions({ ...menuOptions, collapsed: !menuOptions.collapsed }))}
          sx={{
            backgroundColor: theme => theme.palette.customGrey.light,
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            '&:hover': {
              backgroundColor: theme => theme.palette.customGrey.main,
            },
            boxShadow: theme => theme.customShadows.card,
            transition: theme =>
              theme.transitions.create(['transform', 'box-shadow', 'background-color'], { duration: 160 }),
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
