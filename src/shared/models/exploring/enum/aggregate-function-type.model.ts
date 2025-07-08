export const AggregateFunctionType = {
  SUM: 'SUM',
  AVG: 'AVG',
  COUNT: 'COUNT',
  MIN: 'MIN',
  MAX: 'MAX',
} as const;

export type AggregateFunctionType =
  (typeof AggregateFunctionType)[keyof typeof AggregateFunctionType];
