import CodeBlock from "@components/codeblock/codeblock";
import { ITask } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewTask = ({ item }: { item: ITask }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewTask;
