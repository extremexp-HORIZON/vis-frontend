import type { IPlotModel } from '../plotmodel.model';
export interface IExplainability {
  '2dpdp': {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  pdp: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  ale: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }
  global_counterfactuals: {
    data: IPlotModel | null
    loading: boolean
    error: string | null
  }

  hyperparametersNames: string[]
}

export const explainabilityDefault: IExplainability = {
  // TODO: these hyperparameters names should be populated from the response
  hyperparametersNames: [],
  '2dpdp': {
    data: null,
    loading: false,
    error: null,
  },
  pdp: {
    data: null,
    loading: false,
    error: null,
  },
  ale: {
    data: null,
    loading: false,
    error: null,
  },
  global_counterfactuals: {
    data: null,
    loading: false,
    error: null,
  },
};

export type IHyperparameters = {
  [key: string]: {
    metric_value: number
    hyperparameter: { values: string; type: string }
  }
}

export type ExplainabilityQuery = {
  explanation_type?: string
  explanation_method?: string
  feature1?: string
  feature2?: string
  query?: string
  gcf_size?: number
  cf_generator?: string
  cluster_action_choice_algo?: string
}

export const explainabilityQueryDefault: ExplainabilityQuery = {
  explanation_type: '',
  explanation_method: '',
  feature1: '',
  feature2: '',
  query: '',
  gcf_size: 0,
  cf_generator: '',
  cluster_action_choice_algo: '',
};

export type FetchExplainabilityPlotPayload = {
  query: ExplainabilityQuery
  metadata: {
    workflowId: string
    queryCase: string | undefined
    experimentId: string
  }
}

export const fetchExplainabilityPlotPayloadDefault: FetchExplainabilityPlotPayload =
  {
    query: explainabilityQueryDefault,
    metadata: {
      workflowId: '',
      queryCase: '',
      experimentId: ''
    },
  };
