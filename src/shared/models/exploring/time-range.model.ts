export interface ITimeRange {
  from: number;
  to: number;
}
export const defaultValue: Readonly<ITimeRange> = {
  from: 0,
  to: Date.now(),
};
