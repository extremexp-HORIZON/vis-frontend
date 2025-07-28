import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { FetchExplainabilityPlotPayload, FetchFeatureImportancePlotPayload } from '../../shared/models/tasks/explainability.model';
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

export const fetchModelAnalysisFeatureImportancePlot = createAsyncThunk(
  'explainability/fetch_feature_importance',
  async (payload: FetchFeatureImportancePlotPayload) => {
    const requestUrl = `explainability/${payload.metadata.experimentId}/${payload.metadata.workflowId}/feature-importance`;
    const response = await api.post<IPlotModel>(requestUrl, payload.query);

    return response.data;
  }
);

// Action
export const setSelectedFeature = createAction<{
  plotType: keyof IModelAnalysis;
  feature: string;
}>('explainability/set_selected_feature');

export const setSelectedFeatures2D = createAction<{
  feature1: string;
  feature2: string;
}>('explainability/set_selected_features_2d');

export const setGcfSize = createAction<number>('modelAnalysis/setGcfSize');
export const setCfMethod = createAction<string>('modelAnalysis/setCfMethod');
export const setActionChoiceStrategy = createAction<string>('modelAnalysis/setActionChoiceStrategy');


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

      if (task && plotType !== 'featureNames' && plotType !== 'global_counterfactuals_control_panel') {
        task[plotType].loading = true;
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;

      if (task && plotType !== 'featureNames' && plotType !== 'global_counterfactuals_control_panel') {
        const section = task[plotType];

        if ('selectedFeature' in section) {
          section.selectedFeature = action.payload.features.feature1;
        } else if ('selectedFeature1' in section && 'selectedFeature2' in section) {
          section.selectedFeature1 = action.payload.features.feature1;
          section.selectedFeature2 = action.payload.features.feature2;
        }
        assignResult(section, action.payload);
      }
    })
    .addCase(fetchModelAnalysisExplainabilityPlot.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);
      const plotType = action.meta.arg.query.explanation_method as keyof IModelAnalysis;

      if (task && plotType !== 'featureNames' && plotType !== 'global_counterfactuals_control_panel') {
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
    })
    .addCase(setSelectedFeatures2D, (state, action) => {
      const task = state.tab?.workflowTasks.modelAnalysis;
      const { feature1, feature2 } = action.payload;

      const section = task?.['2dpdp'];

      if (section && 'selectedFeature1' in section && 'selectedFeature2' in section) {
        section.selectedFeature1 = feature1;
        section.selectedFeature2 = feature2;
      }
    })
    .addCase(fetchModelAnalysisFeatureImportancePlot.pending, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);

      if (task) {
        task.featureImportance.loading = true;
        task.featureImportance.error = null;
      }
    })
    .addCase(fetchModelAnalysisFeatureImportancePlot.fulfilled, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);

      if (task) {
        assignResult(task.featureImportance, action.payload);
      }
    })
    .addCase(fetchModelAnalysisFeatureImportancePlot.rejected, (state, action) => {
      const task = getTask(state, action.meta.arg.metadata.workflowId);

      if (task) {
        assignError(task.featureImportance, 'Failed to fetch feature importance data');
      }
    })
    .addCase(setGcfSize, (state, action) => {
      const modelAnalysis = state.tab?.workflowTasks?.modelAnalysis;
      if (modelAnalysis) {
        modelAnalysis.global_counterfactuals_control_panel.gcfSize = action.payload;
    }
    })
    .addCase(setCfMethod, (state, action) => {
    const modelAnalysis = state.tab?.workflowTasks?.modelAnalysis;
    if (modelAnalysis) {
      modelAnalysis.global_counterfactuals_control_panel.cfMethod = action.payload;
    }
    })
    .addCase(setActionChoiceStrategy, (state, action) => {
      const modelAnalysis = state.tab?.workflowTasks?.modelAnalysis;
      if (modelAnalysis) {
        modelAnalysis.global_counterfactuals_control_panel.actionChoiceStrategy = action.payload;
      }
    });
};
