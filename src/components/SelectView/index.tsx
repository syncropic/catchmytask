import { useFetchActionById } from "@components/Utils";
import {
  IActionsList,
  SelectActionComponentProps,
} from "@components/interfaces";
import { MultiSelect, Select, Tabs, Text } from "@mantine/core";
import { useForm } from "@refinedev/mantine";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";

interface IActiveActionId {
  id: string;
}

function UpdateActiveAction({ item }: { item: IActiveActionId }) {
  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  // console.log("actionId", item);
  const { action, isLoading, error } = useFetchActionById(item.id);
  // console.log("action", action);
  return null;
}

function SelectView<T extends Record<string, any>>({
  actions_list,
  record,
  view_item,
}: SelectActionComponentProps<T>) {
  // console.log("record - selectaction", record);
  const {
    setActiveRecord,
    setActiveViewItem,
    activeViewItem,
    setActiveActionId,
    activeActionId,
  } = useAppStore();

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
    reset,
  } = useForm({
    initialValues: {
      view: activeViewItem?.name || "",
    },
  });

  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  // const { action, isLoading, error } = useFetchActionById(
  //   activeActionId?.id || ""
  // );

  // useEffect(() => {
  //   // when action changes set activeAction
  //   if (action) {
  //     setActiveAction(action);
  //     // console.log("action", action);
  //   }
  //   // // Handle other dependencies like record and view_item here
  //   // use the passed in record and save that as active record
  //   if (record) {
  //     setActiveRecord(record);
  //     console.log("record", record);
  //   }
  //   if (view_item) {
  //     setActiveViewItem(view_item);
  //   }
  //   activateSection("rightSection");
  // }, [activeActionId, action, view_item, record]); // when activeActionId changes, fetch action and when action changes, set activeAction

  useEffect(() => {
    reset();

    // Step 1: Reset form with only 'author' and 'author_email'
    // const resetValues = {
    //   author: identity?.email,
    //   author_email: identity?.email,
    // };

    // const resetValues = {
    //   view: activeViewItem?.name || "",
    // };

    // // Reinitialize form with base values plus dynamic actionFormFieldValues
    // Object.entries({
    //   ...resetValues,
    //   ...actionFormFieldValues,
    // }).forEach(([key, value]) => {

    // });
    setFieldValue("view", activeViewItem?.name || "");
  }, [activeViewItem?.name]);

  interface ISelectedActionItem {
    id: string;
  }
  const handleUserInteraction = (selectedActionItem: ISelectedActionItem) => {
    // Update active action ID based on user selection
    // setActiveActionId({ id: selectedActionId });

    // Since we want to update the active record and action based on this user interaction,
    // ensure that these updates happen here as well.
    if (record) {
      setActiveRecord(record);
    }

    if (selectedActionItem) {
      setActiveActionId(selectedActionItem);
    }

    // Similarly, update any other relevant parts of the global state as necessary,
    // such as the active view item, based on the specific user interaction.
    if (view_item) {
      setActiveViewItem(view_item);
    }
  };
  // const handleActionChange = (value: string[]) => {
  //   // console.log("value", value[0]);
  //   setFieldValue("action", value);
  //   if (value[0]) {
  //     // setSelectedActionId(value[0]);
  //     setActiveActionId({ id: value[0] });
  //   }
  // };

  const handleActionChange = (value: any) => {
    // console.log("value", value);
    // find action name from actions_list where id is value[0]
    const action_name = actions_list?.find(
      (action: any) => action.id === value[0]
    )?.name;
    const action_object = {
      id: value[0],
      name: action_name,
    };

    if (value[0]) {
      handleUserInteraction(action_object);
    }
  };

  // //handle toggleDisplay
  // const activateSection = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };
  // console.log("activeviewitem", activeViewItem);

  return (
    <>
      <div className="flex w-full">
        <Select
          placeholder="Select view"
          // maxSelectedValues={1}
          searchable={true}
          data={[activeViewItem?.name]}
          // value={getInputProps("view").value}
          value={activeViewItem?.name}
          onChange={handleActionChange}
          withinPortal={true}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

export default SelectView;
