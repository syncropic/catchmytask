import CodeBlock from "@components/codeblock/codeblock";
import React, { useEffect, useState } from "react";

export const ViewPayment = ({ item }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewPayment;
