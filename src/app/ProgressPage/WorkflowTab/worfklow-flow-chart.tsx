import { useEffect, useRef, useState } from 'react';
import type {
  Node,
  Edge } from '@xyflow/react';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Position
} from '@xyflow/react';
import { useTheme } from '@mui/material/styles';

import '@xyflow/react/dist/style.css';
import type { ITask } from '../../../shared/models/experiment/task.model';
import { Tooltip } from '@mui/material';
import type { IParam } from '../../../shared/models/experiment/param.model';

const startEndNodeStyle = {
  borderRadius: '100%',
  backgroundColor: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none' as const,
  cursor: 'default',
};

interface IFlowGraphProps {
  workflowSvg: { tasks: ITask[] | undefined; start: number | undefined; end: number | undefined } | null
  params: IParam[] | undefined | null
}

function FlowGraph(props: IFlowGraphProps) {
  const { workflowSvg, params } = props;
  const flowWrapper = useRef(null);
  const { fitView } = useReactFlow();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const theme = useTheme();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const clickableNodeStyle = {
    cursor: 'default',
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: 'white',
  };

  const disabledNodeStyle = {
    cursor: 'default',
    border: `1px solid ${theme.palette.customGrey.dark}`,
    color: `${theme.palette.customGrey.dark}`,
    backgroundColor: 'white',
  };

  const interactiveNodeStyle = {
    cursor: 'default',
    border: '1px solid orange',
    backgroundColor: 'white',
  };

  const getNodeSelectState = (task: ITask) => {
    return false;
  };

  const getInitialNodeStyle = (
    taskType: string,
    tasks: ITask[] | undefined,
    workflowStart: number | undefined,
    workflowEnd: number | undefined,
  ) => {
    if (workflowStart && workflowEnd) {
      switch (taskType) {
        case 'interactive':
          return disabledNodeStyle;
        case 'custom':
          return disabledNodeStyle;
        case 'explainability':
          return disabledNodeStyle;
        default:
          return clickableNodeStyle;
      }
    } else {
      const interactiveTask = tasks?.find(
        t => t.type === 'interactive',
      );

      if (interactiveTask && !interactiveTask.endTime) {
        switch (taskType) {
          case 'interactive':
            return interactiveNodeStyle;
          default:
            return disabledNodeStyle;
        }
      } else if (interactiveTask && interactiveTask.endTime) {
        switch (taskType) {
          case 'read_data':
            return clickableNodeStyle;
          case 'evaluation':
            return clickableNodeStyle;
          default:
            return disabledNodeStyle;
        }
      } else {
        return disabledNodeStyle;
      }
    }
  };

  useEffect(() => {
    // Resize functionality
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;

      setContainerSize({ width, height });
    });

    if (flowWrapper.current) {
      observer.observe(flowWrapper.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0 && nodes.length > 0) {
      setTimeout(() => {
        fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
      }, 50);
    }
  }, [containerSize, nodes, fitView]);

  useEffect(() => {
    if (workflowSvg && Array.isArray(workflowSvg.tasks) && workflowSvg.tasks.length > 0) {
      // Nodes and Edges initialization
      const taskNodes = workflowSvg?.tasks?.map((task, index) => {
        const matchingParams = params?.filter(param => param.task === task.id) || [];
        const paramNames = matchingParams.map(p => p.name).join(', ');

        return {
          id: task.name,
          position: { x: (index + 1) * 200, y: 100 },
          data: {
            label: matchingParams.length > 0 ? (
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
              task.type || '',
              workflowSvg.tasks,
              workflowSvg.start,
              workflowSvg.end,
            ),
            cursor: 'default'
          },
        };
      });

      const startNode = {
        id: 'start',
        position: { x: 100, y: 94 },
        sourcePosition: Position.Right,
        targetPosition: Position.Right,
        data: { label: 'Start' },
        selectable: false,
        style: startEndNodeStyle,
      };

      const endNode = {
        id: 'end',
        position: { x: workflowSvg?.tasks?.length * 200 + 200, y: 94 },
        targetPosition: Position.Left,
        sourcePosition: Position.Left,
        data: { label: 'End' },
        selectable: false,
        style: startEndNodeStyle,
      };

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

      // After setting nodes and edges, add a timeout to allow rendering before fitting view
      setNodes([startNode, ...taskNodes, endNode]);
      setEdges([
        {
          id: `start-${workflowSvg?.tasks[0].name}`,
          source: 'start',
          target: workflowSvg?.tasks[0].name || '',
          animated: true,
        },
        ...taskEdges,
        {
          id: `${workflowSvg.tasks[workflowSvg?.tasks.length - 1].name}-end`,
          source: workflowSvg.tasks[workflowSvg?.tasks.length - 1].name || '',
          target: 'end',
          animated: true,
        },
      ]);

      // Add a small delay to ensure nodes are rendered before attempting to fit view
      setTimeout(() => {
        fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
      }, 50);
    }
  }, [workflowSvg, fitView]);

  return (
    <div
      style={{
        height: '15vh',
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
      ref={flowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        panOnDrag={true}
        zoomOnScroll={true}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        // onNodeClick={onNodeClick}
        zoomOnPinch={false}
        proOptions={{ hideAttribution: true }}
        fitView={true}
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function StaticDirectedGraph(props: IFlowGraphProps) {
  const { workflowSvg, params } = props;

  return (
    <ReactFlowProvider>
      <FlowGraph
        workflowSvg={workflowSvg}
        params={params}
      />
    </ReactFlowProvider>
  );
}

export default StaticDirectedGraph;
