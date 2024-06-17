import {IPlotModel } from "./plotmodel.model";

export interface IInitialization {
  featureExplanation: {
    featureNames: string[];
    plots: {
      pdp: IPlotModel | null;
      "2dpdp": IPlotModel | null;
      ale: IPlotModel | null;
    };
    tables: {
      counterfactuals: IPlotModel | null;
      influenceFunctions: IPlotModel | null;
    };
    modelInstances: any;
    modelConfusionMatrix: any;
  };
  hyperparameterExplanation: {
    hyperparameterNames: string[];
    plots: {
      pdp: IPlotModel | null;
      "2dpdp": IPlotModel | null;
      ale: IPlotModel | null;
    };
    tables: {
      counterfactuals: IPlotModel | null;
    };
    pipelineMetrics: any;
  };
}

export interface InitializationRequest {
    modelName: string;
}

export interface Features {
  feature1: string;
  feature2: string;
}

export interface Axis {
  axisName: string;
  axisValues: string[];
  axisType: string;
}
