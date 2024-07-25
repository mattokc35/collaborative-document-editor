import { useEffect, useState, useCallback } from "react";

const useWebSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<
    "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "ERROR"
  >("CONNECTING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setStatus("OPEN");
    };

    socket.onclose = () => {
      setStatus("CLOSED");
    };

    socket.onerror = (event) => {
      console.error("WebSocket error:", event);
      setStatus("ERROR");
      setError(`WebSocket error: ${(event as ErrorEvent).message}`);
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback(
    (message: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket is not open. Message not sent.");
      }
    },
    [ws]
  );

  return { ws, status, error, sendMessage };
};

export default useWebSocket;
