import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Position,
  Node,
  Edge,
} from "@xyflow/react"
import { useTheme } from "@mui/material/styles"

import "@xyflow/react/dist/style.css"
import { Task } from "../../../shared/models/workflow.model"

const startEndNodeStyle = {
  borderRadius: "100%",
  backgroundColor: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none" as const,
  cursor: "default",
}

const implementedTasks = ["read_data", "interactive", "evaluation"]

interface IFlowGraphProps {
  workflowSvg: { tasks: Task[]; start: string; end: string } | null
  chosenTask: string | null
  setChosenTask: Dispatch<SetStateAction<string | null>>
}

function FlowGraph(props: IFlowGraphProps) {
  const { workflowSvg, chosenTask, setChosenTask } = props
  const flowWrapper = useRef(null)
  const { fitView, setViewport } = useReactFlow()
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const theme = useTheme()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  const clickableNodeStyle = {
    cursor: "pointer",
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: "white",
  }

  const disabledNodeStyle = {
    cursor: "default",
    border: `1px solid ${theme.palette.customGrey.dark}`,
    color: `${theme.palette.customGrey.dark}`,
    backgroundColor: "white",
  }

  const interactiveNodeStyle = {
    cursor: "pointer",
    border: `1px solid orange`,
    backgroundColor: "white",
  }

  const getTaskStyleOnClick = (node: Node) => {
    switch (node.data.type) {
      case "interactive":
        if (chosenTask === node.data.type) {
          return {
            ...node.style,
            border: "1px solid orange",
            backgroundColor: "white",
          }
        } else {
          return {
            ...node.style,
            border: "1px solid #fff",
            backgroundColor: "orange",
          }
        }
      default:
        if (chosenTask === node.data.type) {
          return {
            ...node.style,
            border: `1px solid ${theme.palette.primary.main}`,
            backgroundColor: "white",
          }
        } else {
          return {
            ...node.style,
            border: `1px solid ${theme.palette.customGrey.dark}`,
            backgroundColor: theme.palette.primary.main,
          }
        }
    }
  }

  const getNodeSelectState = (task: Task) => {
    if (implementedTasks.includes(task.metadata?.type || "")) {
      if (task.metadata?.type === "interactive" && !task.end) {
        return true
      } else if (task.metadata?.type === "interactive" && task.end) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  const getInitialNodeStyle = (
    taskType: string,
    tasks: Task[],
    workflowStart: string,
    workflowEnd: string,
  ) => {
    if (workflowStart && workflowEnd) {
      switch (taskType) {
        case "interactive":
          return disabledNodeStyle
        case "custom":
          return disabledNodeStyle
        case "explainability":
          return disabledNodeStyle
        default:
          return clickableNodeStyle
      }
    } else {
      const interactiveTask = tasks.find(
        t => t.metadata?.type === "interactive",
      )
      if (interactiveTask && !interactiveTask.end) {
        switch (taskType) {
          case "interactive":
            return interactiveNodeStyle
          default:
            return disabledNodeStyle
        }
      } else if (interactiveTask && interactiveTask.end) {
        switch (taskType) {
          case "read_data":
            return clickableNodeStyle
          case "evaluation":
            return clickableNodeStyle
          default:
            return disabledNodeStyle
        }
      } else {
        return disabledNodeStyle
      }
    }
  }

  useEffect(() => {
    // Resize functionality
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ width, height })
    })

    if (flowWrapper.current) {
      observer.observe(flowWrapper.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      fitView()
    }
  }, [containerSize])

  useEffect(() => {
    if (workflowSvg && workflowSvg.tasks.length > 0) {
      //Nodes and Edges initialization
      const taskNodes = workflowSvg.tasks.map((task, index) => ({
        id: task.id,
        position: { x: (index + 1) * 200, y: 100 },
        data: {
          label: task.metadata?.prototypical_name,
          type: task.metadata?.type,
          start: task.start,
          end: task.end,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        selectable: getNodeSelectState(task),
        style: getInitialNodeStyle(
          task.metadata?.type || "",
          workflowSvg.tasks,
          workflowSvg.start,
          workflowSvg.end,
        ),
      }))

      const startNode = {
        id: "start",
        position: { x: 100, y: 94 },
        sourcePosition: Position.Right,
        targetPosition: Position.Right,
        data: { label: "Start" },
        selectable: false,
        style: startEndNodeStyle,
      }

      const endNode = {
        id: "end",
        position: { x: workflowSvg.tasks.length * 200 + 200, y: 94 },
        targetPosition: Position.Left,
        sourcePosition: Position.Left,
        data: { label: "End" },
        selectable: false,
        style: startEndNodeStyle,
      }

      const taskEdges = workflowSvg.tasks.flatMap((task, idx) =>
        idx <= workflowSvg.tasks.length - 2
          ? {
              id: `${task.id}-${workflowSvg.tasks[idx + 1].id}`,
              source: task.id,
              target: workflowSvg.tasks[idx + 1].id,
              animated: true,
              selectable: false,
              reconnectable: false,
            }
          : [],
      )

      setNodes([startNode, ...taskNodes, endNode])
      setEdges([
        {
          id: `start-${workflowSvg.tasks[0].id}`,
          source: "start",
          target: workflowSvg.tasks[0].id || "",
          animated: true,
        },
        ...taskEdges,
        {
          id: `${workflowSvg.tasks[workflowSvg.tasks.length - 1].id}-end`,
          source: workflowSvg.tasks[workflowSvg.tasks.length - 1].id || "",
          target: "end",
          animated: true,
        },
      ])
    }
  }, [workflowSvg])

  const onNodeClick = (_: any, node: Node) => {
    if (
      node.id === "start" ||
      node.id === "end" ||
      !implementedTasks.includes(String(node.data.type))
    )
      return
    if (chosenTask === node.data.type) {
      setChosenTask(null)
    } else {
      setChosenTask(String(node.data.type))
    }
    setNodes(state =>
      state.map(n =>
        n.data.type === node.data.type
          ? {
              ...n,
              style: getTaskStyleOnClick(node),
            }
          : n.id === "start" || n.id === "end"
            ? n
            : {
                ...n,
                style: getInitialNodeStyle(
                  String(n.data.type) || "",
                  workflowSvg?.tasks || [],
                  workflowSvg?.start || "",
                  workflowSvg?.end || "",
                ),
              },
      ),
    )
  }

  //   const xMin = Math.min(...nodes.map((node) => node.position.x)) - 200;
  //   const xMax = Math.max(...nodes.map((node) => node.position.x)) + 200;
  //   const yMin = Math.min(...nodes.map((node) => node.position.y)) - 200;
  //   const yMax = Math.max(...nodes.map((node) => node.position.y)) + 200;

  // interface Viewport {
  //     x: number;
  //     y: number;
  //     zoom: number;
  // }

  // const handleMove = (event: any, viewport: Viewport) => {
  //     const clampedX = Math.min(Math.max(viewport.x, -xMax), -xMin);
  //     const clampedY = Math.min(Math.max(viewport.y, -yMax), -yMin);
  //     console.log(xMin, xMax, yMin, yMax)
  //     console.log(clampedX, clampedY)
  //     if (clampedX !== viewport.x || clampedY !== viewport.y) {
  //         setViewport({ x: clampedX, y: clampedY, zoom: viewport.zoom });
  //     }
  // };

  return (
    <div
      style={{
        height: "30vh",
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
      ref={flowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={true}
        zoomOnScroll={true}
        // onMove={handleMove}
        onNodeClick={onNodeClick}
        zoomOnPinch={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

function StaticDirectedGraph(props: IFlowGraphProps) {
  const { workflowSvg, chosenTask, setChosenTask } = props
  return (
    <ReactFlowProvider>
      <FlowGraph
        workflowSvg={workflowSvg}
        chosenTask={chosenTask}
        setChosenTask={setChosenTask}
      />
    </ReactFlowProvider>
  )
}

export default StaticDirectedGraph
