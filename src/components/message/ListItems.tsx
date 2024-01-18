import React from "react";
import { Image } from "@mantine/core";

interface IChatMessage {
  id: string;
  key: string;
  message: string;
  isSender: boolean;
  role: string;
  avatarUrl: string;
}

const ChatMessage = (chat: IChatMessage) => {
  return (
    <div className="w-full border-b border-gray-300">
      <div
        className={`rounded-t-sm px-4 py-2 ${
          chat.isSender ? "bg-gray-300 text-black" : "bg-gray-100 text-black"
        }`}
      >
        <div className="flex justify-center">
          <div className="max-w-xl w-full">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              {/* <Image src={avatarUrl} alt="avatar" h={20} w="auto" /> */}
              {/* Message */}
              <div className="flex flex-col">
                <span className="text-sm align-top">{chat.message}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IChatMessages {
  messages: IChatMessage[];
}

const ListItems = (items: IChatMessages) => {
  // console.log(items);
  const messagesList = (items: IChatMessages) => {
    return items.messages.map((item) => {
      let isSender = item.role == "user" ? true : false;
      return (
        <ChatMessage
          id={item.id}
          key={item.id}
          message={item.message}
          isSender={isSender}
          role={item.role}
          avatarUrl={item.avatarUrl}
        />
      );
    });
  };

  return <>{messagesList(items)}</>;
};

export default ListItems;
