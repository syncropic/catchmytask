import {
  HttpError,
  IResourceComponentsProps,
  useCustomMutation,
  useGetIdentity,
  useGo,
  useInvalidate,
  useList,
  useNavigation,
} from "@refinedev/core";
import {
  Create,
  CreateButton,
  SaveButton,
  useForm,
  useSelect,
} from "@refinedev/mantine";
import {
  TextInput,
  Select,
  MultiSelect,
  Textarea,
  MantineProvider,
  Group,
  HoverCard,
  Anchor,
  Text,
  Title,
  Flex,
  Button,
  Tooltip,
  Drawer,
  Menu,
  rem,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { useAppStore } from "src/store";
import ViewList from "../../views";
import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { IView } from "../../views/interfaces";
import { useMemo } from "react";
import { IconSend, IconTrash } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { IActionStep, IIdentity } from "../interfaces";
import { useCreate } from "@refinedev/core";
import { addSeparator, removeSeparator } from "src/utils";

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
  const { mutate: mutateCreate } = useCreate();
  // custom mutation
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  // other
  const go = useGo();
  const { show } = useNavigation();
  const invalidate = useInvalidate();

  const [opened, { open, close }] = useDisclosure(false);
  const actionType = useAppStore((state) => state.actionType);
  // store values
  const setActionType = useAppStore((state) => state.setActionType);
  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem);
  const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
  const activeItem_2 = useAppStore((state) => state.activeItem_2);

  // ACTION OPTIONS
  const {
    data: actionOptionsData,
    isLoading: isLoadingActionOptionsData,
    isError: isErrorActionOptionsData,
  } = useList({
    resource: "action_options",
  });

  const action_options = actionOptionsData?.data
    ? actionOptionsData?.data.map((option) => ({
        ...option,
        value: option.display_name,
        label: option.display_name,
        metadata: option.metadata,
      }))
    : [];

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading },
  } = useForm({
    initialValues: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      name: "",
      description: "",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // action_steps: [] as any[],
      action_options: ["General Query"] as string[],
      // start_date: "",
      // end_date: "",
      // date_type: [] as string[],
      // custom_message: "",
      // mail_list: [] as string[],
      // to_email_list: ["dp.wanjala@gmail.com"] as string[],
      // cc_email_list: [] as string[],
      // tags: "",
      // from: "david.wanjala@snowstormtech.com",
      // email_type: ["default"] as string[],
    },
  });

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

  // func_definition
  const {
    data: func_definitionData,
    isLoading: isLoadingFuncDefinitionData,
    isError: isErrorFuncDefinitionData,
  } = useList({
    resource: "func_definition",
  });

  const func_definition = func_definitionData?.data
    ? func_definitionData?.data.map((item) => ({
        // ...item,
        value: item.name,
        label: item.name,
      }))
    : [];

  // mail_lists
  // const {
  //   data: mailListsData,
  //   isLoading: isLoadingMailListsData,
  //   isError: isErrorMailListsData,
  // } = useList({
  //   resource: "mail_lists",
  // });

  // const mail_lists = mailListsData?.data
  //   ? mailListsData?.data.map((item) => ({
  //       ...item,
  //       value: item.name,
  //       label: item.name,
  //     }))
  //   : [];

  // const handleMailListChange = (value: string[]) => {
  //   // find item in report_options where value = value
  //   // console.log("value", value);
  //   const item = mail_lists.find((item) => item.value === value[0]);
  //   setActiveItem_2(item);
  //   // setActionType("create");
  //   // console.log("item", item);
  //   setFieldValue("mail_list", value);
  // };

  // // identity
  // const { data: identity } = useGetIdentity<IIdentity>();

  // views
  // const {
  //   data,
  //   isLoading: isLoadingReports,
  //   isError: isErrorReports,
  // } = useList<IView, HttpError>({
  //   resource: "views",
  // });

  // const data_items = data?.data ?? [];

  const status_options = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "failed",
      label: "Failed",
    },
    {
      value: "in_progress",
      label: "In Progress",
    },
    {
      value: "canceled",
      label: "Canceled",
    },
  ];

  const action_steps_columns = useMemo<MRT_ColumnDef<IActionStep>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "execution_order", header: "Execution Order" },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "callback",
        header: "Callback",
      },
      {
        accessorKey: "async",
        header: "Async",
      },
      { accessorKey: "context", header: "Context" },
      {
        accessorKey: "dependencies",
        header: "Dependencies",
      },
      { accessorKey: "kind", header: "Kind" },
      { accessorKey: "record", header: "Record" },
      { accessorKey: "input", header: "Input" },
      {
        accessorKey: "individual_fields",
        header: "Individual Fields",
      },
      {
        accessorKey: "combined_fields",
        header: "Combined Fields",
      },
      { accessorKey: "out", header: "Out" },
      { accessorKey: "in", header: "In" },
    ],
    [func_definition] // Ensure useMemo depends on 'func_definition'
  );

  // useMantineReactTable hook
  const action_steps_table = useMantineReactTable({
    columns: action_steps_columns,
    // data: values.action_steps,
    data: [],
    enableColumnResizing: true,
    enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowActions: true,
    enableRowOrdering: true,
    enableSorting: false, //usually you do not want to sort when re-ordering
    // enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    // enablePinning: true,
    enableEditing: true,
    // editDisplayMode: "cell",
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
    renderRowActionMenuItems: ({ row }) => (
      <>
        {/* <Menu.Item
          onClick={() => {
            setActionType("add_to");
            open();
          }}
          icon={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
        >
          Add To
        </Menu.Item> */}
        {/* <Menu.Item
          onClick={() => {
            setActionType("chat");
            open();
          }}
          icon={
            <IconMessageCircle style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Chat
        </Menu.Item> */}
        <Menu.Item
          // onClick={() => {
          //   mutateDelete({
          //     resource: "execute",
          //     id: row.original.id,
          //   });
          // }}
          icon={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
        >
          Delete
        </Menu.Item>
      </>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("name"));
        });
      };

      const handleActivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("activating " + row.getValue("name"));
        });
      };

      const handleContact = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("contact " + row.getValue("name"));
        });
      };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            {/* import MRT sub-components */}
            {/* <MRT_GlobalFilterTextInput table={table} /> */}
            {/* <MRT_ToggleFiltersButton table={table} /> */}
            <Button
              onClick={() => {
                // setActionType("add_action_step");
                // open();
                // handleAddActionStep();
              }}
            >
              Add Action Step
            </Button>
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            {/* <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              // onClick={handleComingSoon}
              variant="filled"
            >
              Delete
            </Button> */}
            {/* <Tooltip label="Allowed file types: .xlsx, .json, .xml">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Import
              </Button>
            </Tooltip> */}
            {/* <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                // onClick={handleComingSoon}
                variant="filled"
              >
                Import
              </Button>
            </Tooltip> */}
          </Flex>
        </Flex>
      );
    },
  });

  // const handleAddActionStep = () => {
  //   // setActionType("add_action_step");
  //   // open();
  //   length = values.action_steps.length;
  //   let execution_order = length + 1;
  //   let empty_action_step = {
  //     name: "",
  //     execution_order: execution_order,
  //     status: ["pending"],
  //     async: false,
  //     callback: false,
  //     kind: "default",
  //     dependencies: [],
  //     context: "",
  //     func_definition: [],
  //   };
  //   // append empty action step to values action_steps
  //   setFieldValue("action_steps", [...values.action_steps, empty_action_step]);
  //   // console.log("add action step");
  //   console.log("values", values);
  // };

  // HANDLE SUBMIT
  const handleSubmit = (e: any) => {
    const action_option = action_options.find(
      (item) => item.value === values?.action_options[0]
    );
    // console.log("running inline");
    // console.log("action_option", action_option);
    // console.log("record", record);
    // console.log("running inline");
    // console.log("values", values);
    // let request_data = action_option ?? {};
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: {
        ...action_option,
        // task: {
        //   author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
        //   description: "general_query",
        //   name: "general_query",
        //   status: "active",
        // },
        // source: {
        //   location: "database",
        //   id: "general_query_plan",
        // },
        // destination: {
        //   location: "database",
        //   id: "",
        // },
        // options: {
        //   sync_from_source_to_destination: true,
        //   delete_source_from_destination: false,
        //   plan_with_llm: false,
        // },
        // values: {
        //   action_options: ["action_options:eqtleyp8zpzi3l5ohgip"],
        // },
      },
      successNotification: (data, values) => {
        // invalidateCallback();
        show("task", removeSeparator(data?.data?.id));
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
    // mutateCreate({
    //   resource: "task",
    //   values: values,
    //   successNotification: (data, values) => {
    //     // invalidate({
    //     //   resource: "task",
    //     //   invalidates: ["list"],
    //     // });
    //     // list("reports"); // It navigates to list page
    //     // console.log("data", data);
    //     // console.log("values", values);
    //     show("task", removeSeparator(data?.data?.id));

    //     return {
    //       message: `successfully created.`,
    //       description: "Success with no errors",
    //       type: "success",
    //     };
    //   },
    //   errorNotification: (data, values) => {
    //     return {
    //       message: `Something went wrong`,
    //       description: "Error",
    //       type: "error",
    //     };
    //   },
    // });
    // console.log("values", values);
    // invalidate({
    //   resource: "reports",
    //   invalidates: ["list"],
    // });
    // // list("reports"); // It navigates to list page
    // // console.log("data", data);
    // // console.log("values", values);
    // show("reports", removeSeparator(data?.data?.id));
  };

  return (
    <Create
      isLoading={formLoading || mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
      }}
      title="Create Task"
      footerButtons={({ saveButtonProps }) => (
        <>
          <SaveButton
            {...saveButtonProps}
            fullWidth
            // leftIcon={<IconSend size={16} />}
            style={{ marginRight: 8 }}
          >
            Save
          </SaveButton>
        </>
      )}
    >
      <Drawer
        opened={opened}
        onClose={close}
        title={actionType}
        position="right"
      >
        {actionType === "add_action_step" && (
          <AddActionStep func_definition={func_definition} />
        )}
      </Drawer>
      <TextInput
        mt="sm"
        label="name"
        placeholder="name"
        required={true}
        // value="david.wanjala@snowstormtech.com"
        {...getInputProps("name")}
        // disabled
      />
      <Textarea
        mt="sm"
        label="description"
        placeholder="description"
        // value="david.wanjala@snowstormtech.com"
        {...getInputProps("description")}
        // disabled
      />
      <MultiSelect
        className="flex-1"
        label="action option"
        placeholder="select optional seed action"
        searchable={true}
        required={true}
        // data={action_options.map((action) => action.display_name)}
        data={action_options}
        // value={getInputProps("action").value}
        // onChange={handleActionChange}
        withinPortal={true}
        // style={{ option: { whiteSpace: "normal" } }} // Adjust this line based on your component's API
      />
      {/* <div className="mt-4">
        <Button fullWidth size="xs">
          Next
        </Button>
      </div> */}
      {/* <MultiSelect
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
      /> */}
      {/* <TextInput
        mt="sm"
        label="from"
        placeholder="from"
        // value="david.wanjala@snowstormtech.com"
        {...getInputProps("from")}
        disabled
      /> */}
      {/* <MultiSelect
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
      /> */}
      {/* <MultiSelect
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
      /> */}
      {/* <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Action Steps</Title>
        </div>
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={action_steps_table} />
        </MantineProvider>
      </div> */}
    </Create>
  );
};
export default PageCreate;

const AddActionStep = ({ func_definition }: { func_definition: any[] }) => {
  // console.log("func_definition", func_definition);
  // let func_definition = func_definition;
  return (
    <Create
      title="Add Action Step"
      footerButtons={({ saveButtonProps }) => (
        <>
          <SaveButton {...saveButtonProps} fullWidth>
            Save
          </SaveButton>
        </>
      )}
    >
      <Select
        label="Your favorite library"
        placeholder="Pick value"
        data={func_definition} // Replace with your options source
        searchable
      />
    </Create>
  );
};
