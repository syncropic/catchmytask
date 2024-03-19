import ListView from "@components/ListView";
import CodeBlock from "@components/codeblock/codeblock";
import { IExecute, IListItem, IShowItem } from "@components/interfaces";
import { useCustom } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import { useAppStore } from "src/store";

export const ViewActionHistory = () => {
  const { activeAction } = useAppStore();

  const list_item = activeAction?.show?.find(
    (item: IShowItem) => item.name == "action_history"
  );

  // const { data, isLoading } = useCustom<IExecute>({
  //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
  //   method: "post",
  //   config: {
  //     payload: {
  //       credentials: "surrealdb_catchmytask",
  //       query:
  //         "SELECT id, in, out, execution_order, name FROM execute WHERE in.name == 'update_dataset'",
  //       query_language: "surrealql",
  //     },
  //   },
  // });
  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  return (
    <>
      {/* <CodeBlock jsonData={item}></CodeBlock> */}
      {/* {JSON.stringify(data)}
      <div>action steps, group by task (output is final result)</div>
      <div>view action history</div> */}
      {list_item && <ListView item={list_item} />}
    </>
  );
};

export default ViewActionHistory;
