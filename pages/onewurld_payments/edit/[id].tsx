import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState } from "react";

// Initial Data
const INITIAL_DATA = {};

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    refineCore: { queryResult },
  } = useForm({
    initialValues: {
      id: "",
      pnr: "",
      schedule_change_agent_name: "",
      schedule_change_hkd: "",
      depart_at: new Date(),
      updated_at: "",
      notification_status: "",
      old_pnr_text: "",
      new_pnr_text: "",
      lead_passenger_name: "",
      package_id: "",
    },
  });

  const pagesData = queryResult?.data?.data;

  // const { selectProps: nameSelectProps } = useSelect({
  //   resource: "names",
  //   defaultValue: pagesData?.name,
  //   optionLabel: "name",
  // });

  // const { selectProps: statusSelectProps } = useSelect({
  //   resource: "statuses",
  //   defaultValue: pagesData?.status,
  //   optionLabel: "name",
  // });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput mt="sm" label="pnr" {...getInputProps("pnr")} />
      <TextInput mt="sm" label="package_id" {...getInputProps("package_id")} />
      <TextInput
        mt="sm"
        label="agent"
        {...getInputProps("schedule_change_agent_name")}
      />
      <TextInput
        mt="sm"
        label="hkd"
        {...getInputProps("schedule_change_hkd")}
      />
      <TextInput mt="sm" label="depart_at" {...getInputProps("depart_at")} />
      <TextInput mt="sm" label="updated_at" {...getInputProps("updated_at")} />
      {/* <TextInput
        mt="sm"
        label="Notification Status"
        {...getInputProps("notification_status")}
      /> */}
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="old pnr text"
        {...getInputProps("old_pnr_text")}
      />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="new pnr text"
        {...getInputProps("new_pnr_text")}
      />
      <TextInput
        mt="sm"
        label="lead passenger name"
        {...getInputProps("lead_passenger_name")}
      />
    </Edit>
  );
};
export default PageEdit;
