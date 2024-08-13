import { Text, Title } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
import React from "react";
import { useAppStore } from "src/store";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { activeApplication } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="flex justify-center items-center">
        <Title order={3}>Get Important Things Done.</Title>
      </div>
    </div>
  );
};
export default PageList;
