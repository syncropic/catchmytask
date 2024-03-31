import ListView from "@components/ListView";
import { IDataset } from "@components/interfaces";
import { HttpError, IResourceComponentsProps, useOne } from "@refinedev/core";
import React from "react";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  // list of all available applications dataset columns
  // applications dataset
  const { data, isLoading, isError, error } = useOne<IDataset, HttpError>({
    resource: "datasets",
    id: "datasets:⟨018e7ebb-9273-7261-87d1-faf0f75532e5⟩",
  });
  // console.log("applications_dataset", data);
  // create show_item that implements the IShowItem interface from the item in list key where name  == "default"

  // const { subscriptions } = useSubscriptions();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error)}</div>;
  // const list_item = data?.data?.list?.find((item) => item.name == "default");
  const list_item = data?.data.list.find((item) => item.name == "default");

  return (
    <>
      <ListView item={list_item} />
    </>
  );
};
export default PageList;
