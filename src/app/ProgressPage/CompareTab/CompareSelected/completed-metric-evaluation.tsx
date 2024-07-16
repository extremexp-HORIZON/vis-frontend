import { Box, Typography, IconButton, Paper, Tooltip } from "@mui/material"
import { VegaLite } from "react-vega"
import InfoIcon from "@mui/icons-material/Info"
import grey from "@mui/material/colors/grey"
import workflows from "../../../../shared/data/workflows.json"
import { useState } from "react"

interface Metric {
  name: string
  value: number
  avgDiff: number
}

interface IMetricEvaluation {
  availableMetrics: Metric[] | null
  workflowIds: number[]
}

const CompletedMetricEvaluation = ({ availableMetrics, workflowIds }: IMetricEvaluation) => {
  // Aggregate all radar data from multiple workflows
  const [allRadarData, setAllRadarData] = useState<any[]>([])

  workflowIds.forEach((id) => {
    const workflow = workflows.find(wf => wf.workflowId === id);
    const radarData = availableMetrics?.map(metric => {
      const value = workflow?.metrics ? workflow.metrics[metric.name as keyof typeof workflow.metrics] : 0;
      const category = `Workflow ${workflow ? workflow.workflowId : 'Unavailable'}`;
      return { key: metric.name, value, category };
    }) || [];

    setAllRadarData(prev => ([...prev, ...radarData]));
  });


  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "inherit",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${grey[400]}`,
        }}
      >
        <Typography fontSize={"1rem"} fontWeight={600}>
          {"Metrics Evaluation"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={"Description not available"}>
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
       <Box
        sx={{
          width: "98%",
          px: 1,
          py: 1,
          display: "flex",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
        }}
      >
        {allRadarData.length > 0 && <VegaLite
          actions={false}
          style={{ width: "100%" }}
          spec={{
            width: 550,
            height: 500,
            padding: 0,
            autosize: { type: "none", contains: "padding", resize: true },

            signals: [{ name: "radius", update: "width / 2" }],

            data: [
              {
                name: "table",
                values: allRadarData,
              },
              {
                name: "keys",
                source: "table",
                transform: [
                  {
                    type: "aggregate",
                    groupby: ["key"],
                  },
                ],
              },
              
            ],

            scales: [
              {
                name: "angular",
                type: "point",
                range: { signal: "[-PI, PI]" },
                padding: 0.5,
                domain: { data: "table", field: "key" },
              },
              {
                name: "radial",
                type: "linear",
                range: { signal: "[0, radius]" },
                zero: true,
                nice: true,
                domain: { data: "table", field: "value" },
                domainMin: 0,
              },
              {
                name: "color",
                type: "ordinal",
                domain: { data: "table", field: "category" },
                range: { scheme: "category10" },
              },
            ],

            legends: [
              {
                fill: "color",
                orient: "none",
                direction:"horizontal",
                title: "",
                encode: {
                  legend: { update: { x: { value: -250 }, y: { value: -255 } } },
                },
              },
            ],

            encode: {
              enter: {
                x: { signal: "radius" },
                y: { signal: "radius" },
              },
            },

            marks: [
             
              {
                type: "group",
                name: "categories",
                zindex: 1,
                from: {
                  facet: {
                    data: "table",
                    name: "facet",
                    groupby: ["category"],
                  },
                },
                marks: [
                  {
                    type: "line",
                    name: "category-line",
                    from: { data: "facet" },
                    encode: {
                      enter: {
                        interpolate: { value: "linear-closed" },
                        x: {
                          signal:
                            "scale('radial', datum.value) * cos(scale('angular', datum.key))",
                        },
                        y: {
                          signal:
                            "scale('radial', datum.value) * sin(scale('angular', datum.key))",
                        },
                        stroke: { scale: "color", field: "category" },
                        strokeWidth: { value: 2 },
                        fill: { scale: "color", field: "category" },
                        fillOpacity: { value: 0.1 },
                        //   "tooltip": {
                        //   "signal": "{'Metric': datum.key, 'Value': datum.datum.value, 'Category': datum.datum.category}"
                        // }
                      },
                    },
                  },

                  {
                    type: "text",
                    name: "value-text",
                    from: { data: "category-line" },
                    encode: {
                      enter: {
                        x: { signal: "datum.x" },
                        y: { signal: "datum.y" },
                        text: { signal: "datum.datum.value" },
                        align: { value: "center" },
                        baseline: { value: "middle" },
                        fill: { value: "black" },
                        fillOpacity: { value: 0.0 },
                        strokeWidth: { value: 0 },
                        tooltip: {
                          signal:
                            "{'Metric': datum.datum.key, 'Value': datum.datum.value, 'Category': datum.datum.category}",
                        },
                      },
                    },
                  },
                ],
              },
              {
                type: "rule",
                name: "radial-grid",
                from: { data: "keys" },
                zindex: 0,
                encode: {
                  enter: {
                    x: { value: 0 },
                    y: { value: 0 },
                    x2: { signal: "radius * cos(scale('angular', datum.key))" },
                    y2: { signal: "radius * sin(scale('angular', datum.key))" },
                    stroke: { value: "lightgrey" },
                    strokeWidth: { value: 1 },
                    
                    

                   
                  },
                },
              },
              {
                type: "text",
                name: "key-label",
                from: { data: "keys" },
                zindex: 1,
                encode: {
                  enter: {
                    x: {
                      signal: "(radius) * cos(scale('angular', datum.key))",
                    },
                    y: {
                      signal: "(radius) * sin(scale('angular', datum.key))",
                    },
                    text: { field: "key" },
                    align: [
                      {
                        test: "abs(scale('angular', datum.key)) > PI / 2",
                        value: "right",
                      },
                      {
                        value: "left",
                      },
                    ],
                    baseline: [
                      {
                        test: "scale('angular', datum.key) > 0",
                        value: "top",
                      },
                      {
                        test: "scale('angular', datum.key) == 0",
                        value: "middle",
                      },
                      {
                        value: "bottom",
                      },
                    ],
                    fill: { value: "black" },
                    fontWeight: { value: "bold" },
                    fillOpacity: { value: 1.0 },
                    strokeWidth: { value: 1 },
                    
                  },
                },
              },
              {
                type: "line",
                name: "outer-line",
                from: { data: "radial-grid" },
                encode: {
                  enter: {
                    interpolate: { value: "linear-closed" },
                    x: { field: "x2" },
                    y: { field: "y2" },
                    stroke: { value: "lightergrey" },
                    strokeWidth: { value: 1 },
                    fill: { value: "lightgrey" },
                    fillOpacity: { value: 0.1 },
                  
                    
                  },
                },
              },
            ],
          }}
        />}
      </Box> 
    </Paper>
  )
}

export default CompletedMetricEvaluation
