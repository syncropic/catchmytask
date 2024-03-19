import { useFetchActionById } from "@components/Utils";
import {
  IActionsList,
  SelectActionComponentProps,
} from "@components/interfaces";
import { MultiSelect } from "@mantine/core";
import { useForm } from "@refinedev/mantine";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";

function UpdateActiveRecord({ activeActionId }: { activeActionId: any }) {
  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const { action, isLoading, error } = useFetchActionById(
    activeActionId?.id || ""
  );
  console.log("action", action);
  return null;
}

function SelectAction<T extends Record<string, any>>({
  actions_list,
  record,
  view_item,
}: SelectActionComponentProps<T>) {
  // console.log("record - selectaction", record);
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {},
  });

  const {
    setActiveRecord,
    // activeLayout,
    // setActiveLayout,
    setActiveViewItem,
    // activeAction,
    // setActiveAction,
    setActiveActionId,
    activeActionId,
  } = useAppStore();

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

  const handleUserInteraction = (selectedActionId: string) => {
    // Update active action ID based on user selection
    // setActiveActionId({ id: selectedActionId });

    // Since we want to update the active record and action based on this user interaction,
    // ensure that these updates happen here as well.
    if (record) {
      setActiveRecord(record);
    }

    if (selectedActionId) {
      setActiveActionId({ id: selectedActionId });
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

  const handleActionChange = (value: string[]) => {
    if (value[0]) {
      handleUserInteraction(value[0]);
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

  return (
    <div className="flex items-end space-x-2">
      {/* <LoadingOverlay visible={dataset.isLoading} /> */}
      <MultiSelect
        placeholder="Select action"
        maxSelectedValues={1}
        searchable={true}
        data={actions_list?.map((action: IActionsList) => ({
          label: action?.name,
          value: action?.id,
        }))}
        value={getInputProps("action").value}
        onChange={handleActionChange}
        withinPortal={true}
        styles={{
          input: { width: "200px" },
          wrapper: { width: "200px" },
        }}
      />
      <UpdateActiveRecord activeActionId={activeActionId}></UpdateActiveRecord>
    </div>
  );
}

export default SelectAction;
