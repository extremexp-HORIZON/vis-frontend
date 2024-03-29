import { ISeriesData } from "./series-data.model";

export interface ISeries {
    name: String,
    data: ISeriesData[],
}