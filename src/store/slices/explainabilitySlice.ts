import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { FetchExplainabilityPlotPayload } from '../../shared/models/tasks/explainability.model';
import { api } from '../../app/api/api';
import type { IWorkflowPage } from './workflowPageSlice';
import type { IModelAnalysis } from '../../shared/models/tasks/model-analysis.model';
import type { IPlotModel } from '../../shared/models/plotmodel.model';

interface LoadableSection<T = unknown> {
  data?: T;
  loading: boolean;
  error: string | null;
}

// Thunk
export const fetchModelAnalysisExplainabilityPlot = createAsyncThunk(
  'explainability/fetch_plot',
  async (payload: FetchExplainabilityPlotPayload) => {
    const requestUrl = `explainability/${payload.metadata.experimentId}/${payload.metadata.workflowId}`;
    const response = await api.post<IPlotModel>(requestUrl, payload.query);

    return response.data;
  }
);

// Action
export const setSelectedFeature = createAction<{
  plotType: keyof IModelAnalysis;
  feature: string;
}>('explainability/set_selected_feature');

// Helpers
const getTask = (state: IWorkflowPage, workflowId: string) =>
  state.tab?.workflowId === workflowId ? state.tab.workflowTasks.modelAnalysis : null;

const assignResult = <T>(section: LoadableSection<T>, data: T) => {
  section.data = data;
  section.loading = false;
  section.error = null;
};

const assignError = (section: LoadableSection, message: string) => {
  section.loading = false;
  section.error = message;
};

// Reducers
export const explainabilityReducers = (builder: ActionReducerMapBuilder<IWorkflowPage>) => {
  builder
    .addCase(fetchModelAnalysisExplainabilityPlot.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;

      if (task && plotType !== 'featureNames') {
        task[plotType].loading = true;
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;

      if (task && plotType !== 'featureNames') {
        const section = task[plotType];

        if ('selectedFeature' in section) {
          section.selectedFeature = action.payload.features.feature1;
        }
        assignResult(section, action.payload);
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;

      if (task && plotType !== 'featureNames') {
        assignError(task[plotType], 'Failed to fetch data');
      }
    })
    .addCase(setSelectedFeature, (state, action) => {
      const task = state.tab?.workflowTasks.modelAnalysis;
      const { plotType, feature } = action.payload;

      if (task && plotType !== 'featureNames' && plotType in task) {
        const section = task[plotType];

        if ('selectedFeature' in section) {
          section.selectedFeature = feature;
        }
      }
    });
};
