import { IIdentity } from "@components/interfaces";
import { IResourceComponentsProps, useGetIdentity } from "@refinedev/core";
import React from "react";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { data: identity } = useGetIdentity<IIdentity>();

  return (
    <>
      <div>Name: {identity?.name}</div>
      <div>Email: {identity?.email}</div>
    </>
  );
};
export default PageList;
