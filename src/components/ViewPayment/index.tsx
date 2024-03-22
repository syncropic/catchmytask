import CodeBlock from "@components/codeblock/codeblock";
import { IPayment } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewPayment = ({ item }: { item: IPayment }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewPayment;
