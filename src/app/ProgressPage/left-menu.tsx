import {
  Box,
  Tooltip,
  ListItem,
  List,
  ListItemText,
  Paper,
  IconButton,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import ListRoundedIcon from "@mui/icons-material/ListRounded"
import CompareRoundedIcon from '@mui/icons-material/CompareRounded'
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { setMenuOptions } from "../../store/slices/progressPageSlice"

const LeftMenu = () => {
  const { experimentId } = useParams()
  const navigate = useNavigate()
  const { menuOptions } = useAppSelector(
    (state: RootState) => state.progressPage
  )
  const dispatch = useAppDispatch()

  const navItems = [
    {
      icon: <ListRoundedIcon />,
      label: "Monitoring",
      path: "monitoring"
    },
  ]

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <Box >
        <List sx={{pt: 0}}>
          {navItems.map(({ icon, label, path }) => {
            const selected = menuOptions.selected === path
            const item = (
              <ListItem
                key={path}
                component="button"
                sx={{
                  bgcolor: selected ? theme => theme.palette.customBlue.selected : "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid #ddd",
                  justifyContent: menuOptions.collapsed ? "center" : "flex-start",
                  "&:hover": {
                    bgcolor: theme => theme.palette.customGrey.main
                  },
                  px: 2
                }}
                onClick={() => navigate(`/${experimentId}/${path}`)}
              >
                {icon}
                {!menuOptions.collapsed && (
                  <ListItemText sx={{ ml: 1.5 }} primary={label} />
                )}
              </ListItem>
            )

            return menuOptions.collapsed ? (
              <Tooltip key={path} title={label} arrow placement="right">
                {item}
              </Tooltip>
            ) : (
              item
            )
          })}
        </List>
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <IconButton onClick={() => dispatch(setMenuOptions({...menuOptions, collapsed: !menuOptions.collapsed}))}>
            {menuOptions.collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default LeftMenu