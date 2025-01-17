import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import ExplainabilityTask from "./app/Tasks/ExplainabilityTask/explainability-task";
import ProgressPage from "./app/ProgressPage/progress-page";
import DataExploration from "./app/Tasks/DataExplorationTask/data-exploration";
import ErrorPage from "./error-page";
import NotFound from "./not-found";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
        <Route path="/explainability" element={<ExplainabilityTask />} />
        <Route path="/dataexploration" element={<DataExploration />} />
        <Route path="/:experimentId" element={<ProgressPage />} errorElement={<ErrorPage />} />
        <Route path="*" element={<NotFound />} errorElement={<NotFound />} />
    </>
  ));

export default routes;
