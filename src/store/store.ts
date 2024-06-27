import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { explainabilitySlice } from "./slices/explainabilitySlice"
import { dataExplorationSlice } from "./slices/dataExplorationSlice"
import { workflowTabsSlice } from "./slices/workflowTabsSlice"

export const store = configureStore({
  reducer: {
    explainability: explainabilitySlice.reducer,
    dataExploration: dataExplorationSlice.reducer,
    workflowTabs: workflowTabsSlice.reducer,
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
