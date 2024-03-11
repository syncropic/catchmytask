import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/mantine";
import { TextInput, Select } from "@mantine/core";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    refineCore: { formLoading },
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

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
    </Create>
  );
};
export default PageCreate;
