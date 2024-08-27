import {
  HttpError,
  IResourceComponentsProps,
  useGetIdentity,
  useOne,
  useShow,
} from "@refinedev/core";
import { IAction, IDataset, IIdentity } from "@components/interfaces";
import { v4 as uuidv4 } from "uuid"; // Import the v4 function from the uuid library
import { useAppStore } from "src/store";
import { useEffect } from "react";

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const {
    setActiveRecord,
    setActiveActionId,
    setActiveSession,
    setActiveViewItem,
  } = useAppStore();

  // get sessions dataset
  const { queryResult } = useShow<IDataset>({
    resource: "datasets",
    id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
  });

  const { data, isLoading: isLoadingDataset, isError } = queryResult;
  // identity
  const { data: identity } = useGetIdentity<IIdentity>();
  // get create action
  let create_action_id = "actions:⟨018ea244-1082-749d-80a9-d9b080b74005⟩";
  // const { action, isLoading, error } = useFetchActionById(
  //   "actions:⟨018ea244-1082-749d-80a9-d9b080b74005⟩"
  // );
  // setActiveActionId({ id: create_action_id });

  // console.log("sessionDataset", sessionDataset);
  // const defaultDatasetListItem = datasetDataset.data?.data.list.find(
  //   (item) => item.name == "default"
  // );

  // // console.log("defaultSessionListItem", defaultSessionListItem);

  // const actionsList = defaultDatasetListItem?.actions;

  // const { queryResult } = useShow();

  // const { data, isLoading } = queryResult;

  // const application = data?.data;
  // when session changes, set activeDataset
  // useEffect(() => {
  //   if (action) {
  //     // console.log("action", action);
  //     setActiveActionId({id: action.id});
  //     // setActiveAction(action);
  //   }
  // }, [action]);

  useEffect(() => {
    if (data?.data) {
      setActiveRecord(data?.data);
      setActiveActionId({ id: create_action_id });
      // set this to null to trigger reading from activeRecord for items such as field_configurations
      setActiveSession(null);
      setActiveViewItem(data?.data);
    }
  }, [data?.data]);
  // const {
  //   getInputProps,
  //   saveButtonProps,
  //   setFieldValue,
  //   refineCore: { queryResult },
  // } = useForm({
  //   initialValues: {
  //     id: uuidv4(),
  //     name: "",
  //     description: "",
  //     author: identity?.email,
  //     session_status: "published",
  //   },
  // });

  return (
    <></>

    // <Create saveButtonProps={saveButtonProps}>
    //   <TextInput
    //     mt="sm"
    //     disabled
    //     required
    //     label="id"
    //     {...getInputProps("id")}
    //   />
    //   <TextInput mt="sm" required label="name" {...getInputProps("name")} />
    //   <Textarea
    //     autosize
    //     minRows={5}
    //     mt="sm"
    //     label="description"
    //     {...getInputProps("description")}
    //   />
    //   <TextInput
    //     mt="sm"
    //     disabled
    //     required
    //     label="author"
    //     {...getInputProps("author")}
    //   />
    // </Create>
  );
};
export default PageEdit;
