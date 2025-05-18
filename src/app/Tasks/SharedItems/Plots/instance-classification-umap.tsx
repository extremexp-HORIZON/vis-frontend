
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import _ from "lodash"
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material"
import ResponsiveCardVegaLite from "../../../../shared/components/responsive-card-vegalite"
import Loader from "../../../../shared/components/loader"
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchUmap } from "../../../../shared/models/tasks/data-exploration-task.model"

interface Umapi {
  
  point: any
  showMisclassifiedOnly: boolean
  setPoint: Dispatch<SetStateAction<any>>
  hashRow: (row: any) => string
}

const InstanceClassificationUmap = (props: Umapi) => {
  const theme = useTheme()
  const { setPoint, point, showMisclassifiedOnly, hashRow } = props
    const tab = useAppSelector((state: RootState) => state.workflowPage.tab)
    const raw = tab?.workflowTasks.modelAnalysis?.modelInstances.data
    const parsedData = typeof raw === "string" ? JSON.parse(raw) : raw
      const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"))
    
    
  const dispatch = useAppDispatch()
  
    useEffect(() => {
      if (raw) {
        // Ensure payload is proper 2D array of numbers
        const umapPayload = parsedData.map((row: { [s: string]: unknown } | ArrayLike<unknown>) =>
          Object.values(row).map(val => parseFloat(val as string)),
        )
  
        dispatch(
          fetchUmap({
            data: umapPayload.slice(0, 2000), // Limit to first 1000 rows
            metadata: {
              workflowId: tab?.workflowId,
              queryCase: "umap",
            },
          }),
        )
      }
    }, [raw, dispatch])
  const getVegaData = (data: any[]) => {
    return data.map((originalRow: any) => {
      const id = hashRow(originalRow)
      const isMisclassified = originalRow.actual !== originalRow.predicted
      return {
        ...originalRow,
        isMisclassified,
        id,
      }
    })
  }



const umapResult = tab?.workflowTasks.dataExploration?.umap?.data ?? []
const combinedPlotData = umapResult.map((point: number[], index: number) => {
  const original = parsedData[index]
  const actual = original?.actual ?? "?"
  const predicted = original?.predicted ?? "?"
  return {
    x: point[0],
    y: point[1],
    actual,
    predicted,
    index,
  }
})


  

const handleNewView = (view: any) => {
  view.addEventListener("click", (event: any, item: any) => {
    if (item && item.datum?.isMisclassified) {
      const clickedIndex = item.datum.index;
      const originalRow = parsedData[clickedIndex]; // This is the row you want

      const id = hashRow(originalRow);
      const { actual, predicted, ...rest } = originalRow;

      setPoint({
        id,
        data: {
          ...rest,
          "label":actual,
          predicted,
          // index: clickedIndex,
        },
      });
    } else {
      setPoint(null);
    }
  });
};

  const info = (
    <Loader/>
  )
  const shouldShowInfoMessage = tab?.workflowTasks.dataExploration?.umap.loading && !tab?.workflowTasks.dataExploration?.umap.data
    // console.log("InstanceClassification plotData", plotData)
    // console.log("getVegaData(plotData?.data ?? [])", getVegaData(plotData?.data ?? []))
  return (
    <ResponsiveCardVegaLite
      spec={{
        width: "container",
        height: "container",
        autosize: { type: "fit", contains: "padding", resize: true },
        data: {
          values: getVegaData(combinedPlotData ?? []),
        },
        params: [
          {
            name: "pts",
            select: { type: "point", toggle: false },
            bind: "legend",
          },
          {
            name: "highlight",
            select: { type: "point", on: "click", clear: "clickoff",    fields: ["isMisclassified"],
            },
            value: { isMisclassified: true }

          },
          {
            name: "panZoom",
            select: "interval",
            bind: "scales",
          },
        ],
        mark: {
          type: "point",
          filled: true,
          size: 100,
        },

        encoding: {
             x: { field: "x", type: "quantitative",axis: { title:null } },
      y: { field: "y", type: "quantitative",axis: { title:null } },
        
          color: showMisclassifiedOnly
            ? {
              field: "isMisclassified",
              type: "nominal",
              scale: {
                domain: [false, true],
                range: ["#cccccc", "#ff0000"],
              },
              legend: {
                title: "Misclassified",
                labelExpr: "datum.label === 'true' ? 'Misclassified' : 'Correct'",
              },
            }
            : {
              field: "predicted", 
              type: "nominal",
              scale: {
                range: ["#1f77b4", "#2ca02c"],
              },
              legend: {
                title: "Predicted Class",
              },
            },
          opacity: showMisclassifiedOnly
            ? {
              field: "isMisclassified",
              type: "nominal",
              scale: {
                domain: [false, true],
                range: [0.45, 1.0],
              },
            }
            : {
              value: 0.8,
            },
            size: showMisclassifiedOnly?{
              field: "isMisclassified",
              type: "nominal",
              scale: {
                domain: [false, true],
                range: [60, 200],
                legend: false
              },
            }:
            {
              value: 100,
            },
       
          tooltip: [
            { field: "actual", type: "nominal", title: "Actual" },
            { field: "predicted", type: "nominal", title: "Predicted" },
          
          ]
        },
      }}
      title={"Instance Classification Umap"}
      actions={false}
      onNewView={handleNewView}
      infoMessage={info}
      showInfoMessage={shouldShowInfoMessage}
          aspectRatio={isSmallScreen ? 2.8 : 1.8}
      maxHeight={480}
      isStatic={true}


       
    />
  )
}

export default InstanceClassificationUmap
