import { useParams } from "react-router-dom";
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store";
import { useEffect } from "react";
import { fetchModelAnalysisExplainabilityPlot } from "../../../../store/slices/explainabilitySlice";
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import { Box } from "@mui/material";

const ShapPlot = () => {
    const { tab, isTabInitialized } = useAppSelector(
        (state: RootState) => state.workflowPage,
      );
    const { experimentId } = useParams();
    const dispatch = useAppDispatch();
    const plotModel = tab?.workflowTasks.modelAnalysis?.shap;

      useEffect(() => {
        console.log('shap')
        if (tab && experimentId) {
          dispatch(
            fetchModelAnalysisExplainabilityPlot({
              query: {
                ...explainabilityQueryDefault,
                explanation_type: 'featureExplanation',
                explanation_method: 'shap',
              },
              metadata: {
                workflowId: tab.workflowId,
                queryCase: 'shap',
                experimentId: experimentId,
              },
            }),
          );
        }
      }, [isTabInitialized]);

      console.log(plotModel?.data);
      
      return (
        <Box>
            shap
        </Box>
      );
}

export default ShapPlot;