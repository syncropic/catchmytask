import CodeBlock from "@components/codeblock/codeblock";
import React, { useEffect, useState } from "react";

export const ViewBooking = ({ item }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewBooking;
