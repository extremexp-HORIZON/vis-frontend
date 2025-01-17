import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const WorkflowPlaceholder = () => {
    return (
        <Box sx={{display: "flex", height: "20rem", justifyContent: "center", alignItems: "center"}}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
                Workflow Placeholder
            </Typography>
        </Box>
    )
}

export default WorkflowPlaceholder