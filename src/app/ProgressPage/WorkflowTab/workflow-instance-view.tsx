import { useEffect, useState } from "react"
import InstanceClassification from "../../Tasks/SharedItems/Plots/instance-classification"
import type { RootState} from "../../../store/store";
import { useAppDispatch, useAppSelector } from "../../../store/store"
import {
  getLabelTestInstances,
} from "../../../shared/models/tasks/model-analysis.model"
import CounterfactualsTable from "../../Tasks/SharedItems/Tables/counterfactuals-table"
import { useParams } from "react-router-dom"
import { fetchUmap } from "../../../shared/models/tasks/data-exploration-task.model"
import Uchart from "../../Tasks/DataExplorationTask/Charts/data-exploration-u-chart"

const InstanceView = () => {
  const [point, setPoint] = useState<any | null>(null)
  const dispatch = useAppDispatch()
  const experimentId = useParams().experimentId
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )
  const workflow = tab?.workflowTasks.modelAnalysis?.counterfactuals
  const instances=tab?.workflowTasks.modelAnalysis?.modelInstances.data

  useEffect(() => {
    if (tab) {
      
      dispatch(
        getLabelTestInstances({
          experimentId: experimentId || "",
          runId: tab?.workflowId,
        }),
      )
    }
  }, [isTabInitialized])


  // useEffect(() => {
  //   if (instances ) {
  //     const raw = instances
  // const parsedData = typeof raw === "string" ? JSON.parse(raw) : raw
  //     // Ensure payload is proper 2D array of numbers
  //     const umapPayload = parsedData.map((row: { [s: string]: unknown } | ArrayLike<unknown>) =>
  //       Object.values(row).map(val => parseFloat(val as string)),
  //     )

  //     dispatch(
  //       fetchUmap({
  //         data: umapPayload,
  //         metadata: {
  //           workflowId: tab?.workflowId,
  //           queryCase: "umap",
  //         },
  //       }),
  //     )
  //   }
  // }, [instances])

  return (
    <>
      <InstanceClassification
        plotData={tab?.workflowTasks.modelAnalysis?.modelInstances ?? null}
        point={point}
        setPoint={setPoint}
      />
     

      {point && workflow && (
        <CounterfactualsTable
          key={`counterfactuals-table`}
          point={point}
          handleClose={() => setPoint(null)}
          counterfactuals={workflow || null}
          experimentId={"I2Cat_phising"}
          workflowId={"1"}
        />
      )}
    </>
  )
}

export default InstanceView
