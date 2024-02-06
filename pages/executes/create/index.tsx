import { IResourceComponentsProps, useCustomMutation } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { format, parseISO } from "date-fns";

// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateInput } from "@mantine/dates";

// It is required to extend dayjs with customParseFormat plugin
// in order to parse dates with custom format
// dayjs.extend(customParseFormat);

type IIdentity = {
  [key: string]: any;
};

// Example options for the select, replace with actual data source
const reportOptions = [
  {
    value: "onewurld_daily_bookings_and_charges_report",
    label: "onewurld daily bookings and charges report",
  },
  {
    value: "caesars_package_bookings_report",
    label: "caesars package bookings report",
  },
  {
    value: "caesars_flights_schedule_changes",
    label: "caesars flights schedule changes",
  },
];

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

// Example options for the select, replace with actual data source
const mailListOptions = [
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
      name: "",
      start_date: "",
      end_date: "",
      date_type: "",
      custom_message: "",
      mail_list: "personal",
      tags: "",
    },
  });

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

  // Handle select change
  const handleNameChange = (value: string) => {
    setFieldValue("name", value);
  };

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    let start_date: string = values?.start_date;
    let end_date: string = values?.end_date;
    console.log("start_date", start_date);

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
    let text_query = `Retrieve all onewurld bookings from cyDashBoardSetupTable where reporting date is >= ${start_date} and <= ${end_date}. The collection is onewurld`;
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: {
        task: {
          author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
          name: "onewurld_daily_bookings_and_charges_report",
          description: "onewurld_daily_bookings_and_charges_report",
          status: "active",
          id: "",
        },
        source: {
          location: "database",
          id: "task:⟨40c4a2ca-c35d-4ea7-bd33-084a6a5212dd⟩",
        },
        destination: {
          location: "database",
          record: "",
          id: "",
        },
        options: {
          sync_from_source_to_destination: true,
          delete_source_from_destination: false,
          plan_with_llm: false,
          rerun_execution_orders: [],
          execution_orders_range: [1, 20],
          execute_by: "execution_orders_range",
          user_feedback: "continue",
          create_database_record: true,
          update_record: true,
          record_task_field_name: "onewurld_daily_bookings_and_charges_report",
        },
        task_input: {
          generate_sql_query_01: {
            text_query: text_query,
          },
          create_email_message_01: {
            email_type: values?.mail_list,
            personal_message: values?.custom_message,
            internal_message: values?.custom_message,
          },
          send_email_message_01: {
            mail_list: values?.mail_list,
          },
        },
        values: {
          ...values,
          resource: "reports",
          author: identity?.email,
        },
      },
      successNotification: (data, values) => {
        // list("reports"); // It navigates to the `/posts` page

        return {
          message: `${values?.name} Successfully fetched.`,
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
      <Select
        mt="sm"
        label="name"
        placeholder="Choose report type to generate"
        data={reportOptions} // Replace with your options source
        value={getInputProps("name").value}
        onChange={handleNameChange}
        required
      />
      <Select
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
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="start_date"
        placeholder="Date input"
        {...getInputProps("start_date")}
      />
      <DateInput
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="end_date"
        placeholder="Date input"
        {...getInputProps("end_date")}
      />
      <Select
        mt="sm"
        label="mail_list"
        placeholder="Select mail list"
        data={mailListOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("mail_list")}
        // required
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
