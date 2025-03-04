import { ViewListener, Vega } from "react-vega"
import { scheme } from "vega"
import vegaTooltip from "vega-tooltip"
import { Axis, Item, Scale } from "vega-typings/types"

interface ParallelCoordinateVegaProps {
  parallelData: React.MutableRefObject<any[]>
  progressParallel: { selected: string }
  foldArray: React.MutableRefObject<string[]>
}

const ParallelCoordinateVega = ({
  parallelData,
  progressParallel,
  foldArray,
}: ParallelCoordinateVegaProps) => {
  const processedData = parallelData.current.map(item => {
    const newItem = { ...item }
    for (const key in newItem) {
      if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].join(",") // Convert array to a comma-separated string
      }
    }
    return newItem
  })

  const handleNewView: ViewListener = (view: any) => {
    if (!view) return
    // Create tooltip handler with more precise positioning options
    const tooltipHandler = vegaTooltip(view, {
      formatTooltip: datum => {
        const table = document.createElement("table")
        Object.entries(datum).forEach(([key, value]) => {
          const row = table.insertRow()
          const keyCell = row.insertCell()
          const valueCell = row.insertCell()
          keyCell.innerHTML = key
          valueCell.innerHTML = ` <strong>${value}</strong>`
        })
        return table.outerHTML
      },
    })

    // Manually trigger tooltip on line mark hover (otherwise only triggered on intersections)
    var isTooltipVisible = false
    view.addEventListener("mousemove", (event: any) => {
      const hover = view.signal("hover")

      if (hover) {
        tooltipHandler.call(view, event, {} as Item, hover)
        isTooltipVisible = true
      } else if (isTooltipVisible) {
        hideTooltip()
      }
    })
    window.addEventListener("scroll", () => {
      if (isTooltipVisible) {
        hideTooltip()
      }
    })

    function hideTooltip() {
      // To hide tooltip, simulate an empty/null value
      tooltipHandler.call(view, new MouseEvent("mousemove"), {} as Item, null)
      isTooltipVisible = false
    }
  }

  const columnNames = [...foldArray.current, progressParallel.selected]

  // generate scales:
  const selectedLastColumnMin = Math.min(
    ...parallelData.current.map((d: any) => d[progressParallel.selected]),
  )
  const selectedLastColumnMax = Math.max(
    ...parallelData.current.map((d: any) => d[progressParallel.selected]),
  )
  const generatedScales: Scale[] = [
    {
      name: "ord",
      type: "point",
      range: "width",
      round: true,
      domain: { data: "columnNames", field: "data" },
    },
    {
      name: progressParallel.selected,
      type: "linear",
      range: "height",
      domain: {
        data: "mydata",
        field: progressParallel.selected,
      },
      domainMin: selectedLastColumnMin,
      domainMax: selectedLastColumnMax,
    },
    {
      name: "selectedLastColumnColorScale",
      type: "linear",
      domain: { data: "mydata", field: progressParallel.selected },
      domainMin: selectedLastColumnMin,
      domainMax: selectedLastColumnMax,
      range: [
        scheme("category20")[0],
        scheme("category20")[1],
        scheme("category20")[5],
        scheme("category20")[2],
      ],
    },
  ]
  for (const columnName of foldArray.current) {
    generatedScales.push({
      name: columnName,
      type: "point",
      range: "height",
      domain: { data: "mydata", field: columnName },
      padding: 0.3,
    })
  }
  // Generate axes
  const generatedAxes: Axis[] = []
  for (const columnName of columnNames) {
    generatedAxes.push({
      orient: "left",
      scale: columnName,
      title: columnName,
      offset: { scale: "ord", value: columnName, mult: -1 },
    })
  }

  return (
    <Vega
      actions={false}
      onNewView={handleNewView}
      style={{ width: "100%" }}
      spec={{
        height: 300,
        padding: 15,
        autosize: { type: "fit", contains: "padding" }, // Ensure the chart adjusts to container size
        config: {
          axisY: {
            titleY: -12,
            titleX: 10,
            titleAngle: 0,
            titleFontWeight: "lighter",
            zindex: 3,
          },
        },
        data: [
          {
            name: "mydata",
            values: processedData,
          },
          {
            name: "columnNames",
            values: columnNames,
          },
          {
            name: "gradientData",
            transform: [
              {
                type: "sequence",
                start: selectedLastColumnMin,
                stop: selectedLastColumnMax,
                step: 0.001,
              },
            ],
          },
        ],
        signals: [
          {
            name: "hover",
            value: null,
            on: [
              {
                events: "@oneDataLine:mouseover",
                update: "group().datum", // send data from the group object, not only line
              },
              { events: "@oneDataLine:mouseout", update: "null" },
            ],
          },
          {
            name: "width",
            init: "containerSize()[0]",
            on: [{ events: "window:resize", update: "containerSize()[0]" }],
          },
        ],

        scales: generatedScales,
        axes: generatedAxes,
        marks: [
          {
            name: "dataLines",
            type: "group",
            role: "frame",
            interactive: true,
            from: { data: "mydata" },
            marks: [
              {
                name: "oneDataLine",
                type: "line",
                from: { data: "columnNames" },
                encode: {
                  enter: {
                    x: { scale: "ord", field: "data" },
                    y: {
                      scale: { datum: "data" },
                      field: { parent: { datum: "data" } },
                    },
                    stroke: {
                      scale: "selectedLastColumnColorScale",
                      field: { parent: progressParallel.selected },
                    },
                    interpolate: { value: "natural" },
                  },
                  update: {
                    strokeWidth: { value: 2 },
                    zindex: { value: 1 },
                    strokeOpacity: { value: 0.5 },
                  },
                  hover: {
                    strokeWidth: { value: 5 },
                    cursor: { value: "pointer" },
                    strokeOpacity: { value: 1 },
                    zindex: { value: 2 },
                  },
                },
              },
            ],
          },
          {
            name: "colourRect",
            type: "rect",
            from: { data: "gradientData" },
            encode: {
              enter: {
                x: { signal: "width" },
                y: {
                  scale: progressParallel.selected,
                  field: "data",
                  offset: -3,
                },
                width: { value: 30 },
                height: { value: 3 },
                fill: {
                  scale: "selectedLastColumnColorScale",
                  field: "data",
                },
              },
            },
          },
        ],
      }}
    />
  )
}
export default ParallelCoordinateVega
