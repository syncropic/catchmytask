import { IResourceComponentsProps, useGetIdentity } from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { IIdentity } from "@components/interfaces";

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  // identity
  const { data: identity } = useGetIdentity<IIdentity>();
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
      author: identity?.email,
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput mt="sm" label="name" {...getInputProps("name")} />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="description"
        {...getInputProps("description")}
      />
      <TextInput mt="sm" disabled label="author" {...getInputProps("author")} />
    </Edit>
  );
};
export default PageEdit;
