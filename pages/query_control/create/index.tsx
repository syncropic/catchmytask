import ActionControlForm from "@components/ActionControlForm";
import QueryControlForm from "@components/QueryControlForm";
import SelectView from "@components/SelectView";
import {
  extractFields,
  extractIdentifier,
  useFetchActionById,
} from "@components/Utils";
import { IAction } from "@components/interfaces";
import { Tabs, Text } from "@mantine/core";
import { HttpError, IResourceComponentsProps, useOne } from "@refinedev/core";
import { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    activeSession,
    activeAction,
    activeRecord,
    activeViewItem,
    activeApplication,
    setQueryAction,
    queryAction,
  } = useAppStore();

  // // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  // const { action, isLoading, error } = useFetchActionById(
  //   activeActionId?.id || ""
  // );
  // fetch query action
  const { data, isLoading, isError, error } = useOne<IAction, HttpError>({
    resource: "actions",
    id: "actions:⟨018e7f0c-87f0-7c46-a6e2-c3fcf87480e2⟩",
  });
  // console.log("applications_dataset", data);
  // create show_item that implements the IShowItem interface from the item in list key where name  == "default"

  useEffect(() => {
    if (data?.data) {
      setQueryAction(data?.data);
    }
    // Handle other dependencies like record and view_item here
    // if (record) {
    //   setActiveRecord(record);
    // }

    // if (view_item) {
    //   setActiveViewItem(view_item);
    // }
    // activateSection("rightSection");
  }, [data?.data]);

  // const { subscriptions } = useSubscriptions();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error)}</div>;
  if (!activeSession) return <div>No active session selected</div>;
  if (!activeAction) return <div>No active action selected</div>;

  return (
    <>
      {/* <div>{JSON.stringify(activeViewItem?.active_query?.query)}</div> */}
      {/* <SelectView actions_list={[]} record={activeSession} view_item={null} /> */}
      {/* <QueryControlForm
        queryAction={queryAction}
        activeRecords={[activeViewItem]}
      ></QueryControlForm> */}
      <div>QueryControlForm</div>
    </>
  );
};
export default PageCreate;
