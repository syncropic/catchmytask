import IframeView from "@components/IframeView";
import CodeBlock from "@components/codeblock/codeblock";
import { IFile } from "@components/interfaces";
import React, { useEffect, useState } from "react";

export const ViewFile = ({ item }: { item: IFile }) => {
  return (
    <>
      {/* <CodeBlock jsonData={item}></CodeBlock> */}
      {/* <IframeView value={item?.file_path}></IframeView> */}
      <div>viewfile</div>
    </>
  );
};

export default ViewFile;
