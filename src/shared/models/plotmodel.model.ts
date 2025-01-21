import { Axis, Features } from "./initialization.model";

export interface IPlotModel {
    explainabilityType: "featureExplanation" | "hyperparameterExplanation";
    explanationMethod: "ale" | "pdp" | "2dpdp" | "counterfactuals" | "influenceFunctions";
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
  }

  interface ITableContents {
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
      effectiveness: number;
      actions: Record<string, unknown>;
    };
  }


  export interface IGlovesPlotModel {
    explainabilityModel: string;
  explainabilityType: string;
  explanationMethod: string;
  featureList: string[];
  features: string[] | null;
  hyperparameterList: string[] | null;
  plotDescr: string;
  plotName: string;
  plotType: string;
  tableContents: ITableContents | null;
  totalCost: number;
  totalEffectiveness: number;
  xAxis: string[] | null;
  yAxis: string[] | null;
  zAxis: string[] | null;
  actions: IAction;
  affectedClusters: IAffectedClusters;
  effCostActions: IEffCostActions;
    
  }
