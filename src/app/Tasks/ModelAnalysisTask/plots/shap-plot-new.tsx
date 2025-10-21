import { useParams } from "react-router-dom";
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store";
import { useEffect } from "react";
import { fetchModelAnalysisExplainabilityPlot } from "../../../../store/slices/explainabilitySlice";
import { explainabilityQueryDefault } from '../../../../shared/models/tasks/explainability.model';
import { Box } from "@mui/material";
import ClosableCardTable from "../../../../shared/components/closable-card-table";
import { TestInstance } from "../../../../shared/models/tasks/model-analysis.model";

interface ShpaPlotProps {
    shapPoint: TestInstance
    onClose: () => void
}

const ShapPlot = (shapPlotProps: ShpaPlotProps) => {
    const {shapPoint, onClose} = shapPlotProps;
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
      console.log(shapPoint.id)
      
      return (
        <Box sx={{height: '100%'}}>
            <ClosableCardTable
                details={ tab?.workflowTasks.modelAnalysis?.shap?.data?.plotDescr}
                title={'shap values'}
                onClose={onClose}
                noPadding={true}
            >
                shap
            </ClosableCardTable>

        </Box>
      );
}

export default ShapPlot;