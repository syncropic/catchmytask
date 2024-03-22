import CodeBlock from "@components/codeblock/codeblock";
import { ITestRun } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewTestRun = ({ item }: { item: ITestRun }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewTestRun;
