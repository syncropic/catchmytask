import { Button, LoadingOverlay, MultiSelect, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
} from "src/utils";

import { AutomationActionConfigurationProps } from "@components/interfaces";
import RetrieveDatasets from "@components/RetrieveDatasets";
import { useAppStore } from "src/store";
import TripsList from "pages/trips";
import OnewurldBookingsList from "pages/onewurld_bookings";

export function AutomationActionConfiguration<T extends Record<string, any>>({
  automation_values,
}: // activeActionOption,
// setActiveActionOption,
// action_options,
// identity,
// open,
// close,
// opened,
// record,
// data_items,
AutomationActionConfigurationProps<T>) {
  const invalidate = useInvalidate();
  const { setActionType, activeDataModel, setActiveDataModel } = useAppStore();

  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  // const {
  //   getInputProps,
  //   saveButtonProps,
  //   setFieldValue,
  //   values,
  //   refineCore: { formLoading, onFinish },
  //   onSubmit,
  // } = useForm({
  //   initialValues: {
  //     start_date: "",
  //     end_date: "",
  //     date_type: [] as string[],
  //     email_type: [] as string[],
  //     custom_message: "",
  //     mail_list: [] as string[],
  //     id: "",
  //   },
  // });

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      // author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      // description: "",
      // name: [] as string[],
      // start_date: "",
      // end_date: "",
      // date_type: [] as string[],
      // custom_message: "",
      // // custom_message: "",
      // mail_list: [] as string[],
      // id: "",
      // // to_email_list: ["dp.wanjala@gmail.com"] as string[],
      // // cc_email_list: [] as string[],
      // // tags: "",
      // // from: "david.wanjala@snowstormtech.com",
      // email_type: ["default"] as string[],
    },
  });

  // const handleActionChange = (value: string[]) => {
  //   const item = action_options.find((item) => item.value === value[0]);
  //   // setActiveItem(item);
  //   // setActionType("create");
  //   setFieldValue("action", value);
  // };

  // const handleDateTypeChange = (value: string[]) => {
  //   // const item = action_options.find((item) => item.value === value[0]);
  //   // setActiveItem(item);
  //   // setActionType("create");
  //   setFieldValue("date_type", value);
  // };

  const handleSubmit = (e: any) => {
    console.log("automation_values", automation_values);
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
      // contentProps={{
      //   style: {
      //     // backgroundColor: "cornflowerblue",
      //     padding: "16px",
      //     height: "420px",
      //   },
      // }}
      // title={<Title order={3}>Configure and Execute Action</Title>}
      title={false}
      goBack={false}
      breadcrumb={false}
      footerButtons={({ saveButtonProps }) => (
        <>
          {/* <SaveButton {...saveButtonProps} fullWidth>
            Save Automation
          </SaveButton> */}
        </>
      )}
    >
      {automation_values?.data_models &&
        automation_values.data_models.length > 0 &&
        automation_values.data_models[0] === "trips" && <TripsList />}
      {automation_values?.data_models &&
        automation_values.data_models.length > 0 &&
        automation_values.data_models[0] === "onewurld_bookings" && (
          <OnewurldBookingsList />
        )}
    </Create>
  );
}

export default AutomationActionConfiguration;
