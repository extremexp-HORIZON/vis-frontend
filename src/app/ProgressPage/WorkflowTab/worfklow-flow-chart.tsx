import { useEffect, useRef, useState } from "react"
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
import { ITask } from "../../../shared/models/experiment/task.model"
import { Tooltip } from "@mui/material"
import { IParam } from "../../../shared/models/experiment/param.model"

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

interface IFlowGraphProps {
  workflowSvg: { tasks: ITask[] | undefined; start: number | undefined; end: number | undefined } | null
  params: IParam[] | undefined | null
  handleOpenTask: (taskName: string) => void
}

function FlowGraph(props: IFlowGraphProps) {
  const { workflowSvg, params, handleOpenTask } = props
  const flowWrapper = useRef(null)
  const { fitView } = useReactFlow()
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

  const getNodeSelectState = (task: ITask) => {
      return false
  }

  const getInitialNodeStyle = (
    taskType: string,
    tasks: ITask[] | undefined,
    workflowStart: number | undefined,
    workflowEnd: number | undefined,
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
      const interactiveTask = tasks?.find(
        t => t.type === "interactive",
      )
      if (interactiveTask && !interactiveTask.endTime) {
        switch (taskType) {
          case "interactive":
            return interactiveNodeStyle
          default:
            return disabledNodeStyle
        }
      } else if (interactiveTask && interactiveTask.endTime) {
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

    if (workflowSvg && Array.isArray(workflowSvg.tasks) && workflowSvg.tasks.length > 0) {
      //Nodes and Edges initialization
      const taskNodes = workflowSvg?.tasks?.map((task, index) => {
        const matchingParams = params?.filter(param => param.task === task.name) || []
        const paramNames = matchingParams.map(p => p.name).join(", ")      
        return {
        id: task.name,
        position: { x: (index + 1) * 200, y: 100 },
        data: {
          label:  matchingParams.length > 0 ? (
            <Tooltip title={`Parameters: ${paramNames}`} arrow>
              <div>{task.variant ? task.variant : task.name}</div>
            </Tooltip>
          ) : (
            <div>{task.name}</div>
          ),
          type: task.type,
          variant: task.variant,
          start: task?.startTime,
          end: task?.endTime,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        selectable: getNodeSelectState(task),
        style: {
          ...getInitialNodeStyle(
            task.type || "",
            workflowSvg.tasks,
            workflowSvg.start,
            workflowSvg.end,
          ),
          cursor: "pointer"
      },
      }})

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
        position: { x: workflowSvg?.tasks?.length * 200 + 200, y: 94 },
        targetPosition: Position.Left,
        sourcePosition: Position.Left,
        data: { label: "End" },
        selectable: false,
        style: startEndNodeStyle,
      }

      const tasks = workflowSvg?.tasks;

      const taskEdges =
        tasks && tasks.length > 1
          ? tasks.flatMap((task, idx) =>
              idx <= tasks.length - 2
                ? [
                    {
                      id: `${task.name}-${tasks[idx + 1].name}`,
                      source: task.name,
                      target: tasks[idx + 1].name,
                      animated: true,
                      selectable: false,
                      reconnectable: false,
                    },
                  ]
                : [],
            )
          : [];
      
      setNodes([startNode, ...taskNodes, endNode])
      setEdges([
        {
          id: `start-${workflowSvg?.tasks[0].name}`,
          source: "start",
          target: workflowSvg?.tasks[0].name || "",
          animated: true,
        },
        ...taskEdges,
        {
          id: `${workflowSvg.tasks[workflowSvg?.tasks.length - 1].name}-end`,
          source: workflowSvg.tasks[workflowSvg?.tasks.length - 1].name || "",
          target: "end",
          animated: true,
        },
      ])
    }
  }, [workflowSvg])

  const onNodeClick = (_: any, node: Node) => {
    if (
      node.id === "start" ||
      node.id === "end"
    )
      return
    else {
      handleOpenTask(node.id)
    }
    // setNodes(state =>
    //   state.map(n =>
    //     n.data.type === node.data.type
    //       ? {
    //           ...n,
    //           style: getTaskStyleOnClick(node),
    //         }
    //       : n.id === "start" || n.id === "end"
    //         ? n
    //         : {
    //             ...n,
    //             style: getInitialNodeStyle(
    //               String(n.data.type) || "",
    //               workflowSvg?.tasks || [],
    //               workflowSvg?.start,
    //               workflowSvg?.end,
    //             ),
    //           },
    //   ),
    // )
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
  const { workflowSvg, params, handleOpenTask } = props
  return (
    <ReactFlowProvider>
      <FlowGraph
        workflowSvg={workflowSvg}
        params={params}
        handleOpenTask={handleOpenTask}
      />
    </ReactFlowProvider>
  )
}

export default StaticDirectedGraph
