import { useEffect, useRef } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/tickets/';

export default function useTicketSocket(onMessage) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const socket = new WebSocket(WS_BASE);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessageRef.current(data);
    };

    return () => socket.close();
  }, []);
}