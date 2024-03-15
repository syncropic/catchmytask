import IframeView from "@components/IframeView";
import CodeBlock from "@components/codeblock/codeblock";
import React, { useEffect, useState } from "react";

export const ViewFile = ({ item }) => {
  return (
    <>
      {/* <CodeBlock jsonData={item}></CodeBlock> */}
      <IframeView file_path={item?.file_path}></IframeView>
    </>
  );
};

export default ViewFile;
