import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState } from "react";

// Initial Data
const INITIAL_DATA = {};

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  // const [data, setData] = useState(INITIAL_DATA);
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    refineCore: { queryResult },
  } = useForm({
    initialValues: {
      id: "",
      airline_name: "",
      airline_carrier_type: "",
      airline_code: "",
      airline_customer_support_url: "",
      airline_find_my_trip_section_label: "",
      airline_trip_page_url: "",
    },
  });

  const pagesData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput
        mt="sm"
        label="airline_name"
        {...getInputProps("airline_name")}
      />
      <TextInput
        mt="sm"
        label="airline_carrier_type"
        {...getInputProps("airline_carrier_type")}
      />
      <TextInput
        mt="sm"
        label="airline_code"
        {...getInputProps("airline_code")}
      />
      <TextInput
        mt="sm"
        label="airline_customer_support_url"
        {...getInputProps("airline_customer_support_url")}
      />
      <TextInput
        mt="sm"
        label="airline_find_my_trip_section_label"
        {...getInputProps("airline_find_my_trip_section_label")}
      />
      <TextInput
        mt="sm"
        label="airline_trip_page_url"
        {...getInputProps("airline_trip_page_url")}
      />
    </Edit>
  );
};
export default PageEdit;
