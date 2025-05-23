// import type { PayloadAction } from '@reduxjs/toolkit';
// import type { IWorkflowPage } from '../../../store/slices/workflowPageSlice';

export interface IUserInteraction {
  url: string
}

export const userInteractionDefault: IUserInteraction = {
  url: '',
};

// export const additionalReducers = {
//   setUrl: (state: IWorkflowPage, action: PayloadAction<{ url: string, workflowId: any }>) => {
//     const userInteractionTaskFound = state.tab?.workflowId === action.payload.workflowId ? state.tab?.workflowTasks.userInteraction : null;
//     if (userInteractionTaskFound) {
//         userInteractionTaskFound.url = action.payload.url;
//     }
//   },
// };
