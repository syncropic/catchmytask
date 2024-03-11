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
  ScrollArea,
} from "@mantine/core";
import { Indicator, Text } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";
import { addSeparator } from "src/utils";
import { IIdentity } from "@components/interfaces";
import { AutomationTypeOption } from "../interfaces";
import { IconAffiliate, IconSearch } from "@tabler/icons-react";
import CodeBlock from "@components/codeblock/codeblock";
import dynamic from "next/dynamic";
import { useState } from "react";
import Form from "@components/Form";
import { extractFields } from "@components/Utils";
import ViewFileForm from "@components/ViewFileForm";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  // STORE ITEMS
  const {
    activeRequestData,
    activeActionOption,
    setActiveActionOption,
    setActionType,
    activeRecord,
    setActiveRecord,
  } = useAppStore();

  let data_items: any[] = [];
  let record = activeRecord;
  let opened: boolean = false;
  let action_options: any[] = [];
  let data_table: any = null;
  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();
  const [text, setText] = useState("");

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
      credentials: "onewurld_automated_reports",
      query_language: "sql",
      query: "",
      // frequency_cron_expression: "",
      // start_datetime: new Date(),
      // end_datetime: "",
      // request_data: activeRequestData,
      // automation_status: "inactive",
      // view_status: "published",
    },
  });

  // const go = useGo();
  // const { list } = useNavigation();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation();

  // const { mutate: mutateCreate } = useCreate();

  const handleSubmit = (e: any) => {
    let request_data = {
      ...values,
      // ...activeActionOption,
      // id: addSeparator(activeActionOption?.id, "action_options"),
      // values: {
      //   ...record,
      //   ...values, // so i can override original in the form if not disabled
      //   billing_addresses: JSON.parse(values?.billing_addresses),
      //   flight_segments: JSON.parse(values?.flight_segments),
      //   hotel_segments: JSON.parse(values?.hotel_segments),
      //   payment_methods: JSON.parse(values?.payment_methods),
      //   trip_passengers: JSON.parse(values?.trip_passengers),
      //   action_options: [
      //     addSeparator(activeActionOption?.id, "action_options"),
      //   ],
      // },
    };
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/reason`,
      dataProviderName: "catchmytaskApiDataProvider",
      method: "post",
      values: request_data,
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

  // const handleChangeFrequencyOption = (value: string) => {
  //   const selectedFrequency = frequency_options.find(
  //     (option) => option.value === value
  //   );
  //   if (selectedFrequency) {
  //     setFieldValue("frequency", selectedFrequency.value);
  //     setFieldValue("frequency_cron_expression", selectedFrequency.cron);
  //   }
  // };
  const extractedFields = extractFields(
    activeRecord,
    activeActionOption?.field_configurations || []
  );

  return (
    <>
      {activeActionOption && (
        // <Form
        //   activeActionOption={activeActionOption}
        //   activeRecord={activeRecord}
        //   extractedFields={extractedFields}
        // ></Form>
        <ViewFileForm
          resource="applications"
          activeActionOption={activeActionOption}
          activeRecord={activeRecord}
          extractedFields={extractedFields}
        ></ViewFileForm>
      )}
    </>
  );
};
export default PageCreate;
