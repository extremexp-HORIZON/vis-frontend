
import ResponsiveCardTable from "../../shared/components/responsive-card-table"

interface UserInteractiveTaskProps {
  url: string
}

const UserInteractiveTask = (props: UserInteractiveTaskProps) => {
  const { url } = props
    
  return (
    <ResponsiveCardTable title="User Interactive Task">
          <iframe src={url} width="100%" height="500px" />
        </ResponsiveCardTable>
     
  )
}

export default UserInteractiveTask
