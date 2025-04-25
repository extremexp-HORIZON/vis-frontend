import type { TypedUseSelectorHook} from "react-redux";
import { useDispatch, useSelector } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { dataExplorationSlice } from "./slices/dataExplorationSlice"
import { workflowPageSlice } from "./slices/workflowPageSlice"
import { progressPageSlice } from "./slices/progressPageSlice"
import { monitoringPageSlice } from "./slices/monitorPageSlice"
import { authSlice } from "./slices/authSlice"

export const store = configureStore({
  reducer: {
    dataExploration: dataExplorationSlice.reducer,
    workflowPage: workflowPageSlice.reducer,
    progressPage: progressPageSlice.reducer,
    monitorPage: monitoringPageSlice.reducer,
    auth: authSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
