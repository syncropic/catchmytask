import { IResourceComponentsProps, useParsed, useShow } from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import React from "react";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  // record
  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data: dataRecord, isLoading } = queryResult;

  return (
    <>
      <Show isLoading={isLoading}></Show>
    </>
  );
};
export default PageShow;
