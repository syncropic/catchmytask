import { TextInput, Textarea } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/mantine";
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
      description: "",
    },
  });

  const pagesData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput mt="sm" label="pnr" {...getInputProps("name")} />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="description"
        {...getInputProps("description")}
      />
    </Edit>
  );
};
export default PageEdit;
