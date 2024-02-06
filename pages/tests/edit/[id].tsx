import { useState } from "react";
import {
  HttpError,
  IResourceComponentsProps,
  useCustomMutation,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Create, useForm, useSelect, Edit } from "@refinedev/mantine";
import {
  TextInput,
  Select,
  Textarea,
  Autocomplete,
  MultiSelect,
  Group,
  Checkbox,
  Button,
  NumberInput,
  Text,
  Title,
  Tooltip,
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
import { addSeparator } from "src/utils";
import { useListState } from "@mantine/hooks";
import TravelerDetailsComponent from "./TravelerDetailsComponent"; // Adjust the path as necessary
import TravelersComponent from "./TravelersComponent"; // Adjust the path as necessary

// It is required to extend dayjs with customParseFormat plugin
// in order to parse dates with custom format
// dayjs.extend(customParseFormat);

// Initial Data
const INITIAL_DATA = {};

type IIdentity = {
  [key: string]: any;
};

type IReport = {
  [key: string]: any;
};

// Example options for the select, replace with actual data source
const date_type_options = [
  {
    value: "reporting_date",
    label: "reporting_date",
  },
  {
    value: "booking_date",
    label: "booking_date",
  },
  {
    value: "travel_date",
    label: "travel_date",
  },
];

const airport_options = [
  {
    value: "LAS",
    label: "LAS",
  },
  {
    value: "YVR",
    label: "YVR",
  },
  {
    value: "SEA",
    label: "SEA",
  },
];

const flight_class_options = [
  {
    value: "ECONOMY",
    label: "ECONOMY",
  },
  {
    value: "FIRST",
    label: "FIRST",
  },
];

const continue_until_options = [
  {
    value: "flight_results_page",
    label: "flight_results_page",
  },
  {
    value: "hotel_results_page",
    label: "hotel_results_page",
  },
  {
    value: "checkout_page",
    label: "checkout_page",
  },
  {
    value: "booking_confirmed",
    label: "booking_confirmed",
  },
];

const flight_stops_options = [
  {
    value: "ANY",
    label: "ANY",
  },
  {
    value: "NONSTOP",
    label: "NONSTOP",
  },
];

const environment_type_options = [
  {
    value: "test",
    label: "test",
  },
  {
    value: "uat",
    label: "uat",
  },
  {
    value: "prod",
    label: "prod",
  },
];

const selection_type_options = [
  {
    value: "first_available_option",
    label: "first_available_option",
  },
  {
    value: "last_available_option",
    label: "last_available_option",
  },
];

const hotel_name_options = [
  {
    value: "first_available_option",
    label: "first_available_option",
  },
  {
    value: "last_available_option",
    label: "last_available_option",
  },
];

export const PageEdit: React.FC<IResourceComponentsProps> = () => {
  const { data: identity } = useGetIdentity<IIdentity>();

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
      // test configuration - all fields showing - all fields saving
      name: "test example",
      environment_type: ["test"],
      description: "test example description",
      base_url: "https://google.com",
      selection_type: ["first_available_option"],
      continue_until: ["checkout_page"],
      flight_sort: "price low - high",
      hotel_sort: "price low - high",
      // account info - all fields showing - all fields saving
      caesars_rewards_number: "",
      discount_code: "TEST",
      // travel date - all fields showing - all fields saving
      date_type: ["travel_date"],
      start_date: ["2024-01-19T04:23:36.268943064Z"],
      end_date: ["2024-01-19T04:23:36.268943064Z"],
      // flight filters - all fields showing
      flight_filters: {
        depart_airport_code: ["YVR"],
        arrive_airport_code: ["LAS"], // did not save
        class: ["ECONOMY"],
        stops: ["ANY"],
        outbound_departure_time_start: "00:00",
        outbound_departure_time_end: "23:59",
        inbound_departure_time_start: "00:00",
        inbound_departure_time_end: "23:59",
        fare_type: [],
        airlines: ["SHOW ALL"],
        cabin_options: [],
        flight_options: ["VIEW ALL"],
      },
      // hotel filters - all fields showing - all fields saving
      hotel_filters: {
        name: ["Flamingo Las Vegas"],
        room_type: ["FAB EXECUTIVE | 1 KING | NON-SMOKING"],
      },
      // billing address - all fields showing - all fields saving
      billing_address: {
        address_1: "128 West Cordova Street",
        city: "Vancouver",
        country: "Canada",
        phone_number: "+17782666611",
        phone_number_country: "Canada",
        province: "British Columbia",
        zip_code: "BC V6B 0E6",
      },
      // payment information - all fields showing - all fields saving
      payment_information: {
        accept_package_terms_and_conditions: true,
        card_holder_name: "David Wanjala",
        card_number: "123456",
        card_security_code: "123",
        expiration_month: "07-July",
        expiration_year: "2027",
        payment_type: "Visa",
      },
      // test results - all fields showing - all fields saving
      test: {
        result_url: "https://google.com",
        status: "pending",
        items_passed: 0,
        items_failed: 0,
        items_total: 0,
        last_run_at: [],
      },
      // traveler details - all fields showing
      traveler_details: [
        {
          date_of_birth_day: "18",
          date_of_birth_month: "Sep",
          date_of_birth_year: "1970",
          email_address: "dpwanjala@gmail.com",
          first_name: "David",
          frequent_flyer_number: "",
          last_name: "Wanjala",
          passport_number: "",
          phone_number: "+17782666611",
          phone_number_country: "Canada",
          room_number: 1,
          title: "Mr",
          traveler_number: 1,
          tsa_precheck: "",
        },
      ],
      // travelers - all fields showing - all fields saving * but need to use scrolling to add otherwise it add empty string
      travelers: [
        {
          adults: 2,
          children: 0,
          room_number: 1,
        },
      ],
      // additional comments - all fields showing - all fields saving
      additional_comments: "",
      author: identity?.email, // replace with actual author
      // created_at: "2024-01-21T06:07:41.978721060Z",
      // updated_at: "2024-01-21T06:07:41.978739668Z",
      // id: "tests:l1fyudfnlwn4quejzq6r",
      // test_result_url: "https://google.com",
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

  // console.log("identity", identity);

  // const handleNameChange = (value: string[]) => {
  //   const item = report_options.find((item) => item.value === value[0]);
  //   setActiveItem(item);
  //   setActionType("create");
  //   setFieldValue("name", value);
  // };

  // const handleMailListChange = (value: string[]) => {
  //   // find item in report_options where value = value
  //   // console.log("value", value);
  //   const item = mail_lists.find((item) => item.value === value[0]);
  //   setActiveItem_2(item);
  //   // setActionType("create");
  //   // console.log("item", item);
  //   setFieldValue("mail_list", value);
  // };

  const handleSubmit = (e: any) => {
    console.log("values", values);
    // let start_date: string = values?.start_date;
    // let end_date: string = values?.end_date;
    // // console.log("start_date", start_date);

    // // Function to format date, handling both string and Date types
    // const formatDate = (date: string | Date): string => {
    //   // if (!date) {
    //   //     return undefined;
    //   // }
    //   if (typeof date === "string") {
    //     // Handle as string
    //     return format(parseISO(date), "yyyy-MM-dd");
    //   } else {
    //     // Handle as Date object
    //     return format(date, "yyyy-MM-dd");
    //   }
    // };

    // // Convert dates to 'yyyy-MM-dd' format
    // start_date = formatDate(start_date);
    // end_date = formatDate(end_date);

    // if (!start_date || !end_date) {
    //   console.error("Invalid date format");
    //   return; // or handle error appropriately
    // }
    // // let text_query = `Retrieve all onewurld bookings from cyDashBoardSetupTable where reporting date is >= ${start_date} and <= ${end_date}. The collection is onewurld`;
    // mutate({
    //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
    //   method: "post",
    //   values: {
    //     ...activeItem,
    //     id: addSeparator(activeItem?.id, "report_options"),
    //     task_input: {
    //       ...activeItem?.task_input,
    //       create_email_message_1: {
    //         email_type: values?.mail_list,
    //         personal_message: values?.custom_message,
    //         internal_message: values?.custom_message,
    //         custom_message: values?.custom_message,
    //       },
    //       send_email_message_1: {
    //         mail_list: values?.mail_list,
    //       },
    //       generate_sql_query_1: {
    //         text_query: activeItem?.task_input?.generate_sql_query_1?.text_query
    //           ?.replace("${start_date}", start_date)
    //           .replace("${end_date}", end_date),
    //       },
    //       generate_sql_query_2: {
    //         text_query: activeItem?.task_input?.generate_sql_query_2?.text_query
    //           ?.replace("${start_date}", start_date)
    //           .replace("${end_date}", end_date),
    //       },
    //     },
    //     values: {
    //       ...values,
    //       resource: "reports",
    //       author: identity?.email,
    //       report_options: addSeparator(activeItem?.id, "report_options"),
    //     },
    //   },
    //   successNotification: (data, values) => {
    //     invalidate({
    //       resource: "reports",
    //       invalidates: ["list"],
    //     });
    //     list("reports"); // It navigates to list page
    //     return {
    //       message: `successfully created.`,
    //       description: "Success with no errors",
    //       type: "success",
    //     };
    //   },
    //   errorNotification: (data, values) => {
    //     return {
    //       message: `Something went wrong when getting ${values?.name}`,
    //       description: "Error",
    //       type: "error",
    //     };
    //   },
    // });
  };

  return (
    <Edit
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      // saveButtonProps={{
      //   disabled: saveButtonProps?.disabled,
      //   onClick: handleSubmit,
      // }}
      saveButtonProps={saveButtonProps}
    >
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4 flex flex-col space-y-4 justify-start">
        <div className="mb-2">
          <Title order={5}>Test Configuration</Title>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 justify-start items-start">
          <TextInput
            className="md:col-span-1"
            label="Name"
            required={true}
            {...getInputProps("name")}
          />
          <MultiSelect
            className="md:col-span-1"
            label="Environment Type"
            maxSelectedValues={1}
            data={environment_type_options}
            required={true}
            disabled={true}
            {...getInputProps("environment_type")}
          />
          <MultiSelect
            className="md:col-span-1"
            label="Selection Type"
            maxSelectedValues={1}
            data={selection_type_options}
            required={true}
            disabled={true}
            {...getInputProps("selection_type")}
          />
          <MultiSelect
            className="md:col-span-1"
            label="Continue Until"
            maxSelectedValues={1}
            data={continue_until_options}
            required={true}
            {...getInputProps("continue_until")}
          />
          <Select
            label="Flight Sort"
            className="w-full"
            data={[
              "price low - high",
              "price high - low",
              "duration short - long",
              "duration long - short",
            ]}
            {...getInputProps("flight_sort")}
          />
          <Select
            label="Hotel Sort"
            className="w-full"
            data={[
              "price low - high",
              "price high - low",
              "rating high - low",
              "rating low - high",
            ]}
            {...getInputProps("hotel_sort")}
          />
        </div>
        <TextInput
          className="md:col-span-1"
          label="Base URL"
          required={true}
          {...getInputProps("base_url")}
        />
        <Textarea
          className="md:col-span-1"
          label="Description"
          {...getInputProps("description")}
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Account Info</Title>
        </div>
        <div className="flex flex-wrap gap-4">
          <TextInput
            className="flex-1"
            label="Caesars Rewards Number"
            {...getInputProps("caesars_rewards_number")}
          />
          <TextInput
            className="flex-1"
            label="Discount Code"
            {...getInputProps("discount_code")}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <Title order={5} className="mb-4">
          Travel Date
        </Title>
        <div className="flex flex-wrap gap-4">
          <MultiSelect
            className="flex-1"
            label="Date Type"
            maxSelectedValues={1}
            data={date_type_options}
            required={true}
            disabled={true}
            {...getInputProps("date_type")}
          />
          <DateInput
            className="flex-1"
            required
            valueFormat="DD/MM/YYYY HH:mm:ss"
            label="Start Date"
            {...getInputProps("start_date")}
          />
          <DateInput
            className="flex-1"
            required
            valueFormat="DD/MM/YYYY HH:mm:ss"
            label="End Date"
            {...getInputProps("end_date")}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <Title order={5} className="mb-4">
          Flight Filters
        </Title>
        <div className="flex flex-wrap gap-4 mb-4">
          <MultiSelect
            className="flex-1"
            label="Depart Airport Code"
            maxSelectedValues={1}
            data={airport_options}
            required={true}
            {...getInputProps("flight_filters.depart_airport_code")}
          />
          <MultiSelect
            className="flex-1"
            label="Arrive Airport Code"
            maxSelectedValues={1}
            data={airport_options}
            required={true}
            {...getInputProps("flight_filters.arrive_airport_code")}
          />
          <MultiSelect
            className="flex-1"
            label="Flight Class"
            data={["ECONOMY", "PREMIUM ECONOMY", "BUSINESS", "FIRST"]}
            {...getInputProps("flight_filters.class")}
          />
          <MultiSelect
            className="flex-1"
            label="Stops"
            data={["ANY", "NONSTOP", "1STOP"]}
            {...getInputProps("flight_filters.stops")}
          />
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <TextInput
            className="flex-1"
            label="Outbound Departure Time Start"
            type="time"
            {...getInputProps("flight_filters.outbound_departure_time_start")}
          />
          <TextInput
            className="flex-1"
            label="Outbound Departure Time End"
            type="time"
            {...getInputProps("flight_filters.outbound_departure_time_end")}
          />
          <TextInput
            className="flex-1"
            label="Inbound Departure Time Start"
            type="time"
            {...getInputProps("flight_filters.inbound_departure_time_start")}
          />
          <TextInput
            className="flex-1"
            label="Inbound Departure Time End"
            type="time"
            {...getInputProps("flight_filters.inbound_departure_time_end")}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <MultiSelect
            className="flex-1"
            label="Fare Type"
            data={["NEGO", "PUBLISHED", "LCC"]}
            {...getInputProps("flight_filters.fare_type")}
          />
          <MultiSelect
            className="flex-1"
            label="Flight Options"
            data={["VIEW ALL", "RECOMMENDED", "LOW COST CARRIERS"]}
            {...getInputProps("flight_filters.flight_options")}
          />
          <MultiSelect
            className="flex-1"
            label="Airlines"
            data={[
              "SHOW ALL",
              "ALASKA AIRLINES",
              "AMERICAN AIRLINES",
              "DELTA AIR LINES",
              "FRONTIER AIRLINES",
            ]} // Replace with actual airline options
            {...getInputProps("flight_filters.airlines")}
          />
          <MultiSelect
            className="flex-1"
            label="Cabin Options"
            data={[
              "BASIC ECONOMY",
              "REFUNDABLE MAIN CABIN",
              "DELTA COMFORT PLUS",
            ]}
            {...getInputProps("flight_filters.cabin_options")}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <Title order={5} className="mb-4">
          Hotel Filters
        </Title>
        <div className="flex flex-wrap gap-4">
          <MultiSelect
            label="Hotel Name"
            className="flex-1"
            data={[
              "Flamingo Las Vegas",
              "Horseshoe Las Vegas",
              "The LINQ Hotel + Experience",
            ]}
            {...getInputProps("hotel_filters.name")}
          />
          <MultiSelect
            label="Room Type"
            className="flex-1"
            data={[
              "FAB EXECUTIVE | 1 KING | NON-SMOKING",
              "FAB ROOM | 1 KING | HIGH ROLLER VIEW | NON-SMOKING",
              "FAB EXECUTIVE | 2 QUEENS | NON-SMOKING",
            ]}
            {...getInputProps("hotel_filters.room_type")}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <Title order={5} className="mb-4">
          Billing Address
        </Title>
        <div className="flex flex-wrap gap-4">
          <TextInput
            label="Address 1"
            className="flex-1"
            {...getInputProps("billing_address.address_1")}
          />
          <TextInput
            label="City"
            className="flex-1"
            {...getInputProps("billing_address.city")}
          />
          <TextInput
            label="Country"
            className="flex-1"
            {...getInputProps("billing_address.country")}
          />
          <TextInput
            label="Phone Number"
            className="flex-1"
            {...getInputProps("billing_address.phone_number")}
          />
          <TextInput
            label="Phone Number Country"
            className="flex-1"
            {...getInputProps("billing_address.phone_number_country")}
          />
          <TextInput
            label="Province"
            className="flex-1"
            {...getInputProps("billing_address.province")}
          />
          <TextInput
            label="ZIP Code"
            className="flex-1"
            {...getInputProps("billing_address.zip_code")}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow my-4">
        <Title order={5} className="mb-4">
          Credit Card Details
        </Title>
        <Checkbox
          label="Accept Package Terms and Conditions"
          className="w-full mb-4"
          checked={
            values.payment_information.accept_package_terms_and_conditions
          }
          {...getInputProps(
            "payment_information.accept_package_terms_and_conditions"
          )}
        />
        <div className="flex flex-wrap gap-4">
          <TextInput
            label="Card Holder Name"
            className="flex-1"
            {...getInputProps("payment_information.card_holder_name")}
          />
          <TextInput
            label="Card Number"
            className="flex-1"
            {...getInputProps("payment_information.card_number")}
          />
          <TextInput
            label="Card Security Code"
            className="flex-1"
            {...getInputProps("payment_information.card_security_code")}
          />
          <Select
            label="Expiration Month"
            className="flex-1"
            {...getInputProps("payment_information.expiration_month")}
            data={[
              { value: "01-January", label: "January" },
              { value: "02-February", label: "February" },
              { value: "07-July", label: "July" },
            ]}
          />
          <TextInput
            label="Expiration Year"
            className="flex-1"
            {...getInputProps("payment_information.expiration_year")}
          />
          <Select
            label="Payment Type"
            className="flex-1"
            {...getInputProps("payment_information.payment_type")}
            data={[
              { value: "Visa", label: "Visa" },
              { value: "MasterCard", label: "MasterCard" },
            ]}
          />
        </div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-4">
          <Title order={5}>Travelers</Title>
        </div>
        <TravelersComponent
          travelers={values.travelers}
          setTravelers={(newTravelers) =>
            setFieldValue("travelers", newTravelers)
          }
        />
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-4">
          <Title order={5}>Traveler Details</Title>
        </div>
        <TravelerDetailsComponent
          travelerDetails={values.traveler_details}
          setTravelerDetails={(newDetails) =>
            setFieldValue("traveler_details", newDetails)
          }
        />
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Additional Comments</Title>
        </div>
        <Textarea
          label="Additional Comments"
          {...getInputProps("additional_comments")}
        />
      </div>
      <Tooltip label="This section will be filled after running test (Leave blank)">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
          <div className="mb-2">
            <Title order={5}>Test Results</Title>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <Select
              className="flex-1"
              label="Status"
              data={["success", "failure", "pending"]}
              defaultValue="success"
              {...getInputProps("test.status")}
            />
            <NumberInput
              className="flex-1"
              label="Items Passed"
              defaultValue={0}
              min={0}
              {...getInputProps("test.items_passed")}
            />
            <NumberInput
              className="flex-1"
              label="Items Failed"
              defaultValue={0}
              min={0}
              {...getInputProps("test.items_failed")}
            />
            <NumberInput
              className="flex-1"
              label="Items Total"
              defaultValue={0}
              min={0}
              {...getInputProps("test.items_total")}
            />
          </div>
          <TextInput
            className="w-full"
            label="Result URL"
            defaultValue="https://google.com"
            {...getInputProps("test.result_url")}
          />
        </div>
      </Tooltip>
    </Edit>
  );
};
export default PageEdit;

// export const PageEdit: React.FC<IResourceComponentsProps> = () => {
//   const {
//     data: mailListsData,
//     isLoading: isLoadingMailListsData,
//     isError: isErrorMailListsData,
//   } = useList({
//     resource: "mail_lists",
//   });

//   const mail_lists = mailListsData?.data
//     ? mailListsData?.data.map((item) => ({
//         ...item,
//         value: item.name,
//         label: item.name,
//       }))
//     : [];

//   const { data: identity } = useGetIdentity<IIdentity>();

//   const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
//   const activeItem_2 = useAppStore((state) => state.activeItem_2);
//   // persons
//   const {
//     data: personsData,
//     isLoading: isLoadingPersonsData,
//     isError: isErrorPersonsData,
//   } = useList({
//     resource: "persons",
//   });

//   const persons = personsData?.data
//     ? personsData?.data.map((item) => ({
//         // ...item,
//         value: item.work_email,
//         label: item.work_email,
//       }))
//     : [];
//   const [data, setData] = useState(INITIAL_DATA);
//   const {
//     getInputProps,
//     saveButtonProps,
//     setFieldValue,
//     refineCore: { queryResult },
//   } = useForm({
//     initialValues: {
//       id: "",
//       name: "",
//       environment_type: "",
//       description: "",
//       custom_message: "",
//       // mail_list: "",
//       // name: [] as string[],
//       // start_date: "",
//       // end_date: "",
//       // date_type: [] as string[],
//       mail_list: [] as string[],
//       to_email_list: [] as string[],
//       cc_email_list: [] as string[],
//       tags: "",
//       from: "david.wanjala@snowstormtech.com",
//       email_type: ["default"] as string[],
//     },
//   });

//   const pagesData = queryResult?.data?.data;

//   // const { selectProps: nameSelectProps } = useSelect({
//   //   resource: "names",
//   //   defaultValue: pagesData?.name,
//   //   optionLabel: "name",
//   // });

//   // const { selectProps: statusSelectProps } = useSelect({
//   //   resource: "statuses",
//   //   defaultValue: pagesData?.status,
//   //   optionLabel: "name",
//   // });
//   const handleMailListChange = (value: string[]) => {
//     // find item in report_options where value = value
//     // console.log("value", value);
//     const item = mail_lists.find((item) => item.value === value[0]);
//     setActiveItem_2(item);
//     // setActionType("create");
//     // console.log("item", item);
//     setFieldValue("mail_list", value);
//   };
//   return (
//     <Edit saveButtonProps={saveButtonProps}>
//       <TextInput mt="sm" disabled label="id" {...getInputProps("id")} />
//       <TextInput mt="sm" label="name" {...getInputProps("name")} />
//       {/* <DateInput
//         required
//         valueFormat="DD/MM/YYYY HH:mm:ss"
//         label="start_date"
//         placeholder="Date input"
//         disabled
//         {...getInputProps("start_date")}
//       /> */}
//       {/* <DateInput
//         required
//         valueFormat="DD/MM/YYYY HH:mm:ss"
//         label="end_date"
//         placeholder="Date input"
//         disabled
//         {...getInputProps("end_date")}
//       /> */}

//       <MultiSelect
//         mt="sm"
//         label="mail_list"
//         placeholder="Select mail list"
//         data={mail_lists} // Replace with your options source
//         // value={getInputProps("date_type").value}
//         // onChange={handleNameChange}
//         // {...getInputProps("mail_list")}
//         value={getInputProps("mail_list").value}
//         onChange={handleMailListChange}
//         maxSelectedValues={1}
//         searchable
//         required
//         disabled
//       />
//       <TextInput
//         mt="sm"
//         label="from"
//         placeholder="from"
//         // value="david.wanjala@snowstormtech.com"
//         {...getInputProps("from")}
//         disabled
//       />
//       <MultiSelect
//         mt="sm"
//         label="to_email_list"
//         // maxSelectedValues={1}
//         searchable
//         placeholder="to:"
//         data={persons} // Replace with your options source
//         // onChange={handleNameChange}
//         {...getInputProps("to_email_list")}
//         value={
//           activeItem_2?.name == "personal"
//             ? [identity?.email]
//             : getInputProps("to_email_list").value
//         }
//         disabled={activeItem_2?.name === "personal" ? true : false}
//         required
//       />
//       <MultiSelect
//         mt="sm"
//         label="cc_email_list"
//         // maxSelectedValues={1}
//         searchable
//         placeholder="cc:"
//         data={persons} // Replace with your options source
//         // value={getInputProps("cc_email_list").value}
//         {...getInputProps("cc_email_list")}
//         // onChange={handleNameChange}
//         disabled={activeItem_2?.name === "personal" ? true : false}
//         required
//       />
//       <MultiSelect
//         mt="sm"
//         label="environment_type"
//         placeholder="Select environment type"
//         data={environmentTypeOptions} // Replace with your options source
//         // value={getInputProps("date_type").value}
//         // onChange={handleNameChange}
//         {...getInputProps("environment_type")}
//         // disabled
//         required
//       />
//       <Textarea
//         mt="sm"
//         label="custom_message"
//         autosize={true}
//         minRows={3}
//         placeholder="Custom message to include in the email"
//         {...getInputProps("custom_message")}
//       />
//       <Textarea
//         mt="sm"
//         label="description"
//         placeholder="Optional description"
//         {...getInputProps("description")}
//       />
//       <TextInput
//         mt="sm"
//         label="tags"
//         placeholder="Comma separated tags you can use to group reports i.e onewurld"
//         {...getInputProps("tags")}
//       />
//     </Edit>
//   );
// };
// export default PageEdit;
