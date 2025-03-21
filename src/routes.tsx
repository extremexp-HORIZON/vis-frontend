import { createBrowserRouter } from "react-router-dom"
import ProgressPage from "./app/ProgressPage/progress-page";
import ErrorPage from "./error-page";
import NotFound from "./not-found";
import MonitoringPage from "./app/ProgressPage/MonitoringPage/monitoring-page";
import WorkflowTab from "./app/ProgressPage/WorkflowTab/workflow-tab";
import CompareCompleted from "./app/ProgressPage/CompareTab/CompareCompleted/compare-completed";

const routes = createBrowserRouter([
  {
    path: "/:experimentId",
    element: <ProgressPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/monitoring",
    element: (
      <ProgressPage>
        <MonitoringPage />
      </ProgressPage>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/workflow",
    element: (
      <ProgressPage>
        <WorkflowTab />
      </ProgressPage>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/comparative-analysis",
    element: (
      <ProgressPage>
        <CompareCompleted />
      </ProgressPage>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "*",
    element: <NotFound />,
    errorElement: <NotFound />
  }
]);

export default routes;
