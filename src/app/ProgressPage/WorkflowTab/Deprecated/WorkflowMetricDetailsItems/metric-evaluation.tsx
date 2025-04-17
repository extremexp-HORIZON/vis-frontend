import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Paper, Tooltip, Checkbox, FormControlLabel, Autocomplete, TextField } from "@mui/material";
import { VegaLite } from "react-vega";
import InfoIcon from "@mui/icons-material/Info";
import grey from "@mui/material/colors/grey";
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
 
interface Metric {
  name: string;
  value: number;
  avgDiff: number;
  avgValue: number;
}
 
interface IMetricEvaluation {
  availableMetrics: Metric[] | null;
  workflowId: number | string;
}
 
const MetricEvaluation = (props: IMetricEvaluation) => {
  const { availableMetrics, workflowId } = props;
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(availableMetrics || []);
  const [radarData, setRadarData] = useState<any[]>(availableMetrics || []);
  const [experimentAverage, setExperimentAverage] = useState<any[]>(availableMetrics || []);
 
  const handleMetricChange = (event: any, newValue: Metric[]) => {
    setSelectedMetrics(newValue);
  };
  
  window.dispatchEvent(new Event('resize'))
 
  useEffect(() => {
    setRadarData(selectedMetrics.map(metric => ({
      key: metric.name,
      value: metric.value.toFixed(3),
      category: `Workflow ${workflowId}`,
    })));
    setExperimentAverage(selectedMetrics.map(metric => ({
      key: metric.name,
      value: metric.avgValue.toFixed(3),
      category: "Experiments Average",
    })));
  }, [availableMetrics, selectedMetrics]);
 
  return (
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{ borderRadius: 4, width: "100%", display: "flex", flexDirection: "column", minHeight: "300px" }}
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
        <Box sx={{ px: 1, py: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
 
          {availableMetrics && (

            <Autocomplete
              multiple
              options={availableMetrics}
              getOptionLabel={(option) => option.name}
              value={selectedMetrics}
              onChange={handleMetricChange}
              size='small'
              renderInput={(params) => <TextField {...params} label="Select Metrics" />}
            />
          )}
          { radarData.some(data => data.value !== 'NaN') ? (
          <VegaLite
            actions={false}
            style={{ width: "max-content" }}
            spec={{
              width: 500,
              height: 500,
              padding: 30,
              autosize: { type: "none", contains: "padding" },
              signals: [{ name: "radius", update: "width / 2" }],
              data: [
                {
                  name: "table",
                  values: [...radarData, ...experimentAverage],
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
                  range: { signal: "[0, radius-5]" },
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
                  orient: "top",
                  title: "",
                  encode: {
                    legend: { update: { x: { value: 300 }, y: { value: -300 } } },
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
                          strokeWidth: { value: 5 },
                          fill: { scale: "color", field: "category" },
                          fillOpacity: { value: 0.3 },
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
                          fillOpacity: { value: 1.0 },
                          strokeWidth: { value: 1 },
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
                      stroke: { value: "lightgray" },
                      strokeWidth: { value: 1 }
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
                        signal: "(radius + 5) * cos(scale('angular', datum.key))",
                      },
                      y: {
                        signal: "(radius + 5) * sin(scale('angular', datum.key))",
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
                      strokeWidth: { value: 10 },
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
                      stroke: { value: "lightgray" },
                      strokeWidth: { value: 1 },
                    },
                  },
                },
              ],
            }}
          />
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 500}}>
              <ReportProblemRoundedIcon fontSize={"large"} sx={{color: theme => theme.palette.customGrey.dark}} />
              <Typography sx={{color: theme => theme.palette.customGrey.dark}} variant={"h6"}>{"No Metric Data Available"}</Typography>
            </Box>
          )}
        </Box>  
    </Paper>
  );
};
 
export default MetricEvaluation;