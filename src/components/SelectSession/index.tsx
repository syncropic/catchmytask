import { RetrieveFieldData, useFetchSessionById } from "@components/Utils";
import {
  FieldConfiguration,
  FieldData,
  IActionsList,
  SelectActionComponentProps,
  SelectSessionComponentProps,
} from "@components/interfaces";
import { MultiSelect, Select } from "@mantine/core";
import { useCustom, useGo } from "@refinedev/core";
import { useForm } from "@refinedev/mantine";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";

// interface IActiveSessionId {
//   id: string;
// }

// function UpdateActiveSession({ item }: { item: IActiveSessionId }) {
//   // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
//   // console.log("actionId", item);
//   const go = useGo();
//   const { activeApplication } = useAppStore();

//   const { data, isLoading, error } = useFetchSessionById(item?.id);
//   go({
//     to: {
//       resource: "sessions",
//       action: "show",
//       id: item?.id,
//       meta: {
//         applicationId: activeApplication?.id,
//       },
//     },
//     type: "push",
//   });

//   return null;
// }

function SelectSession<T extends Record<string, any>>({
  sessions_list,
  record,
  view_item,
}: SelectSessionComponentProps<T>) {
  // console.log("record - selectaction", record);
  const queryClient = useQueryClient();

  // set fieldFocused state variable to track which field is currently focused
  const [fieldFocused, setFieldFocused] = useState({} as FieldConfiguration);
  const {
    setActiveSessionId,
    activeSessionId,
    setActiveSession,
    activeApplication,
    // activeSession,
  } = useAppStore();
  const go = useGo();

  // console.log("activeSession", activeSession);

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
    isTouched,
  } = useForm({
    initialValues: {
      session: "",
    },
  });

  // interface ISelectedActionItem {
  //   id: string;
  // }
  // const handleUserInteraction = (selectedItem: ISelectedActionItem) => {
  //   // Update active action ID based on user selection
  //   // setActiveActionId({ id: selectedActionId });

  //   // Since we want to update the active record and action based on this user interaction,
  //   // ensure that these updates happen here as well.
  //   // if (record) {
  //   //   setActiveRecord(record);
  //   // }

  //   if (selectedItem) {
  //     setActiveSessionId(selectedItem);
  //   }
  //   // set activeField to null and focusedFields to null // ONLY do this if different action (+ on refresh for new data) otherwise keep the same values (cache)
  //   // i actually think this is not necessary as i can bind directly to the data return of the query
  //   // setActiveField({});
  //   // setFocusedFields({});

  //   // Similarly, update any other relevant parts of the global state as necessary,
  //   // such as the active view item, based on the specific user interaction.
  //   // if (view_item) {
  //   //   setActiveViewItem(view_item);
  //   // }
  //   // if (selectedActionItem) {
  //   //   activateSection("rightSection");
  //   // }
  // };
  // const handleActionChange = (value: string[]) => {
  //   // console.log("value", value[0]);
  //   setFieldValue("action", value);
  //   if (value[0]) {
  //     // setSelectedActionId(value[0]);
  //     setActiveActionId({ id: value[0] });
  //   }
  // };

  const handleSessionChange = (value: any) => {
    // console.log("value", value);
    // find action name from actions_list where id is value[0]
    // const session_name = sessions_list?.find(
    //   (action: any) => action.id === value
    // )?.name;
    // const session_object = {
    //   id: value,
    //   name: session_name,
    // };

    if (value) {
      // handleUserInteraction(session_object);
      setFieldValue("session", value);
      // set active session
      let selectedSession = fieldData?.data?.find(
        (session: any) => session.id === value
      );
      // console.log("selectedSesstion", selectedSesstion);
      setActiveSession(selectedSession);
      // navigate to the session
      go({
        to: {
          resource: "sessions",
          action: "show",
          id: selectedSession?.id || "",
          meta: {
            applicationId: activeApplication?.id,
          },
        },
        type: "push",
      });
    }
  };

  // This event handler now expects a field name (or some simple identifier) as an argument
  const handleFocus = (event: any) => {
    // console.log("event", event);
    // add it to the touchedFields
    // setTouchedFields([...touchedFields, field.field_name]);
    const fieldIsTouched = isTouched("session");
    // console.log("fieldIsTouched", fieldIsTouched);
    // console.log("field", field);
    // set the activeField
    // setActiveField(field);
    if (fieldIsTouched) {
      // If the field is already touched, don't refetch the data
      return;
    }
    // // console.log("fieldIsTouched", fieldIsTouched);
    // setFocusedFields({
    //   ...focusedFields,
    //   [field.field_name]: field,
    // }); // Set the name of the focused field
    // set fieldFocused to the field name
    setFieldFocused({ name: "session", visible: true });
  };

  const fieldData =
    queryClient.getQueryData<FieldData>([`field_data_for_session`]) || {};
  // console.log("fieldData", fieldData);

  return (
    <div className="flex items-end justify-center space-x-2">
      {/* <LoadingOverlay visible={dataset.isLoading} /> */}
      <Select
        placeholder="Select session"
        {...getInputProps("session")}
        // maxSelectedValues={1}
        searchable={true}
        onFocus={(e: any) => handleFocus(e)}
        // data={[]}
        data={(fieldData?.data || []).map((data_item: any) => ({
          value: data_item["id"],
          label: data_item["name"],
        }))}
        // value={getInputProps("action").value}
        onChange={handleSessionChange}
        // withinPortal={true}
        styles={{
          input: { width: "400px" },
          wrapper: { width: "400px" },
        }}
      />
      {fieldFocused?.name === "session" && (
        <RetrieveFieldData field={fieldFocused} />
      )}
      {/* {activeSessionId && (
        <UpdateActiveSession item={activeSessionId}></UpdateActiveSession>
      )} */}
    </div>
  );
}

export default SelectSession;
