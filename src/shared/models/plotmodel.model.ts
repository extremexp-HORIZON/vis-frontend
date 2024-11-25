import { Axis, Features } from "./initialization.model";

export interface IPlotModel {
    explainabilityType: "featureExplanation" | "hyperparameterExplanation";
    explanationMethod: "ale" | "pdp" | "2dpdp" | "counterfactuals" | "influenceFunctions";
    explainabilityModel: string;
    plotName: string;
    plotDescr: string;
    plotType: string;
    features: Features;
    featureListL: string[];
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