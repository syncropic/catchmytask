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
      author: "",
      created_at: "",
      description: "",
      name: "",
      status: "",
    },
  });

  const { selectProps: nameSelectProps } = useSelect({
    resource: "names",
    optionLabel: "name",
  });

  const { selectProps: statusSelectProps } = useSelect({
    resource: "statuses",
    optionLabel: "name",
  });

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" label="Author" {...getInputProps("author")} />
      {/* 
                    DatePicker component is not included in "@refinedev/mantine" package.
                    To use a <DatePicker> component, you can follow the official documentation for Mantine.
                    
                    Docs: https://mantine.dev/dates/date-picker/
                */}
      <TextInput mt="sm" label="Created At" {...getInputProps("created_at")} />
      <TextInput
        mt="sm"
        label="Description"
        {...getInputProps("description")}
      />
    </Create>
  );
};
export default PageCreate;
