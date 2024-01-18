import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm, useSelect } from "@refinedev/mantine";
import { TextInput, Select, Textarea } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateInput } from "@mantine/dates";

// It is required to extend dayjs with customParseFormat plugin
// in order to parse dates with custom format
// dayjs.extend(customParseFormat);

type IIdentity = {
  id: number;
  fullName: string;
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

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    refineCore: { formLoading },
  } = useForm({
    initialValues: {
      author: "",
      // created_at: "",
      description: "",
      name: "",
      start_date: "",
      end_date: "",
      date_type: "",
    },
  });
  const { data: identity } = useGetIdentity<IIdentity>();
  // console.log("identity", identity);

  // Handle select change
  const handleNameChange = (value: string) => {
    setFieldValue("name", value);
  };

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
      <Textarea
        mt="sm"
        label="description"
        placeholder="Optional description"
        {...getInputProps("description")}
      />
    </Create>
  );
};
export default PageCreate;
