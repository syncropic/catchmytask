// useWebSocketConnection.ts
import { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface Message {
  data: string;
  type?: "sent" | "received" | "system";
  timestamp?: string;
}

interface UseWebSocketConnection {
  messages: Message[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
  connectionStatus: string;
  clearMessages: () => void;
}

export const useWebSocketConnection = (
  clientId: string
): UseWebSocketConnection => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketUrl = `ws://localhost:8000/ws/${clientId}`;

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log("WebSocket connected");
      addMessage("Connected to server", "system");
    },
    onClose: () => {
      console.log("WebSocket disconnected");
      addMessage("Disconnected from server", "system");
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
      addMessage("Connection error occurred", "system");
    },
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  });

  const addMessage = useCallback(
    (data: string, type: Message["type"] = "received") => {
      setMessages((prev) => [
        ...prev,
        {
          data,
          type,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      const messageText = lastMessage.data;

      if (messageText.startsWith("You wrote:")) {
        addMessage(messageText, "sent");
      } else if (messageText.startsWith("Client #")) {
        addMessage(messageText, "received");
      } else {
        addMessage(messageText, "system");
      }
    }
  }, [lastMessage, addMessage]);

  const sendMessageWithType = useCallback(
    (message: string) => {
      if (readyState === ReadyState.OPEN) {
        sendMessage(message);
      } else {
        addMessage("Cannot send message: not connected to server", "system");
      }
    },
    [readyState, sendMessage, addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return {
    messages,
    sendMessage: sendMessageWithType,
    isConnected: readyState === ReadyState.OPEN,
    connectionStatus,
    clearMessages,
  };
};

export default useWebSocketConnection;
