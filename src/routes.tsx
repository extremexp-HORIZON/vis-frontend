import { createBrowserRouter } from "react-router-dom"
import ProgressPage from "./app/ProgressPage/progress-page";
import ErrorPage from "./error-page";
import NotFound from "./not-found";
import MonitoringPage from "./app/ProgressPage/MonitoringPage/monitoring-page";
import WorkflowTab from "./app/ProgressPage/WorkflowTab/workflow-tab";
import ProgressPageLoading from "./app/ProgressPage/progress-page-loading";
import LoginPage from "./app/LoginPage/login-page";
import ProtectedRoute from "./protected-route";
import TokenAuthHandler from "./token-auth-handler";

const routes = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId",
    element: (
      // <ProtectedRoute>
        <ProgressPageLoading />
      // </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/external/:token/:experimentId?",
    element: <TokenAuthHandler />,
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/monitoring",
    element: (
      // <ProtectedRoute>
        <ProgressPage>
          <MonitoringPage />
        </ProgressPage>
      // </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/workflow",
    element: (
      // <ProtectedRoute>
        <ProgressPage>
          <WorkflowTab />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/comparative-analysis",
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <CompareCompleted />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/:experimentId/explains",
    element: (
      <ProgressPage>
        <DummyExplains />
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
