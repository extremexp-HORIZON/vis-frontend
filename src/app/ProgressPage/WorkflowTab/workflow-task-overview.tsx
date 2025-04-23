import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import type { RootState} from "../../../store/store";
import { useAppSelector } from "../../../store/store"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Card, CardContent, CardHeader, Divider } from "@mui/material"

const WorkflowTaskOverview = () => {
  const { tab } = useAppSelector((state: RootState) => state.workflowPage)
  const { selectedTask } = useAppSelector(
    state =>
      state.workflowPage.tab?.dataTaskTable ?? {
        selectedTask: null,
      },
  )
  const task = tab?.workflowConfiguration.tasks?.find(task => task.name === selectedTask?.task)
  const parameters = tab?.workflowConfiguration.params?.filter(param => param.task === selectedTask?.taskId)

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
  
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);
  
    return parts.join(" ");
  };
  
  if(!task) return  

  return (
    <Box sx={{display: "flex", flexDirection: "row", gap: 2, width: "100%"}}>
        <Card sx={{
          minWidth: "20%",
          boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
          height: "100%", 
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }     
        }}>
            <CardHeader
              title={
                <Typography
                  variant="overline"
                  sx={{
                    padding: "4px 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: '#2a3f5f'    
                  }}
                >
                  Task Metadata
                </Typography>
              }
              sx={{
                background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                padding: "4px 16px",
                height: "40px",
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              }}
            />
            <CardContent sx={{
              backgroundColor: "#ffffff", 
              py: 2,
              px: 3,
              '&:last-child': { 
                paddingBottom: 3 
              },
              borderRadius: '0 0 12px 12px'              
              }}
            >
              <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 1,
                      alignItems: "center",
                      backgroundColor: task.endTime ? "#e6f4ea" : "#fdecea", // light green / light red
                      padding: "6px 8px",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1">
                      Status: {task.endTime ? "completed" : "not completed"}
                    </Typography>
                    {task.endTime ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <WarningAmberRoundedIcon fontSize="small" color="error" />
                    )}
                  </Box>
                  <Divider />
                </Box>
                {task.startTime &&
                    <Box>
                        <Typography sx={{mb: 1}} variant="body1">
                            Start time: {new Date(task.startTime).toLocaleString()}
                        </Typography>
                        <Divider />
                    </Box>
                }
                {task.endTime &&
                    <Box>
                        <Typography sx={{mb: 1}} variant="body1">
                            End time: {new Date(task.endTime).toLocaleString()}
                        </Typography>
                        <Divider />
                    </Box>
                }
                {task.endTime && task.startTime &&
                    <Box >
                    <Typography sx={{mb: 1}} variant="body1">
                        Duration: {formatDuration((task.endTime - task.startTime) / 1000)}
                    </Typography>
                    <Divider />
                </Box>
            }
              </Box>
            </CardContent>
        </Card>
        <Card sx={{
          minWidth: "20%",
          boxShadow: '0 4px 20px rgba(0,0,0,0.09)', 
          height: "100%", 
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }}>
            <CardHeader
              title={
                <Typography
                  variant="overline"
                  sx={{
                    padding: "4px 8px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: '#2a3f5f'    
                  }}
                >
                  Task Parameters
                </Typography>
              }
              sx={{
                background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                padding: "4px 16px",
                height: "40px",
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              }}
            />
            <CardContent sx={{
              backgroundColor: "#ffffff", 
              py: 2,
              px: 3,
              '&:last-child': { 
                paddingBottom: 3 
              },
              borderRadius: '0 0 12px 12px'              
              }}
            >
              <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                {parameters?.map(param => (
                    <Box key={`param-${param.name}`}>
                        <Typography sx={{mb: 1}} variant="body1">
                            {param.name}: {param.value}
                        </Typography>
                        <Divider />
                    </Box>
                ))}
                {parameters?.length === 0 && 
                    <Box sx={{display: "flex",gap: 1, alignItems: "center", justifyContent: "center", height: "100%"}}>
                        <InfoOutlinedIcon fontSize="small" color="disabled" />
                        <Typography variant="body1">
                        No parameters defined for this task
                        </Typography>
                    </Box>
                }
              </Box>
            </CardContent>
        </Card>
    </Box>
  )
}

export default WorkflowTaskOverview
