import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { TextInput, Select } from "@mantine/core";
import { useState } from "react";
import Editor from "./Editor";

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
      author: "",
      created_at: "",
      description: "",
      id: "",
      name: "",
      published: "",
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
      <TextInput mt="sm" disabled label="Id" {...getInputProps("id")} />
      <TextInput mt="sm" label="Name" {...getInputProps("name")} />
      <div className="editor">
        <Editor
          data={data}
          onChange={setData}
          editorblock="editorjs-container"
        />
        <button
          className="savebtn"
          onClick={() => {
            console.log(data);
          }}
        >
          Save
        </button>
      </div>
    </Edit>
  );
};
export default PageEdit;
