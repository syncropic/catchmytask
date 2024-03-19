import ListView from "@components/ListView";
import { IDataset } from "@components/interfaces";
import { HttpError, IResourceComponentsProps, useOne } from "@refinedev/core";
import React from "react";
import { useAppStore } from "src/store";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { data, isLoading, isError, error } = useOne<IDataset, HttpError>({
    resource: "datasets",
    id: "datasets:⟨61b76957-cd14-47fa-ae47-1e1d06c3f1cf⟩",
  });

  const { setActiveViewItem } = useAppStore();
  // console.log("applications_dataset", data);
  // create show_item that implements the IShowItem interface from the item in list key where name  == "default"
  const list_item = data?.data?.list?.find((item) => item.name == "default");
  // console.log("list_item", list_item);
  // setActiveViewItem(list_item);

  // const { subscriptions } = useSubscriptions();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error)}</div>;
  return (
    <>
      <ListView item={list_item} />
    </>
  );
};
export default PageList;
