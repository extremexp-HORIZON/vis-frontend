import { Box, useMediaQuery, useTheme } from "@mui/material";
import ResponsiveCardVegaLite from "../shared/components/responsive-card-vegalite"
import type { RootState} from "../store/store";
import { useAppSelector } from "../store/store"

interface DensityDataPoint {
  paramName: string;
  value: number;
}

const WorkflowParameterDistribution = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage)
  const { tab } = useAppSelector(state => state.workflowPage)
  const selectedParam = tab?.dataTaskTable.selectedItem?.data?.name
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
  

  const getData = (param: string) => {
    const completedWorkflows = workflows.data.filter(
      workflow =>
        workflow.params &&
        workflow.status !== "SCHEDULED"
    )
  
    const paramWorkflows = completedWorkflows
      .map(workflow => {
        const value = Number(workflow.params?.find(p => p.name === param)?.value)
        return isNaN(value)
          ? null
          : { paramName: param, value }
      })
      .filter(Boolean) as { paramName: string; value: number }[]
      return paramWorkflows
    }


  if (!selectedParam) return null
  const data: DensityDataPoint[] = getData(selectedParam)
  if (data?.length === 0) return null

  const spec = {
    config: {
      axisBand: {
        bandPosition: 1,
        tickExtra: false,
        tickOffset: 0,
      },
    },
    signals: [
      { name: "plotWidth", update: "(width - 50)/3" },
      { name: "trim", value: false },
      { name: "bandwidth", value: 0.1 },
      { name: "kdeExtentMin", update: "kdeExtent[0]" },
      { name: "kdeExtentMax", update: "kdeExtent[1]" },
    ],
    data: [
      {
        name: "dummyData",
        values: data,
      },
      {
        name: "statsExtent",
        source: "dummyData",
        transform: [
          {
            type: "extent",
            field: "value",
            signal: "kdeExtent",
          },
        ],
      },
      {
        name: "density",
        source: "dummyData",
        transform: [
          {
            type: "kde",
            field: "value",
            groupby: ["paramName"],
            bandwidth: { signal: "bandwidth" },
            extent: { signal: "trim ? null : [kdeExtentMin, kdeExtentMax]" },
          },
        ],
      },
      {
        name: "stats",
        source: "dummyData",
        transform: [
          {
            type: "aggregate",
            groupby: ["paramName"],
            fields: ["value", "value", "value"],
            ops: ["q1", "median", "q3"],
            as: ["q1", "median", "q3"],
          },
        ],
      },
    ],
    scales: [
      {
        name: "layout",
        type: "band",
        range: "width",
        domain: { data: "dummyData", field: "paramName" },
      },
      {
        name: "yscale",
        type: "linear",
        range: "height",
        round: true,
        domain: { data: "dummyData", field: "value" },
        zero: false,
        nice: true,
        reverse: false,
      },
      {
        name: "hscale",
        type: "linear",
        range: [0, { signal: "plotWidth" }],
        domain: { data: "density", field: "density" },
      },
      {
        name: "color",
        type: "ordinal",
        domain: { data: "dummyData", field: "paramName" },
        range: "category",
      },
    ],
    axes: [
      { orient: "bottom", scale: "layout", zindex: 1, labelFontWeight: "bold" },
      { orient: "left", scale: "yscale", zindex: 1 },
    ],
    marks: [
      {
        type: "group",
        from: {
          facet: {
            data: "density",
            name: "violin",
            groupby: "paramName",
          },
        },
        encode: {
          enter: {
            xc: { scale: "layout", field: "paramName", band: 0.5 },
            width: { signal: "plotWidth" },
            height: { signal: "height" },
          },
        },
        data: [
          {
            name: "summary",
            source: "stats",
            transform: [
              {
                type: "filter",
                expr: "datum.paramName === parent.paramName",
              },
            ],
          },
        ],
        marks: [
          {
            type: "area",
            from: { data: "violin" },
            encode: {
              enter: {
                fill: { scale: "color", field: { parent: "paramName" } },
                orient: { value: "horizontal" },
                tooltip: {
                  signal: "'Param: ' + parent.paramName + ', Value: ' + datum.value + ', Density: ' + format(datum.density, '.2f')"
                },
              },
              update: {
                y: { scale: "yscale", field: "value" },
                xc: { signal: "plotWidth / 2" },
                width: { scale: "hscale", field: "density" },
              },
            },
          },
          {
            type: "rule",
            from: { data: "summary" },
            encode: {
              enter: {
                stroke: { value: "black" },
                strokeWidth: { value: 2 },
                tooltip: {
                  signal: "{'Param': parent.paramName, 'Q1': datum.q1, 'Q3': datum.q3}"
                }
              },
              update: {
                x: { signal: "plotWidth / 2" },
                y: { scale: "yscale", field: "q1" },
                y2: { scale: "yscale", field: "q3" }
              }
            }
          },
          {
            type: "rule",
            from: { data: "summary" },
            encode: {
              enter: {
                stroke: { value: "black" },
                strokeWidth: { value: 2 },
                tooltip: {
                  signal: "{'Param': parent.paramName, 'Median': datum.median}"
                }
              },
              update: {
                x: { signal: "plotWidth / 2 - 10" },
                x2: { signal: "plotWidth / 2 + 10" },
                y: { scale: "yscale", field: "median" }
              }
            }
          }        
        ],
      },
    ],
  }

  return (
    <Box sx={{height: "99%"}}>
      <ResponsiveCardVegaLite
        spec={spec}
        title={`Distribution of ${selectedParam} Across Workflows`}
        maxHeight={500}
        aspectRatio={isSmallScreen ? 4 : 2}
        actions={false}
      />
    </Box>
  )
}

export default WorkflowParameterDistribution
