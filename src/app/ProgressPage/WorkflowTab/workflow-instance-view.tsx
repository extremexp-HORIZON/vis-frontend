import { useEffect, useState } from "react"
import InstanceClassification from "../../Tasks/SharedItems/Plots/instance-classification"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import {
  getLabelTestInstances,
} from "../../../shared/models/tasks/model-analysis.model"
import CounterfactualsTable from "../../Tasks/SharedItems/Tables/counterfactuals-table"
import { useParams } from "react-router-dom"

const InstanceView = () => {
  const [point, setPoint] = useState<any | null>(null)
  const dispatch = useAppDispatch()
  const experimentId = useParams().experimentId
  const { tab, isTabInitialized } = useAppSelector(
    (state: RootState) => state.workflowPage,
  )
  const workflow = tab?.workflowTasks.modelAnalysis?.counterfactuals

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
