import { ref, onUnmounted, type Ref, type ComputedRef, isRef, watch } from 'vue';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

export function useWebSocket(url: string | Ref<string> | ComputedRef<string>, options: UseWebSocketOptions = {}) {
  const { onMessage, autoConnect = true } = options;

  const status = ref<ConnectionStatus>('disconnected');
  const ws = ref<WebSocket | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectDelay = 30000;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let manualClose = false;

  const getUrlString = () => (isRef(url) ? url.value : url);

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return;
    
    manualClose = false;
    status.value = 'connecting';
    
    try {
      const socket = new WebSocket(getUrlString());
      ws.value = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        status.value = 'connected';
        reconnectAttempts.value = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        status.value = 'error';
      };

      socket.onclose = () => {
        status.value = 'disconnected';
        if (!manualClose) {
          handleReconnect();
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      status.value = 'error';
      handleReconnect();
    }
  }

  function handleReconnect() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    
    reconnectAttempts.value++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value - 1), maxReconnectDelay);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`);
    
    reconnectTimeout = setTimeout(() => {
      connect();
    }, delay);
  }

  function disconnect() {
    manualClose = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
    status.value = 'disconnected';
    reconnectAttempts.value = 0;
  }

  if (autoConnect) {
    connect();
  }

  // Watch for URL changes and reconnect if needed
  if (isRef(url)) {
    watch(url, () => {
      if (!manualClose) {
        disconnect();
        connect();
      }
    });
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    status,
    connect,
    disconnect,
    reconnectAttempts
  };
}
