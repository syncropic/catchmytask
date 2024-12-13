import {
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _, { filter } from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import { useGetIdentity, useGo, useParsed } from "@refinedev/core";
import { IIdentity } from "@components/interfaces";
import SearchInput from "@components/SearchInput";
import { Button, MultiSelect, Select, TextInput } from "@mantine/core";
import TableView from "@components/TableView";
import { useState } from "react";

interface ActionProps {
  // success_message_code?: string;
  // display_mode?: string;
  // query_name?: string;
  // view_id?: string;
  // author_id?: string;
  // title?: string;
}

export const ExplorerWrapper = ({}: ActionProps) => {
  const { params } = useParsed();
  // const [monitorComponents, setMonitorComponents] = useState(["monitor"]);

  const { activeProfile } = useAppStore();
  const { data: identity } = useGetIdentity<IIdentity>();

  let query_state = {
    id: activeProfile?.id,
    query_name: "fetch profile explorer",
    profile_id: activeProfile?.id,
    author_id: identity?.email || "guest",
    success_message_code: activeProfile?.id,
  };
  const {
    data: queryData,
    isLoading: queryIsLoading,
    error: queryError,
  } = useFetchQueryDataByState(query_state);

  if (queryIsLoading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError?.message}</div>;

  let dataItems = queryData?.data?.find
    ? queryData?.data?.find(
        (item: any) => item?.message?.code === query_state?.success_message_code
      )?.data[0]
    : null;
  return (
    <>
      {/* <div>monitor wrapper</div> */}
      {/* {true && (
        <MonacoEditor
          value={{
            actions: actions,
            // monitorViewRecord: monitorViewRecord,
          }}
          height="25vh"
          language="json"
        ></MonacoEditor>
      )} */}
      <MonacoEditor
        value={dataItems}
        height="65vh"
        language="json"
        id="explorer_editor"
      ></MonacoEditor>
    </>
  );
};

export default ExplorerWrapper;
