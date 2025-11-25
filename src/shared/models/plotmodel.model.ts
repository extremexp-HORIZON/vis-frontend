import type { Axis, Features } from './initialization.model';
import type { ShapContributions } from './tasks/explainability.model';

export interface IPlotModel {
    explainabilityType: 'featureExplanation' | 'hyperparameterExplanation' | 'experimentExplanation';
    explanationMethod: 'ale' | 'pdp' | '2dpdp' | 'counterfactuals' | 'influenceFunctions' | 'segmentation' | 'shap' | 'feature_importance';
    explainabilityModel: string;
    plotName: string;
    plotDescr: string;
    plotType: string;
    features: Features;
    featureList: string[];
    hyperparameterList: string[];
    xAxis: Axis;
    yAxis: Axis;
    zAxis: Axis;
    tableContents: ITableContents;
    TotalCost: number;
    TotalEffectiveness: number;
    actions: ITableContents;
    affectedClusters: IAffectedClusters;
    effCostActions: IEffCostActions;
    featuresTable: ITableContents;
    attributionsTable: ITableContents;
    targetsTable: ITableContents;
    featuresTableColumns: string[];
    attributionsTableColumns: string[];
    targetsTableColumns: string[];
    shapContributions: ShapContributions[];
    availableIndices: number[];
  }

export interface ITableContents {
    [key: string]: IValues
  }

  interface IValues {
    values: string[];
    index: number;
  }

export interface IAction {
    [key: string]: ITableContents;
  }

export interface IAffectedClusters {
    [key: string]: IClusterData;
  }

export interface IClusterData {
    clusterName: string;
    data: Record<string, number | string>;
  }

export interface IEffCostActions {
    [key: string]: {
      cost: number;
      eff: number;
      actions: Record<string, unknown>;
    };
  }
