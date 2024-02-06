import {
  HttpError,
  IResourceComponentsProps,
  useBack,
  useCustomMutation,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Breadcrumb, Create, useForm, useSelect } from "@refinedev/mantine";
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
  MantineProvider,
  HoverCard,
} from "@mantine/core";
import { Indicator } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
import { useGo } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { format, parseISO, set } from "date-fns";
import { IField, IFilter, IView } from "./interfaces";

// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateInput } from "@mantine/dates";
import { useAppStore } from "src/store";
import { addSeparator } from "src/utils";
import { useListState } from "@mantine/hooks";
// import TravelerDetailsComponent from "./TravelerDetailsComponent"; // Adjust the path as necessary
// import TravelersComponent from "./TravelersComponent"; // Adjust the path as necessary
import {
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";

// It is required to extend dayjs with customParseFormat plugin
// in order to parse dates with custom format
// dayjs.extend(customParseFormat);

type IIdentity = {
  [key: string]: any;
};

type IReport = {
  [key: string]: any;
};

interface IDataModel {
  fields: IField[];
  filters: IFilter[];
  name: string;
}

// Example options for the select, replace with actual data source

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  // const { data: identity } = useGetIdentity<IIdentity>();

  // persons
  // const {
  //   data: personsData,
  //   isLoading: isLoadingPersonsData,
  //   isError: isErrorPersonsData,
  // } = useList({
  //   resource: "persons",
  // });

  // const persons = personsData?.data
  //   ? personsData?.data.map((item) => ({
  //       // ...item,
  //       value: item.work_email,
  //       label: item.work_email,
  //     }))
  //   : [];
  // additions
  // const {
  //   data: reportOptionsData,
  //   isLoading: isLoadingReportOptionsData,
  //   isError: isErrorReportOptionsData,
  // } = useList({
  //   resource: "report_options",
  // });

  //  // add value and label to the options for display
  //  const report_options = reportOptionsData?.data
  //  ? reportOptionsData?.data.map((option) => ({
  //      ...option,
  //      value: option.display_name,
  //      label: option.display_name,
  //    }))
  //  : [];

  // const {
  //   data: mailListsData,
  //   isLoading: isLoadingMailListsData,
  //   isError: isErrorMailListsData,
  // } = useList({
  //   resource: "mail_lists",
  // });

  // const mail_lists = mailListsData?.data
  // ? mailListsData?.data.map((item) => ({
  //     ...item,
  //     value: item.name,
  //     label: item.name,
  //   }))
  // : [];

  const setActionType = useAppStore((state) => state.setActionType);
  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem);
  const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
  const activeItem_2 = useAppStore((state) => state.activeItem_2);

  // view_options
  // const {
  //   data: viewOptionsData,
  //   isLoading: isLoadingViewOptionsData,
  //   isError: isErrorViewOptionsData,
  // } = useList({
  //   resource: "view_options",
  // });

  // const view_options = viewOptionsData?.data
  //   ? viewOptionsData?.data.map((item) => ({
  //       ...item,
  //       value: item.name,
  //       label: item.name,
  //     }))
  //   : [];

  // data_models
  const {
    data: dataModelsData,
    isLoading: isLoadingDataModelsData,
    isError: isErrorDataModelsData,
  } = useList<IDataModel>({
    resource: "data_models",
  });

  const data_models = dataModelsData?.data
    ? dataModelsData?.data.map((item) => ({
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
      data_models: [] as string[],
      name: "name your view",
      description: "describe this view briefly",
      fields_configuration: [] as IField[],
      filters_configuration: [] as IFilter[],
    },
  });

  const back = useBack();
  const BackButton = () => <Button>←</Button>;

  const invalidate = useInvalidate();
  const go = useGo();
  const { list } = useNavigation();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  const [data_model_columns, setDataModelColumns] = useState<IField[]>([]);
  const [data_model_filters, setDataModelFilters] = useState<IFilter[]>([]);

  // set the data_model_columns and data_model_filters when the values change
  useEffect(() => {
    // Ensure filters_configuration is populated then set the data model filters
    if (values.filters_configuration.length > 0) {
      setDataModelFilters(values.filters_configuration);
    }

    // Process fields_configuration if it's populated
    if (values.fields_configuration.length > 0) {
      // Filtering based on visibility or pin presence
      const filteredFields = values.fields_configuration.filter(
        (field) => field.visible || field.pin
      );
      setDataModelColumns(filteredFields);
    }
  }, [values]);

  // Define the object with the specified keys and values
  const createReportRequestData = {};

  // console.log("identity", identity);

  // const handleNameChange = (value: string[]) => {
  //   const item = report_options.find((item) => item.value === value[0]);
  //   setActiveItem(item);
  //   setActionType("create");
  //   setFieldValue("name", value);
  // };

  const handleDataModelChange = (value: string[]) => {
    // find item in report_options where value = value
    // console.log("value", value);
    const item = data_models.find((item) => item.value === value[0]);
    console.log("item", item);
    // setActiveItem_2(item);
    // // setActionType("create");
    // // console.log("item", item);
    // setDataModelColumns(item?.fields);
    // setDataModelFilters(item?.filters);
    setFieldValue("data_models", value);
  };

  const handleSubmit = (e: any) => {
    console.log("values", values);
  };

  const columns = useMemo<MRT_ColumnDef<IField>[]>(
    () => [
      {
        accessorKey: "field_name",
        header: "field_name",
      },
      {
        accessorKey: "display",
        header: "display",
        Cell: ({ row }) => {
          return <Checkbox checked={row.original.visible} />;
          //   return <div>{JSON.stringify(row.original)}</div>;
        },
      },
      {
        accessorKey: "pin_left",
        header: "pin_left",
        Cell: ({ row }) => {
          return <Checkbox checked={row.original?.pin == "left"} />;
        },
      },
      {
        accessorKey: "pin_right",
        header: "pin_right",
        Cell: ({ row }) => {
          return <Checkbox checked={row.original?.pin == "right"} />;
        },
      },
    ],
    []
  );

  // useMantineReactTable hook
  const data_model_columns_table = useMantineReactTable({
    columns,
    data: data_model_columns || [],
    enableColumnResizing: true,
    // enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    // enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    // enablePinning: true,
    initialState: {
      density: "xs",
      // showGlobalFilter: true,
      showColumnFilters: true,
      // pagination: { pageSize: 7, pageIndex: 0 },
      // sorting: [
      //   {
      //     id: "updated_at",
      //     desc: true,
      //   },
      // ],
    },
    // paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    // mantinePaginationProps: {
    //   radius: "xl",
    //   size: "xs",
    // },
    mantineSearchTextInputProps: {
      placeholder: "Search Views",
    },
  });

  // FILTERS
  const filters_columns = useMemo<MRT_ColumnDef<IFilter>[]>(
    () => [
      {
        accessorKey: "field_name",
        header: "field_name",
      },
      {
        accessorKey: "include",
        header: "include",
        Cell: ({ row }) => {
          return (
            <Group>
              <HoverCard width={280} shadow="md" withinPortal={true}>
                <HoverCard.Target>
                  <Text size="sm">{JSON.stringify(row.original.include)}</Text>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">{JSON.stringify(row.original.include)}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          );
        },
      },
      {
        accessorKey: "exclude",
        header: "exclude",
        Cell: ({ row }) => {
          return (
            <Group>
              <HoverCard width={280} shadow="md" withinPortal={true}>
                <HoverCard.Target>
                  <Text size="sm">{JSON.stringify(row.original.exclude)}</Text>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">{JSON.stringify(row.original.exclude)}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          );
        },
      },
      {
        accessorKey: "range_start",
        header: "range_start",
        Cell: ({ row }) => {
          return <div>{JSON.stringify(row.original.range_start)}</div>;
        },
      },
      {
        accessorKey: "range_end",
        header: "range_end",
        Cell: ({ row }) => {
          return <div>{JSON.stringify(row.original.range_end)}</div>;
        },
      },
    ],
    []
  );
  // useMantineReactTable hook
  const data_model_filters_table = useMantineReactTable({
    columns: filters_columns,
    data: data_model_filters || [],
    enableColumnResizing: true,
    // enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    // enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    // enablePinning: true,
    initialState: {
      density: "xs",
      // showGlobalFilter: true,
      showColumnFilters: true,
      // pagination: { pageSize: 7, pageIndex: 0 },
      // sorting: [
      //   {
      //     id: "updated_at",
      //     desc: true,
      //   },
      // ],
    },
    // paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    // mantinePaginationProps: {
    //   radius: "xl",
    //   size: "xs",
    // },
    mantineSearchTextInputProps: {
      placeholder: "Search Filters",
    },
  });

  return (
    <Create
      title=""
      //   goBack={<BackButton />}
      //   wrapperProps={{
      //     style: {
      //       backgroundColor: "cornflowerblue",
      //       padding: "16px",
      //     },
      //   }}
      //   headerProps={{
      //     subTitle: "This is a subtitle",
      //     style: {
      //       backgroundColor: "cornflowerblue",
      //       padding: "16px",
      //     },
      //   }}
      //   breadcrumb={
      //     <div
      //       style={{
      //         padding: "3px 6px",
      //         border: "2px dashed cornflowerblue",
      //       }}
      //     >
      //       <Breadcrumb />
      //     </div>
      //   }
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      // saveButtonProps={{
      //   disabled: saveButtonProps?.disabled,
      //   onClick: handleSubmit,
      // }}
      saveButtonProps={saveButtonProps}
    >
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Name & Description</Title>
        </div>
        <TextInput
          label="Name"
          placeholder="Name"
          required
          {...getInputProps("name")}
        ></TextInput>
        <Textarea
          label="Description"
          placeholder="Description"
          // required
          {...getInputProps("description")}
        ></Textarea>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4 flex flex-col space-y-4 justify-start">
        <div className="mb-2">
          <Title order={5}>Data Models</Title>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 justify-start items-start">
          <MultiSelect
            className="md:col-span-1"
            label="Data Models"
            maxSelectedValues={1}
            data={data_models}
            required={true}
            // disabled={true}
            {...getInputProps("data_models")}
            onChange={handleDataModelChange}
          />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Column Configuration</Title>
        </div>
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={data_model_columns_table} />
        </MantineProvider>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Filters Configuration</Title>
        </div>
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={data_model_filters_table} />
        </MantineProvider>
      </div>

      {/* <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
          <Title order={5} className="mb-4">
            Analysis Configuration
          </Title>
          <div className="flex flex-wrap gap-4 mb-4"> Analysis configuration</div>
        </div> */}
    </Create>
  );
};
export default PageCreate;
