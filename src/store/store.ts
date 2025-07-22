import type { TypedUseSelectorHook } from 'react-redux';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { workflowPageSlice } from './slices/workflowPageSlice';
import { progressPageSlice } from './slices/progressPageSlice';
import { monitoringPageSlice } from './slices/monitorPageSlice';
import { authSlice } from './slices/authSlice';
import { datasetSlice } from './slices/exploring/datasetSlice';
import { mapSlice } from './slices/exploring/mapSlice';
import { chartSlice } from './slices/exploring/chartSlice';
import { statsSlice } from './slices/exploring/statsSlice';
import { timeSeriesSlice } from './slices/exploring/timeSeriesSlice';
import { forecastingSlice } from './slices/exploring/forecastingSlice';
import { dataSourceSlice } from './slices/exploring/datasourceSlice';
import { listenerMiddleware, startAppListening } from './listenerMiddleware';
import { mapListeners } from './slices/exploring/mapSlice';
import { datasetUiListeners } from './slices/exploring/datasetSlice';
import { chartListeners } from './slices/exploring/chartSlice';
import { timeSeriesListeners } from './slices/exploring/timeSeriesSlice';

export const store = configureStore({
  reducer: {
    workflowPage: workflowPageSlice.reducer,
    progressPage: progressPageSlice.reducer,
    monitorPage: monitoringPageSlice.reducer,
    auth: authSlice.reducer,
    dataset: datasetSlice.reducer,
    map: mapSlice.reducer,
    chart: chartSlice.reducer,
    stats: statsSlice.reducer,
    timeSeries: timeSeriesSlice.reducer,
    forecasting: forecastingSlice.reducer,
    dataSource: dataSourceSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Register listeners
chartListeners(startAppListening);
datasetUiListeners(startAppListening);
mapListeners(startAppListening);
timeSeriesListeners(startAppListening);
