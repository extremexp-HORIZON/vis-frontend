import { Box } from "@mui/material"
import React from "react"

const ChartParameters: React.FC<{ children: React.ReactNode }> = ({
  children = <></>,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        flexWrap: "wrap",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {children}
    </Box>
  )
}

export default ChartParameters
