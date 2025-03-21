import { Box } from "@mui/material"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ParallelCoordinatePlot from "./ParalleleCoodrinates/parallel-coordinate-plot"
import WorkflowTable from "./WorkFlowTables/workflow-table"
import ScheduleTable from "./WorkFlowTables/schedule-table"

const MonitoringPage = () => {
    const [visibleTable, setVisibleTable] = useState<string>("workflows")
    const navigate = useNavigate()
    const { experimentId } = useParams()

      const handleChange =
      (newValue: number | string | null) => (event: React.SyntheticEvent) => {
        const queryParams = new URLSearchParams()
    
        if (newValue !== null) queryParams.append("workflowId", newValue.toString())
    
        navigate(`/${experimentId}/workflow?${queryParams.toString()}`)
        window.scrollTo(0, 0)
      }
    
      const handleTableChange = (newTable: string) => (event: React.SyntheticEvent) => {
        setVisibleTable(newTable)
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
                    <WorkflowTable visibleTable={visibleTable} handleChange={handleChange} handleTableChange={handleTableChange} /> :  
                    <ScheduleTable visibleTable={visibleTable} handleTableChange={handleTableChange}/>
                  }
                </Box>
            </Box>
            
        </>
    )
}

export default MonitoringPage