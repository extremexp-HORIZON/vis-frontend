import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import { useAppSelector } from "../../../../store/store"

export const MetricBulletChart = () => {
    const { tab } = useAppSelector(state => state.workflowPage)

    const metricData = {
        title: tab?.dataTaskTable.selectedItem?.data?.name,
        value: tab?.dataTaskTable.selectedItem?.data?.value,
        average: tab?.dataTaskTable.selectedItem?.data?.avgValue,
        min: tab?.dataTaskTable.selectedItem?.data?.minValue,
        max: tab?.dataTaskTable.selectedItem?.data?.maxValue,
    }

    const bulletChartSpec = {
        data: { values: metricData },
        encoding: {
          y: {
            field: "title",
            type: "ordinal",
            axis: {
              title: null,
              labelFontWeight: "bold",
              labelFontSize: 12,
            },
          },
        },
        layer: [
          // Background range (min to max)
          {
            mark: "bar",
            encoding: {
              x: { field: "min", type: "quantitative" },
              x2: { field: "max" },
              color: { value: "#eeeeee" },
            },
          },
          // Average range
          {
            mark: "bar",
            encoding: {
              x: { field: "average", type: "quantitative" },
              x2: { field: "max" },
              color: { value: "#cccccc" },
            },
          },
          // Actual value
          {
            mark: {
              type: "bar",
              color: "#1e88e5",
              size: 10,
            },
            encoding: {
              x: { field: "value", type: "quantitative" },
              tooltip: [
                { field: "title", type: "ordinal" },
                { field: "value", type: "quantitative" },
                { field: "average", type: "quantitative" },
                { field: "min", type: "quantitative" },
                { field: "max", type: "quantitative" },
              ],
            },
          },
          // Marker for average
          {
            mark: {
              type: "tick",
              color: "black",
              size: 15,
              thickness: 2,
            },
            encoding: {
              x: { field: "average", type: "quantitative" },
            },
          },
        ],
        config: {
          axis: {
            grid: false,
          },
        },
      }
    
      return (
        <ResponsiveCardVegaLite
          title="Performance Overview"
          spec={bulletChartSpec}
          aspectRatio={2}
          maxHeight={400}
          actions={false}
        />
      )
}