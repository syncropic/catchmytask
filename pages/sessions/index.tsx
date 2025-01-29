import React from "react";
import { Highlight } from "@mantine/core";

export const PageList: React.FC = () => {
  return (
    <div>
      {" "}
      <div
        className="flex flex-col h-screen items-center justify-center p-4"
        style={{
          height: "calc(100vh - 100px)",
        }}
      >
        <p className="text-sm text-gray-600 text-center max-w-sm">
          <Highlight color="lime" highlight="task">
            Create or select a task to continue.
          </Highlight>
        </p>
      </div>
    </div>
  );
};
export default PageList;
