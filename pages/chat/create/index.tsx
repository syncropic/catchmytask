import {
  HttpError,
  IResourceComponentsProps,
  useCreate,
  useCustomMutation,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Create, SaveButton, useForm, useSelect } from "@refinedev/mantine";
import {
  TextInput,
  Select,
  Textarea,
  Autocomplete,
  MultiSelect,
  Title,
  Tabs,
} from "@mantine/core";
import { Indicator, Text } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { format, parseISO, set } from "date-fns";
import { DateInput } from "@mantine/dates";
import { useAppStore } from "src/store";
import { addSeparator } from "src/utils";
import { IIdentity } from "@components/interfaces";
import { AutomationTypeOption } from "../interfaces";

const automation_type_options: {
  value: AutomationTypeOption;
  label: string;
}[] = [
  { value: "webhook", label: "webhook" },
  { value: "scheduled", label: "scheduled" },
  { value: "event-triggered", label: "event-triggered" },
];

const frequency_options = [
  { value: "every-1-minute", label: "Every 1 Minute", cron: "*/1 * * * *" },
  { value: "every-5-minutes", label: "Every 5 Minutes", cron: "*/5 * * * *" },
  {
    value: "every-10-minutes",
    label: "Every 10 Minutes",
    cron: "*/10 * * * *",
  },
  {
    value: "every-15-minutes",
    label: "Every 15 Minutes",
    cron: "*/15 * * * *",
  },
  {
    value: "every-30-minutes",
    label: "Every 30 Minutes",
    cron: "*/30 * * * *",
  },
  { value: "every-1-hour", label: "Every 1 Hour", cron: "0 * * * *" },
  { value: "every-2-hours", label: "Every 2 Hours", cron: "0 */2 * * *" },
  { value: "every-3-hours", label: "Every 3 Hours", cron: "0 */3 * * *" },
  { value: "every-4-hours", label: "Every 4 Hours", cron: "0 */4 * * *" },
  { value: "every-6-hours", label: "Every 6 Hours", cron: "0 */6 * * *" },
  { value: "every-8-hours", label: "Every 8 Hours", cron: "0 */8 * * *" },
  { value: "every-12-hours", label: "Every 12 Hours", cron: "0 */12 * * *" },
  { value: "every-1-day", label: "Every Day", cron: "0 0 * * *" },
  { value: "every-2-days", label: "Every 2 Days", cron: "0 0 */2 * *" },
  { value: "every-3-days", label: "Every 3 Days", cron: "0 0 */3 * *" },
  { value: "every-1-week", label: "Every Week", cron: "0 0 * * 0" },
  {
    value: "every-2-weeks",
    label: "Every 2 Weeks",
    cron: "Not directly supported by standard CRON",
  },
  { value: "every-1-month", label: "Every Month", cron: "0 0 1 * *" },
  { value: "every-2-months", label: "Every 2 Months", cron: "0 0 1 */2 *" },
  { value: "every-3-months", label: "Every 3 Months", cron: "0 0 1 */3 *" },
  { value: "every-6-months", label: "Every 6 Months", cron: "0 0 1 */6 *" },
  { value: "every-1-year", label: "Every Year", cron: "0 0 1 1 *" },
];

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  // STORE ITEMS
  const { activeRequestData } = useAppStore();
  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      author: identity?.email,
      author_email: identity?.email,
      name: activeRequestData?.display_name,
      description: activeRequestData?.display_name,
      automation_types: ["scheduled"] as string[],
      frequency_input_type: "option",
      frequency: "",
      frequency_cron_expression: "",
      start_datetime: new Date(),
      end_datetime: "",
      request_data: activeRequestData,
      automation_status: "inactive",
      view_status: "published",
    },
  });

  const go = useGo();
  const { list } = useNavigation();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  const { mutate: mutateCreate } = useCreate();

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    // console.log("request_data", activeRequestData);
    // console.log("activeActionOption", activeActionOption);
    // console.log("activeRecord", activeRecord);
    // let request_data = {
    //   ...activeActionOption,
    //   id: addSeparator(activeActionOption?.id, "action_options"),
    //   values: {
    //     ...record,
    //     ...values, // so i can override original in the form if not disabled
    //     action_options: [
    //       addSeparator(activeActionOption?.id, "action_options"),
    //     ],
    //   },
    // };
    mutateCreate({
      resource: "automations",
      values: values,
      successNotification: (data, values) => {
        // invalidate({
        //   resource: "caesars_bookings",
        //   invalidates: ["list"],
        // });
        // close();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  const handleChangeFrequencyOption = (value: string) => {
    const selectedFrequency = frequency_options.find(
      (option) => option.value === value
    );
    if (selectedFrequency) {
      setFieldValue("frequency", selectedFrequency.value);
      setFieldValue("frequency_cron_expression", selectedFrequency.cron);
    }
  };

  const handleCreateChat = () => {
    console.log("handleCreateChat");
    // let request_data = {
    //   ...activeActionOption,
    //   options: {
    //     ...activeActionOption?.options,
    //     execution_action_step_names: [
    //       "get_collection_info_1",
    //       "get_credential_info_1",
    //       "update_record_fields_1",
    //     ],
    //     execute_by: "execution_action_step_names",
    //     execution_includes: "save_only",
    //   },
    //   id: addSeparator(activeActionOption?.id, "action_options"),
    //   values: {
    //     ...record,
    //     ...values, // so i can override original in the form if not disabled
    //     action_options: [
    //       addSeparator(activeActionOption?.id, "action_options"),
    //     ],
    //   },
    // };
    // setActiveRequestData(request_data);
    // openAutomation();
  };

  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
        size: "xs",
      }}
      breadcrumb={false}
      title={<Title order={3}>Automate</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <div className="flex w-full">
          {/* <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/3"
            variant="light"
            leftIcon={<IconDatabaseShare size={16} />}
            disabled={mutationIsLoading}
            onClick={handleSaveOnly}
          >
            Save Only
          </SaveButton> */}
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-3/3"
            variant="filled"
            // leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Create Automation
          </SaveButton>
        </div>
      )}
    >
      <div>Chat History:</div>
      <Textarea
        minRows={5}
        required
        mt="sm"
        label="chat_message"
        placeholder="chat_message"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("chat_message")}
        // value={record?.contact_email}
        // disabled
        // required
      />
    </Create>
  );
};
export default PageCreate;
