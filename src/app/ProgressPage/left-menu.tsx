import {
  Box,
  Tooltip,
  ListItem,
  List,
  ListItemText,
  Paper,
  IconButton,
  Divider
} from "@mui/material"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import ListRoundedIcon from "@mui/icons-material/ListRounded"
import CompareRoundedIcon from '@mui/icons-material/CompareRounded'
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme, Theme } from "@mui/material/styles"

type LeftMenuProps = {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const LeftMenu = (props: LeftMenuProps) => {
  const { experimentId } = useParams()
  const theme: Theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed, setCollapsed } = props

  const navItems = [
    {
      icon: <ListRoundedIcon />,
      label: "Monitoring",
      path: "monitoring"
    },
    {
      icon: <CompareRoundedIcon />,
      label: "Comparative Analysis",
      path: "comparative-analysis"
    },
    {
      icon: <PsychologyAltRoundedIcon />,
      label: "Explainability",
      path: "explainability"
    }
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
      <Box>
        <List>
          {navItems.map(({ icon, label, path }) => {
            const selected = location.pathname.includes(path)
            const item = (
              <ListItem
                key={path}
                component="button"
                sx={{
                  bgcolor: selected ? theme => theme.palette.customBlue.selected : "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid #ddd",
                  justifyContent: collapsed ? "center" : "flex-start",
                  "&:hover": {
                    bgcolor: theme => theme.palette.customGrey.main
                  },
                  px: 2
                }}
                onClick={() => navigate(`/${experimentId}/${path}`)}
              >
                {icon}
                {!collapsed && (
                  <ListItemText sx={{ ml: 1.5 }} primary={label} />
                )}
              </ListItem>
            )

            return collapsed ? (
              <Tooltip key={path} title={label} arrow placement="right">
                {item}
              </Tooltip>
            ) : (
              item
            )
          })}
        </List>
        <Box sx={{ display: "flex", justifyContent: "right", py: 1 }}>
          <IconButton onClick={() => setCollapsed(prev => !prev)}>
            {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default LeftMenu