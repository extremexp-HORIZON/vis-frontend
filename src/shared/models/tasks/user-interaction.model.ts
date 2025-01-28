import { PayloadAction } from "@reduxjs/toolkit"
import { IWorkflowTab } from "../../../store/slices/workflowTabsSlice"

export interface IUserInteraction {
  url: string
}

export const userInteractionDefault: IUserInteraction = {
  url: "",
}

export const additionalReducers = {
  setUrl: (state: IWorkflowTab, action: PayloadAction<{ url: string, workflowId: any }>) => {
    const userInteractionTaskFound = state.tabs.find(
      tab => tab.workflowId === action.payload.workflowId
    )?.workflowTasks?.userInteraction;
    if (userInteractionTaskFound) {
        userInteractionTaskFound.url = action.payload.url;
    }
  },
};