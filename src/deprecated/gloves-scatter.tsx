import { useState, useEffect } from "react"
import type { VisualizationSpec } from "react-vega";
import { VegaLite } from "react-vega"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Switch,
  Typography,
} from "@mui/material"
import UmapComponent from "./umapComponent"

interface DataField {
  values: any[]
}

interface GlovesScatterProps {
  data1: Record<string, DataField>
  data2: { appliedAffectedActions: Record<string, DataField> }
  actions: any // Define more specific type if known
  eff_cost_actions: any
}
const GlovesScatter = ({
  data1,
  data2,
  actions,
  eff_cost_actions,
}: GlovesScatterProps) => {
  // Utility function to filter out unwanted fields for dropdown options only
  const isExcludedField = (field: string) => {
    const excludedFields = ["index", "Cluster", "Chosen_Action"]
    const actionPredictionRegex = /^Action\d+_Prediction$/
    return excludedFields.includes(field) || actionPredictionRegex.test(field)
  }

  const getColorOptions = (clusters: {}) => {
    if (!clusters) return []
    return Object.keys(clusters).filter(field =>
      /^Action\d+_Prediction$/.test(field),
    )
  }

  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [colorField, setColorField] = useState("")
  const [colorOptions, setColorOptions] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [dimensionalityReduction, setDimensionalityReduction] = useState(false)

  // Extract options from the data for dropdowns (excluding certain fields)
  const getOptions = (clusters: {}) => {
    if (!clusters) return []
    return Object.keys(clusters).filter(field => !isExcludedField(field))
  }

  // Update state whenever data1 or data2 changes
  useEffect(() => {
    const options1 = getOptions(data1)
    const options2 = getOptions(data2.appliedAffectedActions)
    const combinedOptions =
      options1.length > options2.length ? options1 : options2

    setOptions(combinedOptions as string[])
    setXAxis(combinedOptions[0] || "")
    setYAxis(combinedOptions[1] || "")
    setColorOptions(getColorOptions(data1))

    setColorField(getColorOptions(data1)[0] || "")
  }, [data1, data2])

  // Function to transform data for Vega-Lite, keeping all fields
  const transformData = (data: Record<string, DataField>) => {
    const keys = Object.keys(data)
    const length = data[keys[0]].values.length // Assume all fields have the same length
    const result = []

    for (let i = 0; i < length; i++) {
      const row: { [key: string]: any } = {}
      keys.forEach(key => {
        row[key] = data[key].values[i]
      })
      result.push(row)
    }

    return result
  }

  // Transform both data sets

  const determineType = (field: string, data: string | any[]) => {
    if (!data.length || data[0][field] === undefined) return "nominal"
    return typeof data[0][field] === "string" ? "quantitative" : "quantitative"
  }

  // Vega-Lite specifications for both plots
  const spec = (data: { id: string }[]) =>
    ({
      description: "A scatter plot of affected clusters",
      mark: "circle",
      params: [
        {
          name: "industry",
          select: { type: "point", fields: ["Chosen_Action"] },
          bind: "legend",
        },
      ],
      encoding: {
        x: { field: xAxis, type: determineType(xAxis, data) },
        y: { field: yAxis, type: determineType(yAxis, data) },
        color: {
          field: "Chosen_Action",
          type: "nominal",
          title: "Chosen Action",
        },
        tooltip: [
          { field: "Chosen_Action", type: "nominal", title: "Chosen Action" },
          { field: xAxis, type: "nominal" },
          { field: yAxis, type: "nominal" },
        ],
        opacity: {
          condition: { param: "industry", value: 1 },
          value: 0.01,
        },
      },
      data: { values: data },
    }) as VisualizationSpec

  const Colorspec = (data: { id: string }[]) => {
    return {
      description: "A scatter plot of affected clusters",
      title: "Affected Clusters",
      width: 450,
      height: 450,
      mark: { type: "point", opacity: 0.8 },
      params: [
        {
          name: "industry",
          select: { type: "point", fields: [colorField] },
          bind: "legend",
        },
      ],
      encoding: {
        x: { field: xAxis, type: determineType(xAxis, data) },
        y: { field: yAxis, type: determineType(yAxis, data) },
        color: {
          field: colorField,
          type: "nominal",
          scale: {
            domain: ["0", "1"], // Explicitly set 0 and 1 as the domain values
            range: ["red", "green"], // Explicitly set red for 0 and green for 1
          },
          title: "Prediction",
        },
        tooltip: [
          { field: xAxis, type: "nominal" },
          { field: yAxis, type: "nominal" },
          { field: colorField, type: "nominal" },
        ],
        opacity: {
          condition: { param: "industry", value: 1 },
          value: 0.01,
        },
      },
      data: { values: data },
    } as VisualizationSpec
  }

  const getEffCostForColorField = (field: string) => {
    const match = field.match(/^Action(\d+)_Prediction$/) // Extract the number from "ActionX_Prediction"
    if (match) {
      const actionNumber = match[1] // Extracted number as a string
      return eff_cost_actions[actionNumber] // Return the corresponding eff_cost_action
    }
    return null // Return null if no match
  }

  // Fetch the corresponding eff_cost_actions for the selected colorField
  const selectedEffCost = getEffCostForColorField(colorField)

  const sharedLegendSpec = (data1: any[], data2: any[]) =>
    ({
      description: "Two scatter plots with a shared legend",
      hconcat: [
        {
          title: "Action Selection",
          width: 450,
          height: 450,
          data: { values: data1 },
          mark: { type: "point", opacity: 0.8 },
          params: [
            {
              name: "industry",
              select: { type: "point", fields: ["Chosen_Action"] },
              bind: "legend",
            },
          ],
          encoding: {
            x: { field: xAxis, type: determineType(xAxis, data1) },
            y: { field: yAxis, type: determineType(yAxis, data1) },
            color: {
              field: "Chosen_Action",
              type: "nominal",
              title: "Chosen Action",
            },
            tooltip: [
              {
                field: "Chosen_Action",
                type: "nominal",
                title: "Chosen Action",
              },
              { field: xAxis, type: determineType(xAxis, data1) },
              { field: yAxis, type: determineType(yAxis, data1) },
            ],
            opacity: {
              condition: { param: "industry", value: 1 },
              value: 0.01,
            },
          },
        },
        {
          title: "Post-Action Selection",
          data: { values: data2 },
          width: 450,
          height: 450,
          mark: { type: "point", opacity: 0.8 },
          params: [
            {
              name: "industry",
              select: { type: "point", fields: ["Chosen_Action"] },
              bind: "legend",
            },
          ],
          encoding: {
            x: { field: xAxis, type: determineType(xAxis, data2) },
            y: { field: yAxis, type: determineType(yAxis, data2) },
            color: {
              field: "Chosen_Action",
              type: "nominal",
              title: "Chosen Action",
            }, // Shared legend
            tooltip: [
              {
                field: "Chosen_Action",
                type: "nominal",
                title: "Chosen Action",
              },
              { field: xAxis, type: determineType(xAxis, data2) },
              { field: yAxis, type: determineType(yAxis, data2) },
            ],
            opacity: {
              condition: { param: "industry", value: 1 },
              value: 0.01,
            },
          },
        },
      ],
    }) as VisualizationSpec

  return (
    <>
      <Box
        className="panel"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <FormControl
          variant="outlined"
          style={{ minWidth: 200, marginRight: "20px" }}
          disabled={dimensionalityReduction}
        >
          <InputLabel>X-Axis</InputLabel>
          <Select
            value={xAxis}
            onChange={e => setXAxis(e.target.value)}
            label="X-Axis"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          style={{ minWidth: 200, marginRight: "20px" }}
          disabled={dimensionalityReduction}
        >
          <InputLabel>Y-Axis</InputLabel>
          <Select
            value={yAxis}
            onChange={e => setYAxis(e.target.value)}
            label="Y-Axis"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          style={{ minWidth: 200, marginRight: "20px" }}
        >
          <InputLabel>Apply</InputLabel>
          <Select
            value={colorField}
            onChange={e => setColorField(e.target.value)}
            label="Apply"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
                  maxWidth: 300,
                },
              },
            }}
          >
            {colorOptions.map(option => {
              // Extract the part before "_Prediction"
              const displayText = option.replace(/_Prediction$/, "")
              return (
                <MenuItem key={option} value={option}>
                  {displayText}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>

        <Box display="flex" alignItems="center">
          <Typography>Enable Dimensionality Reduction</Typography>
          <Switch
            checked={dimensionalityReduction}
            onChange={() => setDimensionalityReduction(prev => !prev)}
          />
        </Box>
      </Box>
      {dimensionalityReduction ? (
        <Box textAlign="center" marginTop={3}>
          <UmapComponent data1={data1} data2={data2} colorField={colorField} />
        </Box>
      ) : (
        <div>
          {data1 && data2 && (
            <VegaLite
              spec={sharedLegendSpec(
                transformData(data1),
                transformData(data2.appliedAffectedActions),
              )}
              actions={false}
            />
          )}
          {data1 && (
            <VegaLite spec={Colorspec(transformData(data1))} actions={false} />
          )}
        </div>
      )}
    </>
  )
}

export default GlovesScatter
