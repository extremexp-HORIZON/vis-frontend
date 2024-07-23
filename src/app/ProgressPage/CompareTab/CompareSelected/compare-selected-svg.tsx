import grey from "@mui/material/colors/grey"
import Box from "@mui/material/Box"
import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import blue from "@mui/material/colors/blue"
import Svg from "../../../../shared/data/new-top.svg?react"
import { useTheme } from "@mui/material"

interface IWorkflowSvg {
  chosenTask: string | null
  setChosenTask: Dispatch<SetStateAction<string | null>>
}

const CompareSelectedSvg = (props: IWorkflowSvg) => {
  const theme = useTheme();
  const { chosenTask, setChosenTask } = props
  const chosenTaskRef = useRef(chosenTask)
  const listeners = useRef<
    { gElement: SVGGElement; listener: EventListener }[]
  >([])
  const workingTasks = ["TrainModel"]

  useEffect(() => {
    const handleChange = (taskId: string | null, element: SVGGElement) => {
      listeners.current.forEach(({ gElement, listener }) => {
        if (gElement !== element) {
          gElement.querySelectorAll("polygon").forEach(childElement => {
            const element = childElement as SVGPolygonElement
            element.style.cursor = "pointer"
            element.style.userSelect = "none"
            element.style.fill = "white"
          })
        } else {
          if (chosenTaskRef.current === taskId) {
            setChosenTask(null)
            chosenTaskRef.current = null
            element.querySelectorAll("polygon").forEach(childElement => {
              const element = childElement as SVGPolygonElement
              element.style.cursor = "pointer"
              element.style.userSelect = "none"
              element.style.fill = "white"
            })
          } else {
            setChosenTask(taskId)
            chosenTaskRef.current = taskId
            element.querySelectorAll("polygon").forEach(childElement => {
              const element = childElement as SVGPolygonElement
              element.style.cursor = "pointer"
              element.style.userSelect = "none"
              element.style.fill = theme.palette.primary.light
            })
          }
        }
      })
    }

    const graphElement = document.querySelector("#graph0")

    if (graphElement) {
      graphElement.querySelectorAll("g").forEach(gElement => {
        if (gElement.id.includes("node")) {
          const titleElement = gElement.querySelector("title")
          if (
            titleElement &&
            titleElement.textContent &&
            workingTasks.includes(titleElement.textContent)
          ) {
            const title = titleElement.textContent
            const listener = () => handleChange(title, gElement)
            gElement.addEventListener("click", listener)
            listeners.current.push({ gElement, listener })
            gElement.querySelectorAll("*").forEach(childElement => {
              const element = childElement as HTMLElement
              element.style.cursor = "pointer"
              element.style.userSelect = "none"
            })
          } else {
            gElement.querySelectorAll("polygon").forEach(childElement => {
              const element = childElement as SVGPolygonElement
              element.style.userSelect = "none"
              element.style.stroke = grey[400]
            })
            gElement.querySelectorAll("text").forEach(cldEl => {
              const element = cldEl as SVGTextElement
              element.style.userSelect = "none"
              element.style.fill = grey[400]
            })
          }
        }
      })
    }
    return () => {
      listeners.current.forEach(({ gElement, listener }) => {
        gElement.removeEventListener("click", listener)
      })
    }
  }, [])

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        flexWrap: "wrap",
      }}
    >
      <Svg />
    </Box>
  )
}

export default CompareSelectedSvg
