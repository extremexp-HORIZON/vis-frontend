import ResponsiveCardTable from "../../shared/components/responsive-card-table"
import { Box } from "@mui/material"

interface UserInteractiveTaskProps {
  url: string
}

const UserInteractiveTask = (props: UserInteractiveTaskProps) => {
  const { url } = props
  const normalizedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `http://${url}`

  return (
    <Box sx={{ height: 500, width: '100%' }}>
    <ResponsiveCardTable title="User Interactive Task">
      <Box style={{height: '100%', width: '100%'}}>
        <iframe src={normalizedUrl} height='100%' width='100%'/>
      </Box>
    </ResponsiveCardTable>
    </Box>
  )
}

export default UserInteractiveTask
