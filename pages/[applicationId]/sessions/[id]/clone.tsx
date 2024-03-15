import { IResourceComponentsProps, useGetIdentity } from "@refinedev/core";
import {
  Edit,
  useForm,
  useSelect,
  DateField,
  Create,
} from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { IIdentity } from "@components/interfaces";
import { v4 as uuidv4 } from "uuid"; // Import the v4 function from the uuid library

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  // identity
  const { data: identity } = useGetIdentity<IIdentity>();
  let identifier = uuidv4();
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { queryResult },
  } = useForm({
    initialValues: {
      id: identifier,
      name: "",
      description: "",
      author: identity?.email,
      session_status: "",
      conditional_formatting: [] as any[],
      data_models: [] as any[],
      fields_configuration: [] as any[],
      active_query: "",
      resource: "",
    },
    transformValues: (values) => {
      return {
        ...values,
        id: identifier,
      };
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <TextInput
        mt="sm"
        disabled
        required
        label="id"
        {...getInputProps("id")}
        value={identifier}
      />
      <TextInput mt="sm" required label="name" {...getInputProps("name")} />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="description"
        {...getInputProps("description")}
      />
      <TextInput
        mt="sm"
        disabled
        required
        label="author"
        {...getInputProps("author")}
      />
      {/* {JSON.stringify(values)} */}
    </Create>
  );
};
export default PageEdit;
