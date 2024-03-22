import CodeBlock from "@components/codeblock/codeblock";
import { ITrip } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewTrip = ({ item }: { item: ITrip }) => {
  return (
    <>
      <CodeBlock jsonData={item}></CodeBlock>
    </>
  );
};

export default ViewTrip;
