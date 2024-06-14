"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  componentMapping,
  createColumnDef,
  extractIdentifier,
  getComponentByResourceType,
  replacePlaceholdersInObject,
  useDataColumns,
} from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
// import ViewActionHistory from "@components/ViewActionHistory";
import {
  CompleteActionComponentProps,
  ComponentKey,
  DataItem,
  FieldConfiguration,
  IIdentity,
  IView,
  ResultsComponentProps,
  RowData,
} from "@components/interfaces";
import {
  Accordion,
  ActionIcon,
  Modal,
  Popover,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import {
  IconColumns,
  IconEye,
  IconMathFunction,
  IconSearch,
} from "@tabler/icons-react";
import _, { set } from "lodash";
import CreateAutomation from "pages/automations/create";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "src/store";
import { v4 as uuidv4 } from "uuid";
import QueryBar from "@components/QueryBar";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
  CalendarIcon,
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import {
  ColumnFiltersState,
  VisibilityState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { Button } from "@components/Button";
import { Checkbox } from "@components/Checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/DropdownMenu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@components/ContextMenu";

import { Input } from "@components/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/Table";
import Reveal from "@components/Reveal";
import { Combobox } from "@components/Combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@components/Command";

export function Results<T extends Record<string, any>>({
  data_items,
  data_columns,
  isLoadingDataItems,
}: ResultsComponentProps<T>) {
  let table_id = "table-id";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  // const {
  //   activeViewItem,
  //   // activeRecord,
  //   // selectedItems,
  //   activeField,
  //   setActiveField,
  //   focusedFields,
  //   setFocusedFields,
  //   // activeApplication,
  //   activeSession,
  // } = useAppStore();
  // // console.log("actionFormFieldValues", actionFormFieldValues);
  // // let activeRecordId = activeRecords[0]?.id;
  // const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
  //   useDisclosure(false);
  // const [openedChat, { open: openChat, close: closeChat }] =
  //   useDisclosure(false);
  // // const { data: identity } = useGetIdentity<IIdentity>();
  // const {
  //   mutate,
  //   isLoading: mutationIsLoading,
  //   isError: mutationIsError,
  //   error: mutationError,
  // } = useCustomMutation();
  // const queryClient = useQueryClient();
  // const actionFormFieldValues = {
  //   query: activeSession?.structured_query?.content,
  // };
  // const {
  //   getInputProps,
  //   saveButtonProps,
  //   setFieldValue,
  //   values,
  //   refineCore: { formLoading, onFinish },
  //   onSubmit,
  //   reset,
  //   isTouched,
  // } = useForm({
  //   initialValues: {
  //     ...actionFormFieldValues,
  //   },
  //   refineCoreProps: {},
  // });
  // const [opened, { open, close }] = useDisclosure(false);
  // // type the data items with the DataItem interface
  // const [data, setData] = useState<DataItem[]>(data_items);
  // const columns = useMemo<ColumnDef<T>[]>(
  //   () => [
  //     {
  //       accessorKey: "reporting_date",
  //       cell: (info) => info.getValue(),
  //       //this column will sort in ascending order by default since it is a string column
  //     },
  //   ],
  //   []
  // );

  // useEffect(() => {
  //   reset();

  //   // Step 1: Reset form with only 'author' and 'author_email'
  //   // const resetValues = {
  //   //   author: identity?.email,
  //   //   author_email: identity?.email,
  //   // };

  //   const resetValues = {
  //     task_id: uuidv4(),
  //   };

  //   // Reinitialize form with base values plus dynamic actionFormFieldValues
  //   Object.entries({
  //     ...resetValues,
  //     ...actionFormFieldValues,
  //   }).forEach(([key, value]) => {
  //     setFieldValue(key, value);
  //   });
  //   // console.log("actionFormFieldValues", actionFormFieldValues);
  // }, [actionFormFieldValues, identity?.email]);

  // useEffect when selectedItems changes set the field item called selectedItems
  // useEffect(() => {
  //   if (selectedItems) {
  //     setFieldValue("selected_items", selectedItems[activeViewItem?.id]);
  //   }
  // }, [selectedItems]);

  // const generateRequestData = (values: any) => {

  //   const queryData = {
  //     global_variables: {},
  //     include_execution_orders: [1],
  //     action_steps: [
  //       {
  //         id: "1",
  //         execution_order: 1,
  //         tool: "query",
  //         tool_arguments: {
  //           query: values.query,
  //         },
  //       },
  //     ],
  //   };
  //   const activeActionRequestData = _.merge(
  //     {},
  //     queryData || {}
  //     // activeAction || {},
  //     // activeActionFormatted || {}
  //   );
  //   return activeActionRequestData;
  // };

  // const handleSubmit = (e: any) => {
  //   // let generatedRequestData = generateRequestData(values);
  //   // console.log("generatedRequestData", generatedRequestData);
  //   mutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/catch`,
  //     method: "post",
  //     values: generateRequestData(values),
  //     successNotification: (data, values) => {
  //       // console.log("successNotification", data);
  //       // invalidate query

  //       // queryClient.invalidateQueries(["list_action_history_1"]);
  //       // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       // console.log("successNotification", data?.response.status);
  //       // console.log("errorNotification values", values);
  //       return {
  //         message: `${data?.response.status} : ${
  //           data?.response.statusText
  //         } : ${JSON.stringify(data?.response.data)}`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

  // const viewComponent = (activeViewItem: IView, activeRecord: any) => {
  //   // console.log("activeViewItem", activeViewItem);
  //   // return "";
  //   if (!activeViewItem) {
  //     return null;
  //   }
  //   if (!activeViewItem.resource_type) {
  //     return null;
  //   }
  //   const Component = componentMapping[activeViewItem.resource_type];
  //   return <Component item={activeRecord} />;
  // };
  // if (!activeAction) {
  //   return <div>No active action selected</div>;
  // }

  // let activeFieldConfigurationsObject = activeViewItem ? activeSession
  //   ? activeAction
  //   : activeRecord;

  // let activeFieldConfigurationsObject =
  //   activeActionView ?? activeSession ?? activeAction ?? activeRecord;

  // let activeFieldConfigurationsObject = activeAction;

  // const actionFieldConfigurations =
  //   activeActionView?.field_configurations ||
  //   // activeViewItem?.fields_configuration ||
  //   // activeViewItem?.view?.[0]?.fields_configuration ||
  //   activeAction?.field_configurations ||
  //   [];
  // console.log("actionFieldConfigurations", actionFieldConfigurations);

  // FormFieldValues = extractFields(
  //   activeRecord || {},
  //   activeViewItem?.fields_configuration ||
  //     activeViewItem?.view?.[0]?.fields_configuration ||
  //     activeAction?.field_configurations ||
  //     []
  // );

  // console.log(
  //   "activeFieldConfigurationsObject",
  //   activeFieldConfigurationsObject
  // );

  // sometimes we want to use the fields configuration on the activeRecord i.e activeSession instead of the activeRecord
  // handleFileSelection
  const handleFileSelection = (value: any) => {
    console.log("value", value);

    // const file = e.target.files[0];
    // console.log("file", file);
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   // console.log("event.target.result", event.target.result);
    //   setFieldValue("file", event.target.result);
    // };
    // reader.readAsDataURL(file);
  };
  const handleFileHandlerSelection = (value: any) => {
    console.log("value", value);
    // const file = e.target.files[0];
    // console.log("file", file);
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   // console.log("event.target.result", event.target.result);
    //   setFieldValue("file", event.target.result);
    // };
    // reader.readAsDataURL(file);
  };

  interface FunctionMappings {
    handleFileSelection: (value: any) => void;
    handleFileHandlerSelection: (value: any) => void;
    handleFocus: (value: any) => void;
  }

  // // using a type guard to check if the key is in the functionMappings object
  // function isFunctionMappingKey(key: any): key is keyof FunctionMappings {
  //   return key in functionMappings;
  // }

  // get data triggered by eventHandlers + utilize reactquery for caching instead of adding another value to zustand, keep that clean

  // const { data, isLoading, error } = useCustom({
  //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
  //   method: "post",
  //   config: {
  //     payload: {
  //       // Here, ensure that you're constructing your payload correctly without circular references
  //       // For example, use the focusedFieldName directly if it's part of the payload
  //       function_arguments: activeField?.data_prop_query,
  //     },
  //   },
  //   queryOptions: {
  //     queryKey: [`field_data_for_${activeField?.field_name}`], // simply change the query key to trigger call for that field
  //     // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
  //     // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
  //     // enabled:
  //     //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
  //     // enabled:
  //     // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
  //     enabled:
  //       activeField?.field_name && !focusedFields?.[activeField?.field_name]
  //         ? true
  //         : false, // as long as there is a activefield with field name, run the query
  //   },
  //   successNotification: (data, values) => {
  //     // console.log("successNotification", data);
  //     // data is the response from the query
  //     setFocusedFields({
  //       ...focusedFields,
  //       [activeField?.field_name]: {
  //         ...activeField,
  //         data: data?.data,
  //       },
  //     }); // Reset focused field after successful query
  //     return {
  //       message: `successfully retrieved ${activeField?.field_name}s.`,
  //       description: "Success with no errors",
  //       type: "success",
  //     };
  //   },
  // });

  // // This event handler now expects a field name (or some simple identifier) as an argument
  // const handleFocus = (event: any, field: any) => {
  //   // const fieldIsTouched = isTouched(field.field_name);
  //   // console.log("fieldIsTouched", fieldIsTouched);
  //   // console.log("field", field);
  //   // set the activeField
  //   setActiveField(field);

  //   // console.log("fieldIsTouched", fieldIsTouched);
  //   // if (fieldIsTouched) {
  //   //   // If the field is already touched, don't refetch the data
  //   //   return;
  //   // }
  //   // // console.log("fieldIsTouched", fieldIsTouched);
  //   // setFocusedFields({
  //   //   ...focusedFields,
  //   //   [field.field_name]: field,
  //   // }); // Set the name of the focused field
  // };

  // const functionMappings = {
  //   handleFileSelection: handleFileSelection,
  //   handleFileHandlerSelection: handleFileHandlerSelection,
  //   handleFocus: handleFocus,
  //   // add more mappings as needed
  // };

  // const columns = useMemo(() => [
  //   // ...
  // ], []);

  // const data_columns_enhanced = useDataColumns(
  //   fieldConfigurations || [],
  //   "table-id"
  // );

  // const table = useReactTable({
  //   data: data_items,
  //   columns: data_columns_enhanced,
  //   getCoreRowModel: getCoreRowModel(),
  // });
  const table = useReactTable({
    data: data_items,
    columns: data_columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  console.log("data_columns", data_columns);
  console.log("results");
  // console.log("data_columns_enhanced", data_columns_enhanced);
  // console.log("table", table);
  // console.log("columns", columns);
  // console.log("results");

  return (
    <>
      <div className="w-full">
        <div className="flex py-4 gap-8 justify-between">
          <Input
            placeholder="Search results ..."
            // value={
            //   (table
            //     .getColumn(`${table_id}-sst_booking_number`)
            //     ?.getFilterValue() as string) ?? ""
            // }
            // onChange={(event) =>
            //   table
            //     .getColumn(`${table_id}-sst_booking_number`)
            //     ?.setFilterValue(event.target.value)
            // }
            className="max-w-sm"
          />

          <div className="flex gap-3">
            <Reveal
              target={
                <ActionIcon aria-label="Settings">
                  <IconEye />
                </ActionIcon>
              }
              trigger="click"
            >
              {/* include aggregate views such as dj decks, graphs, results lists
              etc. */}
              {aggregate_views.map((item) => {
                return (
                  <div
                    className="flex items-center space-x-2 p-1"
                    key={item.value}
                  >
                    <Checkbox
                      id={item.value}
                      checked={item.visible}
                      // checked={column.getIsVisible()}
                      // onCheckedChange={(value) =>
                      //   column.toggleVisibility(!!value)
                      // }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.label}
                    </label>
                  </div>
                );
              })}
            </Reveal>
            {/* <SelectAction></SelectAction> */}

            <Reveal
              target={
                <ActionIcon aria-label="Settings">
                  <IconColumns />
                </ActionIcon>
              }
              trigger="click"
            >
              {/* <div>columns selection and ordering</div> */}
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <div
                      className="flex items-center space-x-2 p-1"
                      key={column.id}
                    >
                      <Checkbox
                        id={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {column.id}
                      </label>
                    </div>
                  );
                })}
            </Reveal>
            <div>
              <Combobox data_items={views} resource="view"></Combobox>
            </div>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {/* <ContextMenu>
                      <ContextMenuTrigger>Right click</ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem>Profile</ContextMenuItem>
                        <ContextMenuItem>Billing</ContextMenuItem>
                        <ContextMenuItem>Team</ContextMenuItem>
                        <ContextMenuItem>Subscription</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu> */}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        {/* <div key={cell.id}>
                          {JSON.stringify(cell.column.columnDef.id)}
                        </div> */}
                        {/* <div key={cell.id}>
                          {JSON.stringify(cell.row.original)}
                        </div> */}
                      </TableCell>
                    ))}
                    {/* <div>hello</div> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={data_columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Results;
{
  /* <div>{JSON.stringify(data_items)}</div> */
}

{
  /* <EmbedComponent></EmbedComponent> */
}
{
  /* <WebBrowserView
        url={`${
          process.env.NEXT_PUBLIC_CMT_API_BASEURL
        }/web-browser?url=${encodeURIComponent(url)}`}
      ></WebBrowserView> */
}
{
  /* <iframe
        src={url}
        style={{ flex: 1, border: "none" }}
        title="Web Browser"
        height={"100%"}
        width={"100%"}
      /> */
}

{
  /* <SpreadsheetView
        data_items={data?.data[0]?.main_query["select"]["data"]}
        isLoadingDataItems={isLoading || isFetching}
      ></SpreadsheetView> */
}

const views = [
  {
    value: "table",
    label: "Table",
  },
  {
    value: "spreadsheet",
    label: "Spreadsheet",
  },
  {
    value: "list",
    label: "List",
  },
  {
    value: "grid",
    label: "Grid",
  },
];

const aggregate_views = [
  {
    value: "results",
    label: "Results",
    visible: true,
  },
  // {
  //   value: "charts",
  //   label: "Charts",
  //   visible: false,
  // },
  // {
  //   value: "djdecks",
  //   label: "DJ Decks",
  // },
  // {
  //   value: "hero",
  //   label: "Hero",
  //   visible: false,
  // },
  {
    value: "descriptive_stats",
    label: "Descriptive Stats",
    visible: false,
  },
];

function SelectAction() {
  // const [opened, setOpened] = useState(false);
  const { isActionsSelectionOpen, setIsActionsSelectionOpen } = useAppStore();
  // const handleChange = (e: any) => {
  //   console.log("e", e);
  // };
  const ref = useClickOutside(() => setIsActionsSelectionOpen(false));
  return (
    <div ref={ref}>
      <Popover
        opened={isActionsSelectionOpen}
        // onChange={handleChange}
        // closeOnClickOutside={true}
      >
        {/* <Popover.Target>
        <Button onClick={() => setOpened((o) => !o)}>Toggle popover</Button>
      </Popover.Target> */}

        <Popover.Dropdown>
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search actions..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <FaceIcon className="mr-2 h-4 w-4" />
                  <span>Search Emoji</span>
                </CommandItem>
                <CommandItem>
                  <RocketIcon className="mr-2 h-4 w-4" />
                  <span>Launch</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <PersonIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                  <span>Mail</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <GearIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}
