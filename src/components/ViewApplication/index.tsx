import CodeBlock from "@components/codeblock/codeblock";
import { IApplication } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewApplication = ({ item }: { item: IApplication }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewApplication;
