import {RouterProvider } from "react-router-dom"
import "./App.css"
import MainRoutes from "./routes"

const App = () => {
  return (
    <RouterProvider router={MainRoutes} />
  )
}

export default App
