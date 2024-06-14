import { useFetchActionById } from "@components/Utils";
import {
  IActionsList,
  SelectActionComponentProps,
} from "@components/interfaces";
import { MultiSelect } from "@mantine/core";
import { useForm } from "@refinedev/mantine";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";

interface IActiveActionId {
  id: string;
}

function UpdateActiveAction({ item }: { item: IActiveActionId }) {
  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  // console.log("actionId", item);

  const { action, isLoading, error } = useFetchActionById(item?.id);

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
    activeLayout,
    setActiveLayout,
    setActiveViewItem,
    setActiveActionId,
    activeActionId,
    setActiveField,
    setFocusedFields,
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
    // set activeField to null and focusedFields to null // ONLY do this if different action (+ on refresh for new data) otherwise keep the same values (cache)
    // i actually think this is not necessary as i can bind directly to the data return of the query
    // setActiveField({});
    // setFocusedFields({});

    // Similarly, update any other relevant parts of the global state as necessary,
    // such as the active view item, based on the specific user interaction.
    if (view_item) {
      setActiveViewItem(view_item);
    }
    if (selectedActionItem) {
      activateSection("rightSection");
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

  //handle toggleDisplay
  const activateSection = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };
  // console.log("action", action);
  // activateSection("rightSection") with useEffect
  // useEffect(() => {
  //   if (action) {
  //     activateSection("rightSection");
  //   }
  // }, [action]);

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
      {activeActionId && (
        <UpdateActiveAction item={activeActionId}></UpdateActiveAction>
      )}
    </div>
  );
}

export default SelectAction;
