import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import ExplainabilityTask from "./app/ExplainabilityTask/explainability-task";
import ProgressPage from "./app/ProgressPage/progress-page";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
        <Route path="/explainability" element={<ExplainabilityTask />} />
        <Route path="/" element={<ProgressPage />} />
    </>
  ));

export default routes;
