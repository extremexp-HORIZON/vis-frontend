import { createBrowserRouter } from 'react-router-dom';
import ProgressPage from './app/ProgressPage/progress-page';
import ErrorPage from './error-page';
import NotFound from './not-found';
import MonitoringPage from './app/ProgressPage/MonitoringPage/monitoring-page';
import WorkflowTab from './app/ProgressPage/WorkflowTab/workflow-tab';
import ProgressPageLoading from './app/ProgressPage/progress-page-loading';
import LoginPage from './app/LoginPage/login-page';
import ProtectedRoute from './protected-route';
import TokenAuthHandler from './token-auth-handler';
import ExploringPage from './app/ExploringPage/exploring-page';
import VisualizePage from './app/ExploringPage/VisualizePage/visualize-page';
import GamificationPage from './app/ProgressPage/GamificationPage/gamification-page';

const routes = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId',
    element: (
      <ProtectedRoute>
        <ProgressPageLoading />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/external/:token/:experimentId?',
    element: <TokenAuthHandler />,
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/monitoring',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <MonitoringPage />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/exploring',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <ExploringPage />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/exploring/visualize/:datasetId',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <VisualizePage />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/gamification',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <MonitoringPage />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/gamification',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <GamificationPage />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/:experimentId/workflow',
    element: (
      <ProtectedRoute>
        <ProgressPage>
          <WorkflowTab />
        </ProgressPage>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <NotFound />
  }
]);

export default routes;
