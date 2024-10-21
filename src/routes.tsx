import { createBrowserRouter } from "react-router-dom"
import ProgressPage from "./app/ProgressPage/progress-page";
import ErrorPage from "./error-page";
import NotFound from "./not-found";

const routes = createBrowserRouter([
  {
    path: "/:experimentId",
    element: <ProgressPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "*",
    element: <NotFound />,
    errorElement: <NotFound />
  }
]);

export default routes;
