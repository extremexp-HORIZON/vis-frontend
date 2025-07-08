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
import { listenerMiddleware } from './listenerMiddleware';
import { mapListeners } from './slices/exploring/mapSlice';
import { startAppListening } from './listenerMiddleware';

export const store = configureStore({
  reducer: {
    workflowPage: workflowPageSlice.reducer,
    progressPage: progressPageSlice.reducer,
    monitorPage: monitoringPageSlice.reducer,
    auth: authSlice.reducer,
    dataset: datasetSlice.reducer,
    map: mapSlice.reducer,
    chart: chartSlice.reducer,
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
mapListeners(startAppListening);
