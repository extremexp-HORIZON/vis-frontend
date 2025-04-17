import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { RootState, useAppSelector } from "../../../store/store"
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
        <Card sx={{minWidth: "20%", boxShadow: 2, borderRadius: 2}}>
            <CardHeader
              title={
                <Typography
                  variant="overline"
                  sx={{
                    padding: "4px 8px",
                    textTransform: "uppercase", // Optional: Makes the text uppercase (can be removed)
                  }}
                >
                  Task Metadata
                </Typography>
              }
              sx={{
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #ddd",
                padding: "4px 16px", // Reduced padding for the header
                height: "40px", // Set a smaller fixed height for the header
              }}
            />
            <CardContent sx={{ backgroundColor: "#ffffff", py: 2 }}>
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
                      mb: 1
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
        <Card sx={{minWidth: "20%", boxShadow: 2, borderRadius: 2}}>
            <CardHeader
              title={
                <Typography
                  variant="overline"
                  sx={{
                    padding: "4px 8px",
                    textTransform: "uppercase", // Optional: Makes the text uppercase (can be removed)
                  }}
                >
                  Task Parameters
                </Typography>
              }
              // subheader="September 14, 2016"
              sx={{
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #ddd",
                padding: "4px 16px", // Reduced padding for the header
                height: "40px", // Set a smaller fixed height for the header
              }}
            />
            <CardContent sx={{ backgroundColor: "#ffffff", py: 2 }}>
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
