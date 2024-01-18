import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select } from "@mantine/core";
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
      description: "",
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="Id" {...getInputProps("id")} />
      <TextInput mt="sm" label="Name" {...getInputProps("name")} />
      <TextInput
        mt="sm"
        label="Description"
        {...getInputProps("description")}
      />
    </Edit>
  );
};
export default PageEdit;