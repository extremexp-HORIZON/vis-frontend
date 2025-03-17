import { Box, Typography, Tooltip, ListItem, List, ListItemText, Paper } from "@mui/material"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import ListRoundedIcon from "@mui/icons-material/ListRounded"
import CompareRoundedIcon from '@mui/icons-material/CompareRounded'
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded'
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme, Theme } from "@mui/material/styles"

const LeftMenu = (props: { workflowId: string | null}) => {
    const { workflowId } = props
    const { experimentId } = useParams()
    const theme: Theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = (newValue: string | null) => (event: React.SyntheticEvent) => {
      console.log("here")
      if (newValue) navigate(`${location.pathname}?workflowId=${newValue}`)
      else navigate(`${location.pathname}`)
    }
    
    return (
      <Paper elevation={2} sx={{height: "100%"}}>
          <Box
              sx={{
                  px: 2,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 2,
                  height: "98%",
              }}
          >
            <Box
                sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    overflow: "hidden"
                }}
            >
                <Box
                  component="img"
                  src="/images\extremexp-logo-removebg-preview.png"
                  alt="ExtremeXP logo"
                  sx={{
                    width: {xs: "100%", sm: "50px"},
                    borderRadius: "8px",
                    objectFit: "cover",
                    userSelect: "none",
                  }}
                />
                <Tooltip arrow title={experimentId}>
                  <Box
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }} noWrap>
                      {experimentId}
                    </Typography>
                  </Box>
                </Tooltip>
            </Box>
            <Box>
              <List>
                { isSmallScreen ? (
                  <Tooltip arrow title="Monitoring">
                    <ListItem
                        component="button"
                        sx={{
                            bgcolor: !workflowId ? theme => theme.palette.customBlue.selected : "transparent",
                            border: "none",
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd",
                            justifyContent: { xs: "center", md: "flex-start"},
                            "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                            }}
                            onClick={handleClick(null)}
                        >
                        <ListRoundedIcon />
                      </ListItem>
                    </Tooltip> 
                  ) : (
                    <ListItem
                      component="button"
                      sx={{
                        bgcolor: !workflowId ? theme => theme.palette.customBlue.selected : "transparent",
                        border: "none",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                          justifyContent: { xs: "center", md: "flex-start"},
                          "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                          }}
                          onClick={handleClick(null)}
                    >
                      <ListRoundedIcon sx={{mr: 1.5}} />
                      <ListItemText primary="Monitoring" />
                  </ListItem>
                  )
                }
                { isSmallScreen ? (
                  <Tooltip arrow title="Comparative Analysis">
                    <ListItem
                        component="button"
                        sx={{
                          bgcolor: workflowId === "compare-completed" ? theme => theme.palette.customBlue.selected : "transparent",
                          border: "none",
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd",
                            justifyContent: { xs: "center", md: "flex-start"},
                            "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                            }}
                            onClick={handleClick("compare-completed")}
                        >
                        <CompareRoundedIcon />
                      </ListItem>
                    </Tooltip> 
                  ) : (
                    <ListItem
                      component="button"
                      sx={{
                        bgcolor: workflowId === "compare-completed" ? theme => theme.palette.customBlue.selected : "transparent",
                        border: "none",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                          justifyContent: { xs: "center", md: "flex-start"},
                          "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                          }}
                          onClick={handleClick("compare-completed")}
                    >
                      <CompareRoundedIcon sx={{mr: 1.5}} />
                      <ListItemText primary="Comparative Analysis" />
                  </ListItem>
                  )
                }
                { isSmallScreen ? (
                  <Tooltip arrow title="Explainability">
                    <ListItem
                        component="button"
                        sx={{
                          bgcolor: workflowId === "explainability" ? theme => theme.palette.customBlue.selected : "transparent",
                            border: "none",
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd",
                            justifyContent: { xs: "center", md: "flex-start"},
                            "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                            }}
                        >
                        <PsychologyAltRoundedIcon />
                      </ListItem>
                    </Tooltip> 
                  ) : (
                    <ListItem
                      component="button"
                      sx={{
                        bgcolor: workflowId === "explainability" ? theme => theme.palette.customBlue.selected : "transparent",
                        border: "none",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                          justifyContent: { xs: "center", md: "flex-start"},
                          "&:hover": { bgcolor: theme => theme.palette.customGrey.main }
                          }}
                    >
                      <PsychologyAltRoundedIcon sx={{mr: 1.5}} />
                      <ListItemText primary="Explainability" />
                  </ListItem>
                  )
                }
              </List>
            </Box>
          </Box>
        </Paper>
    )

}

export default LeftMenu