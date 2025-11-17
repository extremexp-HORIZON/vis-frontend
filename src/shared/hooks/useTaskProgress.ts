import { useEffect, useState, useRef } from 'react';
import {
  type WebSocketMessage,
  type TaskProgress,
} from '../../shared/models/eusome-api.model';

const isDev =
  import.meta.env.MODE === 'development' ||
  process.env.NODE_ENV === 'development';

export const useTaskProgress = (taskId: string) => {
  const [state, setState] = useState<TaskProgress>({
    task_id: taskId,
    status: 'queued',
    percent: 0,
    step: '',
    message: '',
    isConnected: false,
  });
  const [taskResult, setTaskResult] = useState<unknown>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (taskId.length > 0) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = isDev
        ? `ws://localhost:8000/ws/tasks/${taskId}`
        : `${protocol}//${host}/eusome/ws/tasks/${taskId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => setState(prev => ({ ...prev, isConnected: true }));
      ws.onclose = () => setState(prev => ({ ...prev, isConnected: false }));

      ws.onmessage = event => {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'task_status':
            setState(prev => ({
              ...prev,
              status: message.data.status,
              percent: message.data.percent,
              step: message.data.step,
              message: message.data.message,
              error: message.data.error || undefined,
            }));

            // Store task result data if available
            if (message.data.predictions_json) {
              try {
                const predictions = JSON.parse(message.data.predictions_json);

                setTaskResult(predictions);
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse predictions_json:', error);
              }
            }

            if (message.data.status === 'succeeded') {
              hasCompletedRef.current = true;
              ws.close(1000, message.data.message);
            } else if (message.data.status === 'failed') {
              hasCompletedRef.current = true;
              ws.close(4001, message.data.message);
            }
            break;

          case 'live_event':
            setState(prev => ({
              ...prev,
              status: message.data.status,
              percent: parseInt(message.data.percent),
              step: message.data.step,
              message: message.data.message,
              error: message.data.error || undefined,
            }));

            // Store task result data if available
            if (message.data.predictions_json) {
              try {
                const predictions = JSON.parse(message.data.predictions_json);

                setTaskResult(predictions);
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse predictions_json:', error);
              }
            }

            if (message.data.status === 'succeeded') {
              hasCompletedRef.current = true;
              ws.close(1000, message.data.message);
            } else if (message.data.status === 'failed') {
              hasCompletedRef.current = true;
              ws.close(4001, message.data.message);
            }
            break;

          case 'error':
            setState(prev => ({ ...prev, error: message.message }));
            ws.close(4001, message.message);
            break;
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [taskId]);

  return { ...state, taskResult, hasCompleted: hasCompletedRef.current };
};
