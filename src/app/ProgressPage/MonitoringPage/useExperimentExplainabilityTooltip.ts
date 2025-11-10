import { useMemo } from 'react';
import { useAppSelector } from '../../../store/store';
import type { RootState } from '../../../store/store';
import { createExperimentExplainabilityTooltipHandler } from './experimentExplainabilityTooltip';

export const useExperimentExplainabilityTooltip = (
  xAxisName?: string, 
  yAxisName?: string,
  axisType?: string,
  selectedFeature?: string,
  selectedFeature2?: string,
) => {
  const runs = useAppSelector((state: RootState) => state.progressPage.workflows.data);
  const workflowIds = runs.map(wf => wf.id);
  const workflowColors = useAppSelector((state: RootState) => state.monitorPage.workflowsTable.workflowColors);
  const experimentId = useAppSelector((state: RootState) => state.progressPage.experiment.data?.id);
  return useMemo(() => {
    return createExperimentExplainabilityTooltipHandler({
      workflowIds,
      runs,
      workflowColors,
      xAxisName,
      yAxisName,
      axisType,
      selectedFeature,
      selectedFeature2,
      experimentId
    });
  }, [workflowIds, runs, workflowColors, xAxisName, yAxisName, axisType, selectedFeature, selectedFeature2]);
};