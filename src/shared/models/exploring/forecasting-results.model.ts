
export interface IForecastingMetric {
  evaluation: {
    MAE: number;
    MAPE: number;
    MSE: number;
    RMSE: number;
    // ...other metrics
  };
  predictions: [{ [key: string]: string | number }];
  // ...other fields
}
export interface IForecastingResults {
  target?: string;
  metrics?: Record<string, IForecastingMetric>;
}