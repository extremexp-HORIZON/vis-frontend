import { BrowserRouter, RouterProvider } from "react-router-dom"
import "./App.css"
import Routes from "./routes"
import MainRoutes from "./routes"

const App = () => {
  return (
    <RouterProvider router={MainRoutes} />
  )
}

export default App
