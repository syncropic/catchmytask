import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select, Textarea, MultiSelect } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState } from "react";
import { useGetIdentity } from "@refinedev/core";

type IIdentity = {
  [key: string]: any;
};
// Initial Data
const INITIAL_DATA = {};

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const [data, setData] = useState(INITIAL_DATA);
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
      from: "david.wanjala@snowstormtech.com",
      to_email_list: [],
      cc_email_list: [],
      description: "",
      department: "",
      type: "",
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

  const {
    data: personsData,
    isLoading: isLoadingPersonsData,
    isError: isErrorPersonsData,
  } = useList({
    resource: "persons",
  });

  const persons = personsData?.data
    ? personsData?.data.map((item) => ({
        // ...item,
        value: item.work_email,
        label: item.work_email,
      }))
    : [];
  // console.log("persons", persons);
  // console.log("pagesData", pagesData?.name);
  // console.log("identity", identity?.email);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput
        mt="sm"
        label="name"
        {...getInputProps("name")}
        disabled={pagesData?.name === "personal" ? true : false}
      />
      <TextInput mt="sm" label="from" {...getInputProps("from")} disabled />
      <MultiSelect
        mt="sm"
        label="to_email_list"
        // maxSelectedValues={1}
        searchable
        placeholder="to:"
        data={persons} // Replace with your options source
        // onChange={handleNameChange}
        {...getInputProps("to_email_list")}
        value={
          pagesData?.name == "personal"
            ? [identity?.email]
            : getInputProps("to_email_list").value
        }
        disabled={pagesData?.name === "personal" ? true : false}
        required
      />
      <MultiSelect
        mt="sm"
        label="cc_email_list"
        // maxSelectedValues={1}
        searchable
        placeholder="cc:"
        data={persons} // Replace with your options source
        // value={getInputProps("cc_email_list").value}
        {...getInputProps("cc_email_list")}
        // onChange={handleNameChange}
        disabled={pagesData?.name === "personal" ? true : false}
        required
      />
      <TextInput mt="sm" label="department" {...getInputProps("department")} />
      <TextInput mt="sm" label="type" {...getInputProps("type")} />
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
