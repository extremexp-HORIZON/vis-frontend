import ResponsiveCardTable from "../../shared/components/responsive-card-table"

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
    <ResponsiveCardTable title="User Interactive Task">
      <iframe src={normalizedUrl} width="100%" height="500px" />
    </ResponsiveCardTable>
  )
}

export default UserInteractiveTask
