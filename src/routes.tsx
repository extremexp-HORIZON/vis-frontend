import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import ExplainabilityTask from "./app/ExplainabilityTask/explainability-task";
import ProgressPage from "./app/ProgressPage/progress-page";
import DataExploration from "./app/DataExplorationTask/data-exploration";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
        <Route path="/explainability" element={<ExplainabilityTask />} />
        <Route path="/dataexploration" element={<DataExploration />} />
        <Route path="/" element={<ProgressPage />} />
    </>
  ));

export default routes;
