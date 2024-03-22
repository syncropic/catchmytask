import CodeBlock from "@components/codeblock/codeblock";
import { IBooking } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewBooking = ({ item }: { item: IBooking }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewBooking;
