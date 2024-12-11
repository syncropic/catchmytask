// WebSocketDemo.tsx
import React, { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export const WebSocketDemo = () => {
  const [socketUrl] = useState("ws://localhost:8000/ws/test-client");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  // Add WebSocket options
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true, // Allow sharing connection
    shouldReconnect: () => true, // Enable auto-reconnect
    reconnectInterval: 3000, // Try to reconnect every 3 seconds
    reconnectAttempts: 5,
    onOpen: () => {
      console.log("WebSocket Connected");
      setMessageHistory((prev) => [...prev, "Connected to server"]);
    },
    onClose: () => {
      console.log("WebSocket Disconnected");
      setMessageHistory((prev) => [...prev, "Disconnected from server"]);
    },
    onError: (error) => {
      console.error("WebSocket Error:", error);
      setMessageHistory((prev) => [...prev, "Connection error occurred"]);
    },
    onMessage: (event) => {
      console.log("Message received:", event.data);
    },
  });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => [...prev, lastMessage.data]);
    }
  }, [lastMessage]);

  const handleClickSendMessage = useCallback(() => {
    if (readyState === ReadyState.OPEN) {
      console.log("Sending message: Hello");
      sendMessage("Hello");
    } else {
      console.log("WebSocket is not connected, current state:", readyState);
    }
  }, [sendMessage, readyState]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="text-lg font-bold">WebSocket Demo</div>
        <div className="text-sm">URL: {socketUrl}</div>
        <div
          className={`text-sm ${
            readyState === ReadyState.OPEN ? "text-green-500" : "text-red-500"
          }`}
        >
          Status: {connectionStatus}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
          className={`px-4 py-2 rounded ${
            readyState === ReadyState.OPEN
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Send 'Hello'
        </button>
      </div>

      {lastMessage && (
        <div className="mb-4">
          <div className="font-bold">Last Message:</div>
          <div className="bg-gray-100 p-2 rounded">{lastMessage.data}</div>
        </div>
      )}

      <div>
        <div className="font-bold mb-2">Message History:</div>
        <div className="border rounded p-4 max-h-96 overflow-y-auto">
          {messageHistory.map((message, idx) => (
            <div key={idx} className="mb-2 p-2 bg-gray-50 rounded">
              {message}
            </div>
          ))}
        </div>
      </div>

      {/* Debug Information */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <div className="font-bold">Debug Info:</div>
        <div>ReadyState: {readyState}</div>
        <div>Connection Status: {connectionStatus}</div>
        <div>Message Count: {messageHistory.length}</div>
      </div>
    </div>
  );
};

export default WebSocketDemo;
