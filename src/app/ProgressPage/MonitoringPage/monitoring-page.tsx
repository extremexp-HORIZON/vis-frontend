import { Box } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ParallelCoordinatePlot from "./ParalleleCoodrinates/parallel-coordinate-plot"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"
import { RootState, useAppSelector } from "../../../store/store"

const MonitoringPage = () => {
    const { visibleTable } = useAppSelector(
      (state: RootState) => state.monitorPage
    )
    const navigate = useNavigate()
    const { experimentId } = useParams()

      const handleChange =
      (newValue: number | string | null) => (event: React.SyntheticEvent) => {
        const queryParams = new URLSearchParams()
    
        if (newValue !== null) queryParams.append("workflowId", newValue.toString())
    
        navigate(`/${experimentId}/workflow?${queryParams.toString()}`)
        window.scrollTo(0, 0)
      }
    
    return (
        <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
                height: "100%",
                overflow: "auto"
              }}
            >
                <Box sx={{height: "40%", px: 2}}>
                  <ParallelCoordinatePlot />
                </Box>
                <Box sx={{height: "60%", minHeight: "350px", px: 2}}>
                  {visibleTable === "workflows" ? 
                    <WorkflowTable handleChange={handleChange} /> :  
                    <ScheduleTable />
                  }
                </Box>
            </Box>
            
        </>
    )
}

export default MonitoringPage