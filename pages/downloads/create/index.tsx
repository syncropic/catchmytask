import {
  HttpError,
  IResourceComponentsProps,
  useCustomMutation,
  useGetIdentity,
  useGo,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { Create, SaveButton, useForm, useSelect } from "@refinedev/mantine";
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
import { IconSend } from "@tabler/icons";
import { IconDownload } from "@tabler/icons-react";
import { addSeparator } from "src/utils";
import DownloadList from "./DownloadList"; // Adjust the import path based on your file structure
import { IDownload, DownloadListProps } from "../interfaces";

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

type IIdentity = {
  [key: string]: any;
};

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  // other
  const go = useGo();
  const { mutate, isLoading: mutationIsLoading, isError } = useCustomMutation();
  const invalidate = useInvalidate();

  // store values
  const setActionType = useAppStore((state) => state.setActionType);
  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem);
  const setActiveItem_2 = useAppStore((state) => state.setActiveItem_2);
  const activeItem_2 = useAppStore((state) => state.activeItem_2);

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    refineCore: { formLoading },
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

  // downloads
  const {
    data: downloadsData,
    isLoading: isLoadingDownloadsData,
    isError: isErrorDownloadsData,
  } = useList<IDownload, HttpError>({
    resource: "downloads",
  });

  let downloads_items = downloadsData?.data;

  // const downloads = downloadsData?.data
  //   ? downloadsData?.data.map((item) => ({
  //       // ...item,
  //       value: item.work_email,
  //       label: item.work_email,
  //     }))
  //   : [];

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

  // mail_lists
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

  const handleMailListChange = (value: string[]) => {
    // find item in report_options where value = value
    // console.log("value", value);
    const item = mail_lists.find((item) => item.value === value[0]);
    setActiveItem_2(item);
    // setActionType("create");
    // console.log("item", item);
    setFieldValue("mail_list", value);
  };

  // identity
  const { data: identity } = useGetIdentity<IIdentity>();

  // views

  const {
    data: viewsData,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<IView, HttpError>({
    resource: "views",
  });

  const data_items = viewsData?.data ?? [];

  const views_columns = useMemo<MRT_ColumnDef<IView>[]>(
    () => [
      {
        accessorKey: "name",
        header: "views",
        // minSize: 100, //min size enforced during resizing
        // maxSize: 50, //max size enforced during resizing
        // size: 50, //medium column
        Cell: ({ row }) => (
          <Group>
            <HoverCard width={280} shadow="md" withinPortal={true}>
              <HoverCard.Target>
                <Anchor component={Text}>
                  <Text
                    size="sm"
                    // onClick={() => {
                    //   setActionType("set_view");
                    //   setActiveViews(row.original);
                    //   go({
                    //     to: {
                    //       resource: row.original.resource,
                    //       action: "list",
                    //     },
                    //     query: {
                    //       view: row.original.id,
                    //     },
                    //     type: "push",
                    //   });
                    // }}
                  >
                    {row.original.name}
                  </Text>
                </Anchor>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">{row.original.name}</Text>
                <Anchor>
                  <Text
                    size="sm"
                    onClick={() => {
                      // setActionType("set_view");
                      // setActiveViews(row.original);
                      go({
                        to: {
                          resource: "views", // resource name or identifier
                          action: "show",
                          id: row.original.id,
                        },
                        query: {
                          view: row.original.id,
                          // filters: [
                          //   {
                          //     field: "title",
                          //     operator: "contains",
                          //     value: "Refine",
                          //   },
                          // ],
                        },
                        type: "push",
                      });
                    }}
                  >
                    See view details
                  </Text>
                </Anchor>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
        ),
      },
      // { accessorKey: "resource", header: "resource" },
    ],
    []
  );

  // useMantineReactTable hook
  const views_table = useMantineReactTable({
    columns: views_columns,
    data: data_items,
    enableColumnResizing: true,
    enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    // enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    // enablePinning: true,
    state: { isLoading: mutationIsLoading },
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
    // Assuming `row` has a type that includes `original` with a structure similar to `IDownload`
    renderDetailPanel: ({ row }) => {
      const filterView = addSeparator(row.original.id, "views");
      return (
        <div>
          <DownloadList
            downloads_items={downloads_items ?? []}
            filterView={filterView}
          />
        </div>
      );
    },
    renderTopToolbar: ({ table }) => {
      // const handleDelete = () => {
      //   table.getSelectedRowModel().flatRows.map((row) => {
      //     console.log("deleting " + row.getValue("pnr"));
      //   });
      // };

      // const handleGenerateScheduleChangeEmail = () => {
      //   table.getSelectedRowModel().flatRows.map((row) => {
      //     console.log(
      //       "generating schedule change email " + row.getValue("pnr")
      //     );
      //   });
      // };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              leftIcon={<IconDownload size={16} />}
              onClick={() => {
                handleSubmit(table.getSelectedRowModel().flatRows);
                // setActionType("open_views");
                // open_2();
              }}
              // disabled
              // variant="outline"
            >
              Generate Download Link
            </Button>
            {/* <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Export
              </Button>
            </Tooltip> */}
          </Flex>
        </Flex>
      );
    },
  });

  // HANDLE SUBMIT
  const handleSubmit = (flatRows: any) => {
    let selected_views = flatRows.map((row: any) => {
      return {
        ...row.original,
        id: addSeparator(row.original.id, "views"),
        author: identity?.email,
      };
    });
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/downloads`,
      method: "post",
      values: selected_views,
      successNotification: (data, values) => {
        // invalidate list
        invalidate({
          resource: "downloads",
          invalidates: ["list"],
        });

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

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        // onClick: handleSubmit,
      }}
      title="Download"
      footerButtons={({ saveButtonProps }) => (
        <>
          {/* <SaveButton
            {...saveButtonProps}
            fullWidth
            leftIcon={<IconDownload size={16} />}
            style={{ marginRight: 8 }}
          >
            Download
          </SaveButton> */}
        </>
      )}
    >
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
      /> */}
      {/* <MultiSelect
        mt="sm"
        label="email_template"
        placeholder="Select email template"
        data={emailTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("email_type")}
        disabled
        required
      /> */}
      {/* <Textarea
        mt="sm"
        label="custom_message"
        autosize={true}
        minRows={3}
        placeholder="Custom message to include in the email"
        {...getInputProps("custom_message")}
      /> */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md my-4">
        <div className="mb-2">
          <Title order={5}>Attachments</Title>
        </div>
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={views_table} />
        </MantineProvider>
      </div>
    </Create>
  );
};
export default PageCreate;
