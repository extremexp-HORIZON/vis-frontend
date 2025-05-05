import { useState } from "react"
import { IDataExplorationResponse } from "../../../shared/models/dataexploration.model"
import InstanceClassification from "../../Tasks/SharedItems/Plots/instance-classification"

const MOCK_DATA: IDataExplorationResponse = {
    data: [
      { feature1: 1.2, feature2: 3.4, label: "A", predicted: "A" },
      { feature1: 2.5, feature2: 1.3, label: "B", predicted: "A" },
      { feature1: 0.7, feature2: 2.9, label: "A", predicted: "A" },
      { feature1: 3.3, feature2: 3.8, label: "C", predicted: "B" },
      { feature1: 2.1, feature2: 1.9, label: "B", predicted: "B" },
    ],
    totalItems: 5,
  querySize: 5,
  columns: [
    { name: "feature1", type: "number" },
    { name: "feature2", type: "number" },
    { name: "label", type: "string" },
    { name: "predicted", type: "string" },
  ],
  }
  
const InstanceView = () => {
    const [point, setPoint] = useState<any>(null)

  const mockProps = {
    plotData: {
      data: MOCK_DATA,
      loading: false,
      error: null,
    },
    point,
    setPoint,
  }

  return <InstanceClassification {...mockProps} />
}

export default InstanceView