import { useEffect, useState } from 'react';
import {
  type WebSocketMessage,
  type TaskProgress,
} from '../../shared/models/eusome-api.model';

export const useTaskProgress = (taskId: string) => {
  const [state, setState] = useState<TaskProgress>({
    task_id: taskId,
    status: 'queued',
    percent: 0,
    step: '',
    message: '',
    isConnected: false,
  });

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/tasks/${taskId}`);

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

          if (message.data.status === 'succeeded') {
            ws.close(1000, message.data.message);
          } else if (message.data.status === 'failed') {
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

          if (message.data.status === 'succeeded') {
            ws.close(1000, message.data.message);
          } else if (message.data.status === 'failed') {
            ws.close(4001, message.data.message);
          }
          break;

        case 'error':
          setState(prev => ({ ...prev, error: message.message }));
          ws.close(4001, message.message);
          break;
      }
    };

  }, [taskId]);

  return state;
};
