import CodeBlock from "@components/codeblock/codeblock";
import { IAutomation } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewAutomation = ({ item }: { item: IAutomation }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewAutomation;
