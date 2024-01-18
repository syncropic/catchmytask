import React, { useState } from "react";

const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  if (!isOpen) {
    return <button onClick={toggleChat}>Chat</button>;
  }

  return (
    <div className="chat-popup">
      <button onClick={toggleChat}>Close</button>
      {/* Chat content goes here */}
    </div>
  );
};

export default ChatPopup;
