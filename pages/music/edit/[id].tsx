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
      name: "",
      genre: "",
      tempo: "",
      description: "",
      // depart_at: new Date(),
      // updated_at: "",
      // notification_status: "",
      // old_pnr_text: "",
      // new_pnr_text: "",
      // lead_passenger_name: "",
      // package_id: "",
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
      <TextInput mt="sm" label="pnr" {...getInputProps("name")} />
      <TextInput mt="sm" label="genre" {...getInputProps("genre")} />
      <TextInput mt="sm" label="tempo" {...getInputProps("tempo")} />
      <Textarea
        mt="sm"
        autosize
        minRows={5}
        label="description"
        {...getInputProps("description")}
      />
    </Edit>
  );
};
export default PageEdit;
