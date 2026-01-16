export interface ITimeRange {
  from: number;
  to: number | null;
}
export const defaultValue: Readonly<ITimeRange> = {
  from: 0,
  to: null,
};
