import {
  HttpError,
  IResourceComponentsProps,
  useCustomMutation,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/mantine";
import {
  TextInput,
  Select,
  Textarea,
  Autocomplete,
  MultiSelect,
} from "@mantine/core";
import { Indicator } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { format, parseISO, set } from "date-fns";

// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateInput } from "@mantine/dates";
import { useAppStore } from "src/store";
import { addSeparator, removeSeparator } from "src/utils";

// It is required to extend dayjs with customParseFormat plugin
// in order to parse dates with custom format
// dayjs.extend(customParseFormat);

type IIdentity = {
  [key: string]: any;
};

type IReport = {
  [key: string]: any;
};

// Example options for the select, replace with actual data source
const dateTypeOptions = [
  {
    value: "reporting_date",
    label: "reporting_date",
  },
  {
    value: "booking_date",
    label: "booking_date",
  },
  {
    value: "travelling_date",
    label: "travelling_date",
  },
];

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

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const { show } = useNavigation();

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
  // additions
  const {
    data: reportOptionsData,
    isLoading: isLoadingReportOptionsData,
    isError: isErrorReportOptionsData,
  } = useList({
    resource: "report_options",
  });

  const {
    data: mailListsData,
    isLoading: isLoadingMailListsData,
    isError: isErrorMailListsData,
  } = useList({
    resource: "mail_lists",
  });

  const setActionType = useAppStore((state) => state.setActionType);
  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem);
  const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
  const activeItem_2 = useAppStore((state) => state.activeItem_2);

  // add value and label to the options for display
  const report_options = reportOptionsData?.data
    ? reportOptionsData?.data.map((option) => ({
        ...option,
        value: option.display_name,
        label: option.display_name,
      }))
    : [];

  const mail_lists = mailListsData?.data
    ? mailListsData?.data.map((item) => ({
        ...item,
        value: item.name,
        label: item.name,
      }))
    : [];

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "",
      name: [] as string[],
      start_date: "",
      end_date: "",
      date_type: [] as string[],
      custom_message: "",
      mail_list: [] as string[],
      to_email_list: ["dp.wanjala@gmail.com"] as string[],
      cc_email_list: [] as string[],
      tags: "",
      from: "david.wanjala@snowstormtech.com",
      email_type: ["default"] as string[],
    },
  });

  const invalidate = useInvalidate();

  const go = useGo();
  const { list } = useNavigation();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // Define the object with the specified keys and values
  const createReportRequestData = {};

  const { data: identity } = useGetIdentity<IIdentity>();
  // console.log("identity", identity);

  const handleNameChange = (value: string[]) => {
    const item = report_options.find((item) => item.value === value[0]);
    setActiveItem(item);
    setActionType("create");
    setFieldValue("name", value);
  };

  const handleMailListChange = (value: string[]) => {
    // find item in report_options where value = value
    // console.log("value", value);
    const item = mail_lists.find((item) => item.value === value[0]);
    setActiveItem_2(item);
    // setActionType("create");
    // console.log("item", item);
    setFieldValue("mail_list", value);
  };

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    let start_date: string = values?.start_date;
    let end_date: string = values?.end_date;
    // console.log("start_date", start_date);

    // Function to format date, handling both string and Date types
    const formatDate = (date: string | Date): string => {
      // if (!date) {
      //     return undefined;
      // }
      if (typeof date === "string") {
        // Handle as string
        return format(parseISO(date), "yyyy-MM-dd");
      } else {
        // Handle as Date object
        return format(date, "yyyy-MM-dd");
      }
    };

    // Convert dates to 'yyyy-MM-dd' format
    start_date = formatDate(start_date);
    end_date = formatDate(end_date);

    if (!start_date || !end_date) {
      console.error("Invalid date format");
      return; // or handle error appropriately
    }
    // let text_query = `Retrieve all onewurld bookings from cyDashBoardSetupTable where reporting date is >= ${start_date} and <= ${end_date}. The collection is onewurld`;
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: {
        ...activeItem,
        id: addSeparator(activeItem?.id, "report_options"),
        task_input: {
          ...activeItem?.task_input,
          create_email_message_1: {
            email_type: values?.mail_list,
            personal_message: values?.custom_message,
            internal_message: values?.custom_message,
            custom_message: values?.custom_message,
          },
          send_email_message_1: {
            mail_list: values?.mail_list,
          },
          generate_sql_query_1: {
            text_query: activeItem?.task_input?.generate_sql_query_1?.text_query
              ?.replace("${start_date}", start_date)
              .replace("${end_date}", end_date),
          },
          generate_sql_query_2: {
            text_query: activeItem?.task_input?.generate_sql_query_2?.text_query
              ?.replace("${start_date}", start_date)
              .replace("${end_date}", end_date),
          },
        },
        values: {
          ...values,
          resource: "reports",
          author: identity?.email,
          report_options: addSeparator(activeItem?.id, "report_options"),
        },
      },
      successNotification: (data, values) => {
        invalidate({
          resource: "reports",
          invalidates: ["list"],
        });
        // list("reports"); // It navigates to list page
        // console.log("data", data);
        // console.log("values", values);
        show("reports", removeSeparator(data?.data?.id));

        return {
          message: `successfully created.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when getting ${values?.name}`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
      }}
    >
      {/* <TextInput mt="sm" label="author" {...getInputProps("author")} /> */}
      <MultiSelect
        mt="sm"
        label="name"
        maxSelectedValues={1}
        searchable
        placeholder="Choose report type to generate"
        data={report_options} // Replace with your options source
        value={getInputProps("name").value}
        onChange={handleNameChange}
        required
      />
      <MultiSelect
        required
        mt="sm"
        label="date_type"
        placeholder="Select date type"
        data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("date_type")}
        // required
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="start_date"
        placeholder="Start date"
        {...getInputProps("start_date")}
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="end_date"
        placeholder="End date"
        {...getInputProps("end_date")}
      />
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
        // required
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
        // required
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
    </Create>
  );
};
export default PageCreate;
