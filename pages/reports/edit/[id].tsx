import {
  IResourceComponentsProps,
  useGetIdentity,
  useList,
} from "@refinedev/core";
import { Edit, useForm, useSelect, DateField } from "@refinedev/mantine";
import { TextInput, Select, Textarea, MultiSelect } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState } from "react";
import { useAppStore } from "src/store";

// Initial Data
const INITIAL_DATA = {};

type IIdentity = {
  [key: string]: any;
};

const emailTypeOptions = [
  {
    value: "default",
    label: "default",
  },
  {
    value: "personal",
    label: "personal",
  },
  {
    value: "internal",
    label: "internal",
  },
  {
    value: "company",
    label: "company",
  },
];

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const {
    data: mailListsData,
    isLoading: isLoadingMailListsData,
    isError: isErrorMailListsData,
  } = useList({
    resource: "mail_lists",
  });

  const mail_lists = mailListsData?.data
    ? mailListsData?.data.map((item) => ({
        ...item,
        value: item.name,
        label: item.name,
      }))
    : [];

  const { data: identity } = useGetIdentity<IIdentity>();

  const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
  const activeItem_2 = useAppStore((state) => state.activeItem_2);
  // persons
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
      custom_message: "",
      // mail_list: "",
      // name: [] as string[],
      // start_date: "",
      // end_date: "",
      // date_type: [] as string[],
      mail_list: [] as string[],
      to_email_list: [] as string[],
      cc_email_list: [] as string[],
      tags: "",
      from: "david.wanjala@snowstormtech.com",
      email_type: ["default"] as string[],
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
  const handleMailListChange = (value: string[]) => {
    // find item in report_options where value = value
    // console.log("value", value);
    const item = mail_lists.find((item) => item.value === value[0]);
    setActiveItem_2(item);
    // setActionType("create");
    // console.log("item", item);
    setFieldValue("mail_list", value);
  };
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
      <TextInput mt="sm" disabled label="name" {...getInputProps("name")} />
      {/* <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="start_date"
        placeholder="Date input"
        disabled
        {...getInputProps("start_date")}
      /> */}
      {/* <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="end_date"
        placeholder="Date input"
        disabled
        {...getInputProps("end_date")}
      /> */}

      <MultiSelect
        mt="sm"
        label="mail_list"
        placeholder="Select mail list"
        data={mail_lists} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        // {...getInputProps("mail_list")}
        value={getInputProps("mail_list").value}
        onChange={handleMailListChange}
        maxSelectedValues={1}
        searchable
        required
        disabled
      />
      <TextInput
        mt="sm"
        label="from"
        placeholder="from"
        // value="david.wanjala@snowstormtech.com"
        {...getInputProps("from")}
        disabled
      />
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
          activeItem_2?.name == "personal"
            ? [identity?.email]
            : getInputProps("to_email_list").value
        }
        disabled={activeItem_2?.name === "personal" ? true : false}
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
        disabled={activeItem_2?.name === "personal" ? true : false}
        required
      />
      <MultiSelect
        mt="sm"
        label="email_template"
        placeholder="Select email template"
        data={emailTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("email_type")}
        disabled
        required
      />
      <Textarea
        mt="sm"
        label="custom_message"
        autosize={true}
        minRows={3}
        placeholder="Custom message to include in the email"
        {...getInputProps("custom_message")}
      />
      <Textarea
        mt="sm"
        label="description"
        placeholder="Optional description"
        {...getInputProps("description")}
      />
      <TextInput
        mt="sm"
        label="tags"
        placeholder="Comma separated tags you can use to group reports i.e onewurld"
        {...getInputProps("tags")}
      />
    </Edit>
  );
};
export default PageEdit;
