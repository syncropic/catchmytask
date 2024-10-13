import Decimal from "@components/Decimal";
import Reveal from "@components/Reveal";
import RowActions from "@components/RowActions";
import SessionLink from "@components/SessionLink";
import ViewApplication from "@components/ViewApplication";
import ViewBooking from "@components/ViewBooking";
import ViewFile from "@components/ViewFile";
import ViewPayment from "@components/ViewPayment";
import ViewTask from "@components/ViewTask";
import ViewTestRun from "@components/ViewTestRun";
import ViewTrip from "@components/ViewTrip";
import { ComponentKey } from "@components/interfaces";
// import config from "src/config";
import {
  Column,
  FieldConfiguration,
  IAction,
  IApplication,
  IIdentity,
  ISubscription,
  RowData,
} from "@components/interfaces";
import {
  Button,
  FileInput,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  Text,
  ActionIcon,
  Input,
  Switch,
  Indicator,
  Popover,
  rem,
  Tooltip,
} from "@mantine/core";
import { DateInput, DateTimePicker } from "@mantine/dates";
import {
  HttpError,
  useCustom,
  useGetIdentity,
  useGo,
  useList,
  useOne,
} from "@refinedev/core";
import { MRT_ColumnDef } from "mantine-react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import DateTime from "src/components/DateTime";
import { useAppStore } from "src/store";
// import { dropTableIfExists, saveToLocalDB } from "src/local_db";
import {
  IconCircleMinus,
  IconCircleX,
  IconFileDownload,
  IconMenu2,
  IconPin,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettingsAutomation,
  IconShare,
  IconTool,
  IconZoomCode,
  IconCopy,
  IconTrash,
  IconForms,
  IconPlaylistAdd,
  IconTallymark3,
  IconPencil,
  IconSitemap,
  IconSearch,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutDistributeVertical,
  IconChartBar,
  IconTimelineEventPlus,
  IconSquare,
} from "@tabler/icons-react";
import { localDb } from "src/localDb";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime, getCellStyleInline } from "src/utils";
import ViewJson from "@components/ViewJson";
import ShortcutLink from "@components/ShortcutLink";
import MonacoEditor from "@components/MonacoEditor";
import { MonacoEditorFormInput } from "@components/MonacoEditor";
// import LocalAudioPlayer from "@components/LocalAudioPlayer";
import FileHandler from "@components/FileHandler";
import ExcalidrawEditor from "@components/ExcalidrawEditor";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/DropdownMenu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  IconAt,
  IconBooks,
  IconBrandAirtable,
  IconBrandAzure,
  IconBrandGit,
  IconBrandGithub,
  IconBrandGoogleDrive,
  IconBrandOpenai,
  IconBrandSpotify,
  IconBrandStripe,
  IconBrandZoom,
  IconCircle,
  IconCode,
  IconCurrencyDollar,
  IconDatabase,
  IconDots,
  IconFunction,
  IconHighlight,
  IconMessageCircle,
  IconNotification,
  IconPlane,
  IconPlug,
  IconPresentation,
  IconRobot,
  IconServer,
  IconSql,
  IconTopologyStar3,
  IconTransform,
  IconUsersGroup,
} from "@tabler/icons-react";
import ActivateActionsSelection from "@components/ActivateActionsSelection";
import Hero from "@components/Hero";
import FaqSimple from "@components/Faq/FaqSimple";
import Benefits from "@components/Benefits/Benefits";
import { FeaturesGrid } from "@components/Features/FeaturesGrid";
import Procedure from "@components/Procedure/Procedure";
import List from "@components/List/List";
import { EmailBanner } from "@components/EmailBanner/EmailBanner";
import React from "react";
import { render } from "react-dom";
import { NaturalLanguageEditorFormInput } from "@components/NaturalLanguageEditor";
import AccordionList from "@components/List/AccordionList";
import { Checkbox } from "@components/Checkbox";
import SearchInput from "@components/SearchInput";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import { ListEditorFormInput } from "@components/ListEditor";
import { useDuckDB } from "pages/_app";
import { saveToLocalDB } from "src/local_db";
// import MediaPlayerController from "@components/MediaPlayerController";
// import MediaPlayerTimeline from "@components/MediaPlayerTimeline";

// declare module "@tanstack/react-table" {
//   //allows us to define custom properties for our columns
//   interface ColumnMeta<TData extends RowData, TValue> {
//     filterVariant?: "text" | "range" | "select";
//   }
// }

// Adjusted createColumnDef to fit your use case
export function createColumnDef<RowDataType extends RowData>(
  column: FieldConfiguration
): ColumnDef<RowDataType> {
  const isRowSelect = column.display_component === "RowSelect";
  const isRowActionsSelect = column.display_component === "RowActionsSelect";
  const isItemDetails = column.display_component === "ItemDetails";
  // const isDateTime = column.data_type === "datetime";
  // const isDecimal = column.data_type === "decimal";
  // const isExternalLink = column?.display_component === "ExternalLink";
  // const isPrimaryKey = column?.display_component === "PrimaryKey";
  // const isFilePath = column?.display_component === "FilePath";
  // const isReveal = column?.display_component === "Reveal";
  // const isSessionLink = column?.display_component === "SessionLink";
  // const isShortcutLink = column?.display_component === "ShortcutLink";
  // const isExecutionStatus = column?.display_component === "ExecutionStatus";
  // const isRowActions = column?.field_name === "row_actions";
  // const conditionalFormatting = column?.conditional_formatting ?? null;
  // const enableColumnFilterModes = column?.enable_column_filter_modes ?? false;
  // // const isEnableColumnFilterModes = column?.enable_column_filter_modes ?? false;

  // const isDisplayColumn = [
  //   "mrt-row-select",
  //   "mrt-row-expand",
  //   "mrt-row-actions",
  // ].includes(column?.field_name);
  // // default is when it is not a datetime or decimal
  // const isDefault =
  //   !isDateTime &&
  //   !isDecimal &&
  //   !isExternalLink &&
  //   !isPrimaryKey &&
  //   !isFilePath &&
  //   !isDisplayColumn &&
  //   !isReveal &&
  //   !isSessionLink &&
  //   !isExecutionStatus &&
  //   !isRowActions;
  const isOther = !isRowSelect && !isRowActionsSelect;
  return {
    id: column?.name,
    enableColumnFilter: true,
    ...(isOther && {
      accessor: column?.name,
      cell: ({ row }) => row.original[column?.name],
      header: column?.name,
    }),
    ...(isRowSelect && {
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    ...(isRowActionsSelect && {
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <ActivateActionsSelection
            record={row.original}
            resultsSection={{ name: row.original?.resultsSection }}
          ></ActivateActionsSelection>
        );
      },
    }),
    ...(isItemDetails && {
      // enableHiding: false,
      cell: ({ row }) => {
        return (
          <Reveal
            target={
              <ActionIcon aria-label="Settings">
                <IconDots size={16} />
              </ActionIcon>
            }
            trigger="click"
          >
            <MonacoEditor value={row.original}></MonacoEditor>
          </Reveal>
        );
      },
    }),
    // ...(conditionalFormatting && {
    //   Cell: ({ row }) => {
    //     const style = getCellStyleInline(
    //       row.original[column?.conditional_formatting?.field_name],
    //       column
    //     );
    //     return <div style={style}>{row.original[column.field_name] ?? ""}</div>;
    //   },
    // }),
    // ...(column?.filter_variant && {
    //   filterVariant: column.filter_variant,
    //   filterFn: column.filter_fn,
    // }),
    ...(column?.filter_variant && {
      filterFn: column.filter_fn,
    }),
    // ...(isDefault && {
    //   accessorKey: column?.field_name,
    // }),
    // ...(column?.aggregation_fn && {
    //   aggregationFn: column?.aggregation_fn,
    //   AggregatedCell: ({ cell }) => {
    //     if (isDateTime) {
    //       return (
    //         <DateTime
    //           {...column}
    //           value={cell.getValue()}
    //           display_format={column.display_format ?? "yyyy-MM-dd"}
    //           record={cell.row.original}
    //         />
    //       );
    //     } else {
    //       return <div>{JSON.stringify(cell.getValue())}</div>;
    //     }
    //   },
    // }),
    // ...(isDisplayColumn && {
    //   columnDefType: "display",
    // }),
    // ...(isRowActions && {
    //   columnDefType: "display", //turns off data column features like sorting, filtering, etc.
    //   enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
    //   Cell: ({ row }) => <RowActions record={row.original}></RowActions>,
    // }),
    // ...(isDateTime && {
    //   accessorFn: (row) => new Date(row[column.field_name] ?? ""),
    //   Cell: ({ row }) => (
    //     <DateTime
    //       {...column}
    //       value={row.original[column.field_name]}
    //       record={row.original}
    //       display_format={column.display_format ?? "yyyy-MM-dd"}
    //     />
    //   ),
    // }),
    // ...(isDecimal && {
    //   // Convert strings to numbers and replace null or undefined with 0
    //   accessorFn: (row) => {
    //     const value = row[column.field_name];
    //     return value ? Number(value) : 0;
    //   },
    //   Cell: ({ row }) => (
    //     <Decimal
    //       {...column}
    //       value={row.original[column.field_name]}
    //       display_format={column.display_format ?? ""}
    //       record={row.original}
    //     />
    //   ),
    // }),
    // ...(isExternalLink && {
    //   Cell: ({ row }) => (
    //     <ExternalLink
    //       {...column}
    //       value={row.original[column.field_name]}
    //       display_format={column.display_format ?? ""}
    //       display_component_content={column.display_component_content}
    //       record={row.original}
    //     />
    //   ),
    // }),

    // ...(isSessionLink && {
    //   Cell: ({ row }) => (
    //     <SessionLink
    //       {...column}
    //       value={row.original[column.field_name]}
    //       record={row.original}
    //       display_component_content={column.display_component_content ?? null}
    //     />
    //   ),
    // }),
    // ...(isShortcutLink && {
    //   Cell: ({ row }) => (
    //     <ShortcutLink
    //       {...column}
    //       value={row.original[column.field_name]}
    //       record={row.original}
    //       display_component_content={column.display_component_content ?? null}
    //     />
    //   ),
    // }),
    // ...(isPrimaryKey && {
    //   Cell: ({ row }) => (
    //     <PrimaryKey
    //       {...column}
    //       value={row.original[column.field_name]}
    //       record={row.original}
    //       display_component_content={column.display_component_content ?? null}
    //     />
    //   ),
    // }),
    // ...(isFilePath && {
    //   Cell: ({ row }) => (
    //     <FilePath
    //       {...column}
    //       value={row.original[column.field_name]}
    //       record={row.original}
    //       display_component_content={column.display_component_content ?? null}
    //     />
    //   ),
    // }),
    // ...(isReveal && {
    //   Cell: ({ row }) => (
    //     <Reveal
    //       resource={JSON.stringify(row.original[column.field_name])}
    //       value={row.original[column.field_name]}
    //     >
    //       {/* <MonacoEditor value={row.original[column.field_name]}></MonacoEditor> */}
    //       <Text>{JSON.stringify(row.original[column.field_name])}</Text>
    //     </Reveal>
    //   ),
    // }),
    // enableColumnFilterModes: enableColumnFilterModes,
    // ...(column?.max_size && {
    //   maxSize: column.max_size,
    // }),
  };
}

// // Adjusted createColumnDef to fit your use case
// export function createColumnDef<RowDataType extends RowData>(
//   column: FieldConfiguration
// ): MRT_ColumnDef<RowDataType> {
//   const isDateTime = column.data_type === "datetime";
//   const isDecimal = column.data_type === "decimal";
//   const isExternalLink = column?.display_component === "ExternalLink";
//   const isPrimaryKey = column?.display_component === "PrimaryKey";
//   const isFilePath = column?.display_component === "FilePath";
//   const isReveal = column?.display_component === "Reveal";
//   const isSessionLink = column?.display_component === "SessionLink";
//   const isShortcutLink = column?.display_component === "ShortcutLink";
//   const isExecutionStatus = column?.display_component === "ExecutionStatus";
//   const isRowActions = column?.field_name === "row_actions";
//   const conditionalFormatting = column?.conditional_formatting ?? null;
//   const enableColumnFilterModes = column?.enable_column_filter_modes ?? false;
//   // const isEnableColumnFilterModes = column?.enable_column_filter_modes ?? false;

//   const isDisplayColumn = [
//     "mrt-row-select",
//     "mrt-row-expand",
//     "mrt-row-actions",
//   ].includes(column?.field_name);
//   // default is when it is not a datetime or decimal
//   const isDefault =
//     !isDateTime &&
//     !isDecimal &&
//     !isExternalLink &&
//     !isPrimaryKey &&
//     !isFilePath &&
//     !isDisplayColumn &&
//     !isReveal &&
//     !isSessionLink &&
//     !isExecutionStatus &&
//     !isRowActions;
//   return {
//     id: column?.field_name,
//     header: column?.field_name,
//     ...(conditionalFormatting && {
//       Cell: ({ row }) => {
//         const style = getCellStyleInline(
//           row.original[column?.conditional_formatting?.field_name],
//           column
//         );
//         return <div style={style}>{row.original[column.field_name] ?? ""}</div>;
//       },
//     }),
//     ...(column?.filter_variant && {
//       filterVariant: column.filter_variant,
//       filterFn: column.filter_fn,
//     }),
//     ...(isDefault && {
//       accessorKey: column?.field_name,
//     }),
//     ...(column?.aggregation_fn && {
//       aggregationFn: column?.aggregation_fn,
//       AggregatedCell: ({ cell }) => {
//         if (isDateTime) {
//           return (
//             <DateTime
//               {...column}
//               value={cell.getValue()}
//               display_format={column.display_format ?? "yyyy-MM-dd"}
//               record={cell.row.original}
//             />
//           );
//         } else {
//           return <div>{JSON.stringify(cell.getValue())}</div>;
//         }
//       },
//     }),
//     ...(isDisplayColumn && {
//       columnDefType: "display",
//     }),
//     ...(isRowActions && {
//       columnDefType: "display", //turns off data column features like sorting, filtering, etc.
//       enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
//       Cell: ({ row }) => <RowActions record={row.original}></RowActions>,
//     }),
//     ...(isDateTime && {
//       accessorFn: (row) => new Date(row[column.field_name] ?? ""),
//       Cell: ({ row }) => (
//         <DateTime
//           {...column}
//           value={row.original[column.field_name]}
//           record={row.original}
//           display_format={column.display_format ?? "yyyy-MM-dd"}
//         />
//       ),
//     }),
//     ...(isDecimal && {
//       // Convert strings to numbers and replace null or undefined with 0
//       accessorFn: (row) => {
//         const value = row[column.field_name];
//         return value ? Number(value) : 0;
//       },
//       Cell: ({ row }) => (
//         <Decimal
//           {...column}
//           value={row.original[column.field_name]}
//           display_format={column.display_format ?? ""}
//           record={row.original}
//         />
//       ),
//     }),
//     ...(isExternalLink && {
//       Cell: ({ row }) => (
//         <ExternalLink
//           {...column}
//           value={row.original[column.field_name]}
//           display_format={column.display_format ?? ""}
//           display_component_content={column.display_component_content}
//           record={row.original}
//         />
//       ),
//     }),

//     ...(isSessionLink && {
//       Cell: ({ row }) => (
//         <SessionLink
//           {...column}
//           value={row.original[column.field_name]}
//           record={row.original}
//           display_component_content={column.display_component_content ?? null}
//         />
//       ),
//     }),
//     ...(isShortcutLink && {
//       Cell: ({ row }) => (
//         <ShortcutLink
//           {...column}
//           value={row.original[column.field_name]}
//           record={row.original}
//           display_component_content={column.display_component_content ?? null}
//         />
//       ),
//     }),
//     ...(isPrimaryKey && {
//       Cell: ({ row }) => (
//         <PrimaryKey
//           {...column}
//           value={row.original[column.field_name]}
//           record={row.original}
//           display_component_content={column.display_component_content ?? null}
//         />
//       ),
//     }),
//     ...(isFilePath && {
//       Cell: ({ row }) => (
//         <FilePath
//           {...column}
//           value={row.original[column.field_name]}
//           record={row.original}
//           display_component_content={column.display_component_content ?? null}
//         />
//       ),
//     }),
//     ...(isReveal && {
//       Cell: ({ row }) => (
//         <Reveal
//           resource={JSON.stringify(row.original[column.field_name])}
//           value={row.original[column.field_name]}
//         >
//           {/* <MonacoEditor value={row.original[column.field_name]}></MonacoEditor> */}
//           <Text>{JSON.stringify(row.original[column.field_name])}</Text>
//         </Reveal>
//       ),
//     }),
//     enableColumnFilterModes: enableColumnFilterModes,
//     ...(column?.max_size && {
//       maxSize: column.max_size,
//     }),
//   };
// }

// export function useDataColumns(columns: FieldConfiguration[]) {
//   return useMemo(() => {
//     return columns
//       .filter((column) => column?.visible)
//       .map((column) => createColumnDef<RowData>(column));
//   }, [columns]);
// }

export function useDataColumns(columns: FieldConfiguration[], tableId: string) {
  return useMemo(() => {
    return (
      columns
        // .filter((column) => column?.visible)
        .map((column, index) => ({
          ...createColumnDef<RowData>(column),
          // id: `${tableId}-${column.field_name}-${index}`, // Adjusting the ID to include the tableId
          id: `${tableId}-${column.name}`, // Adjusting the ID to include the tableId
        }))
    );
  }, [columns, tableId]);
}

export function useActivateSection() {
  const { activeLayout, setActiveLayout } = useAppStore();
  const activateSection = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };
  return { activateSection };
}

export function useSubscriptions() {
  const { data: identity } = useGetIdentity<IIdentity>();

  const {
    data: subscriptions,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<ISubscription, HttpError>({
    resource: "subscriptions",
    filters: [
      {
        field: "source.id",
        operator: "eq",
        value: identity?.email,
      },
    ],
  });
  return { subscriptions };
}

export function extractFields(
  dataObject: Record<string, any>,
  fields: FieldConfiguration[]
): Record<string, any> {
  const result: Record<string, any> = {};

  fields.forEach(({ name }) => {
    // If the dataObject has the key specified in the field configuration, add it to the result
    if (dataObject?.hasOwnProperty(name)) {
      result[name] = dataObject[name];
    }
  });

  return result;
}

// map typescript types to display_component strings i.e string -> TextInput
export const typescriptToDisplayComponent: Record<string, string> = {
  string: "TextInput",
  // text: "Textarea",
  datetime: "DateInput",
  date: "DateInput",
  number: "NumberInput",
  // file: "FileInput",
  // array: "MultiSelect",
  // object: "JsonEditor",
};

export const iconMapping: Record<string, React.ElementType> = {
  IconBrandOpenai,
  IconCode,
  IconBrandGithub,
  IconBrandGoogleDrive,
  IconCircle,
  IconBrandSpotify,
  IconBrandAirtable,
  IconBrandStripe,
  IconPresentation,
  IconNotification,
  IconPlug,
  IconMessageCircle,
  IconRobot,
  IconBrandAzure,
  IconServer,
  IconDatabase,
  IconPlane,
  IconCurrencyDollar,
  IconUsersGroup,
  IconTransform,
  IconTopologyStar3,
  IconBooks,
  IconBrandZoom,
};

// Adjust your componentMapping to explicitly use this type for its keys
export const componentMapping: Record<ComponentKey, React.ElementType> = {
  TextInput: TextInput,
  Textarea: Textarea,
  DateInput: DateInput,
  MultiSelect: MultiSelect,
  Select: Select,
  Switch: Switch,
  Checkbox: Checkbox,
  NumberInput: NumberInput,
  FileInput: FileInput,
  DateTimePicker: DateTimePicker,
  SearchInput: SearchInput,
  trips: ViewTrip,
  bookings: ViewBooking,
  payments: ViewPayment,
  test_runs: ViewTestRun,
  files: ViewFile,
  applications: ViewApplication,
  tasks: ViewTask,
  viewJson: ViewJson,
  supplier_issues: ViewJson,
  JsonEditor: MonacoEditor,
  MonacoEditor: MonacoEditor,
  MonacoEditorFormInput: MonacoEditorFormInput,
  NaturalLanguageEditorFormInput: NaturalLanguageEditorFormInput,
  ListEditorFormInput: ListEditorFormInput,
  // LocalAudioPlayer: LocalAudioPlayer,
  FileHandler: FileHandler,
  ExcalidrawEditor: ExcalidrawEditor,
  hero: Hero,
  frequently_asked_questions: FaqSimple,
  benefits: FeaturesGrid,
  get_started: Procedure,
  integrations: List,
  social_proof: List,
  showcase: AccordionList,
  email_list_signup: EmailBanner,
  // MediaPlayerController: MediaPlayerController,
  // MediaPlayerTimeline: MediaPlayerTimeline,
};

export type BaseKey = {
  toString: () => string;
  // Or if there's a specific property, for example:
  // value: string;
};

export function getResourceName(
  id: string | BaseKey | undefined
): string | null {
  if (!id) {
    return null;
  }

  // Ensure id is a string, handle BaseKey case
  let idString: string;
  if (typeof id === "object" && "toString" in id) {
    idString = id.toString();
    // Or if using a property:
    // idString = id.value;
  } else if (typeof id === "string") {
    idString = id;
  } else {
    // In case id is not a string or doesn't have the expected method/property
    return null;
  }

  // Find the index of the first occurrence of ':' or '⟨'
  const colonIndex = idString.indexOf(":");
  const angleBracketIndex = idString.indexOf("⟨");

  // If neither ':' nor '⟨' is found, return the whole idString
  if (colonIndex === -1 && angleBracketIndex === -1) {
    return idString;
  }

  // If one of the symbols is not found, use the index of the other for splitting
  // Otherwise, use the smallest index (i.e., the first occurrence)
  let splitIndex = Math.min(
    colonIndex === -1 ? Number.MAX_VALUE : colonIndex,
    angleBracketIndex === -1 ? Number.MAX_VALUE : angleBracketIndex
  );

  return idString.substring(0, splitIndex);
}

// export function useAuthToken() {
//   const { data: identity } = useGetIdentity<IIdentity>();
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);
//   const { runtimeConfig: config } = useAppStore();

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       setLoading(true);
//       const auth_token = localStorage.getItem("cmt_auth_token");
//       if (auth_token) {
//         console.log("Data already in localStorage", JSON.parse(auth_token));
//         setToken(auth_token);
//         setLoading(false);
//         return;
//       }
//       try {
//         const formData = new URLSearchParams();
//         formData.append("username", identity?.email);
//         formData.append("password", identity?.email);

//         const response = await fetch(`${config?.API_URL}/token`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: formData,
//         });

//         if (!response.ok) throw new Error("Failed to fetch auth token");

//         const data = await response.json();
//         localStorage.setItem("cmt_auth_token", JSON.stringify(data));
//         setToken(JSON.stringify(data));
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError(error as Error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (identity) {
//       fetchAuthToken();
//     }
//   }, [identity]); // Re-run when `identity` changes

//   return { token, loading, error };
// }

type RecordIdentifier = {
  id: string;
  name: string;
};

export function extractIdentifier(activeRecord: any): RecordIdentifier {
  // Define the keys in the priority order you want to check
  const keysToCheck: string[] = [
    "name",
    "sst_booking_number",
    "flight_pnr",
    "related_record",
    "trip_id",
    "test_id",
    "id",
  ];

  for (let key of keysToCheck) {
    if (activeRecord?.[key]) {
      return { id: activeRecord[key], name: key };
    }
  }

  // Return null or any other default value if no keys are found
  return {
    id: "",
    name: "",
  };
}

export function useFetchActionById(actionId: string | null) {
  const [action, setAction] = useState<IAction | null>(null);
  const { runtimeConfig: config } = useAppStore();

  // const active_action_query = {
  //   credentials: "surrealdb_catchmytask",
  //   query: `SELECT *, show.view_id.* AS show.view, list.view_id.* AS list.view FROM actions WHERE id = '${actionId}'`,
  //   query_language: "surrealql",
  // };
  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/catch`,
    method: "post",
    config: {
      payload: {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "retrieve",
            tool_arguments: {
              queries: [
                {
                  query: `SELECT *, show.view_id.* AS show.view, list.view_id.* AS list.view FROM actions WHERE id = '${actionId}'`,
                  credential: "surrealdb_catchmytask",
                  params: {},
                },
              ],
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchActionById_${actionId}`],
    },
  });

  useEffect(() => {
    if (!isLoading && data && !error) {
      setAction(data?.data[0]);
    }
  }, [data, isLoading, error]);

  return { action, isLoading, error };
}

export function useFetchActionHistoryById(actionId: any | null) {
  const [action, setAction] = useState<IAction | null>(null);
  const { runtimeConfig: config } = useAppStore();

  const active_action_query = {
    credentials: "surrealdb_catchmytask",
    query: `SELECT * FROM execute WHERE in = 'task:⟨018ebf59-a43a-77ba-9535-c1f2a84ec786⟩'`,
    query_language: "surrealql",
  };
  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        function_arguments: active_action_query,
      },
    },
    queryOptions: {
      queryKey: [`useFetchActionHistoryById_${actionId}`],
    },
  });

  // useEffect(() => {
  //   if (!isLoading && data && !error) {
  //     setAction(data?.data[0]);
  //   }
  // }, [data, isLoading, error]);

  return { data, isLoading, error, isError };
}

export function useFetchDomainDataByDomain(state: any) {
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/execute-guest-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get domain data",
            name: "domain data",
            job: "get domain data",
            action_step_query: `SELECT * FROM fn::execute_query('domain data', '${JSON.stringify(
              state
            )}')`,
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            select: {
              query: `SELECT * FROM fn::execute_query('domain data', '${JSON.stringify(
                state
              )}')`,
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchDomainDataByDomain_${JSON.stringify(state)}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchRecommendationDataByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-recommendation`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get recommendation data",
            name: "recommendation_data",
            job: "get recommendation data",
            action_step_query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
              state
            )}')`,
            method: "get",
            type: "main",
            select: {
              query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
                state
              )}')`,
              credential: "surrealdb_catchmytask",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchRecommendationDataByState_${JSON.stringify(state)}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchActionStepDataByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/execute-task`,
    method: "get",
    config: {
      payload: {
        ...state,
        // task_variables: {},
        // global_variables: {},
        // include_action_steps: [1],
        // action_steps: [
        //   {
        //     id: "1",
        //     execution_order: 1,
        //     description: "get recommendation data",
        //     name: "recommendation_data",
        //     job: "get recommendation data",
        //     action_step_query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //       state
        //     )}')`,
        //     method: "get",
        //     type: "main",
        //     select: {
        //       query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //         state
        //       )}')`,
        //       credential: "surrealdb_catchmytask",
        //     },
        //   },
        // ],
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchActionStepDataByState_${JSON.stringify({
          name: state?.action_steps[0]?.name,
          execution_order: state?.action_steps[0]?.execution_order,
          id: state?.action_steps[0]?.id,
          // success_message_code: state?.action_steps[0]?.success_message_code,
        })}`,
      ],
      // enabled: false,
    },
  });

  return { data, isLoading, error, isError };
}

export function useQueryByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        ...state,
      },
    },
    queryOptions: {
      queryKey: [
        `useQueryByState_${JSON.stringify({
          name: state?.name,
          // execution_order: state?.action_steps[0]?.execution_order,
          id: state?.id,
          // success_message_code: state?.action_steps[0]?.success_message_code,
        })}`,
      ],
      // enabled: false,
    },
  });

  return { data, isLoading, error, isError };
}

// export function useReadByState(state: any) {
//   // const variables = state;
//   const { runtimeConfig: config } = useAppStore();

//   const { data, isLoading, error, isError, refetch } = useCustom({
//     url: `${config?.API_URL}/read`,
//     method: "post",
//     config: {
//       payload: {
//         ...state,
//       },
//     },
//     queryOptions: {
//       queryKey: [
//         `readByState_${JSON.stringify({
//           success_message_code: state?.success_message_code,
//         })}`,
//       ],
//       onSuccess: (data) => {
//         console.log("success data", data);
//       },
//       onError: (error) => {
//         console.log("error", error);
//       },
//     },
//   });

//   return { data, isLoading, error, isError, refetch };
// }

export function useReadByState(state: any) {
  const {
    runtimeConfig: config,
    local_db,
    setLocalDB,
    updateLocalDB,
  } = useAppStore();

  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context

  // State variables for LocalDB operation statuses
  const [isLocalDBLoading, setIsLocalDBLoading] = useState(false);
  const [isLocalDBSuccess, setIsLocalDBSuccess] = useState(false);
  const [localDBError, setLocalDBError] = useState(null);

  const { data, isLoading, error, isError, refetch } = useCustom({
    url: `${config?.API_URL}/read`,
    method: "post",
    config: {
      payload: { ...state },
    },
    queryOptions: {
      queryKey: [
        `readByState_${JSON.stringify({
          success_message_code: state?.success_message_code,
        })}`,
      ],
      onSuccess: async (fetchedData) => {
        // console.log("Fetched data successfully:", fetchedData);
        // table name is the success message code
        let tableName = state.success_message_code;

        // Extract data_items and data_fields from the fetched data
        const dataRecord = fetchedData?.data?.find(
          (item: any) => item?.message?.code === state.success_message_code
        );

        const data_items = dataRecord?.data || [];
        const data_fields = (dataRecord?.data_fields || []).map(
          (field: any) => ({
            name: field?.name,
            data_type: field?.data_type,
          })
        );

        // Save to DuckDB local_db
        if (data_items.length > 0 && data_fields.length > 0) {
          setIsLocalDBLoading(true);
          setLocalDBError(null);
          setIsLocalDBSuccess(false);
          // Update the state with functional updates
          // setLocalDB((prevLocalDB) => ({
          //   ...prevLocalDB,
          //   [tableName]: {
          //     isLocalDBLoading: true,
          //     isLocalDBSuccess: false,
          //     localDBError: null,
          //   },
          // }));
          let item = {
            isLocalDBLoading: true,
            isLocalDBSuccess: false,
            localDBError: null,
          };
          updateLocalDB(tableName, item);
          // console.log("Local DB item init:", item);

          try {
            const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
            await dbInstance.query(dropQuery);
            await saveToLocalDB(data_items, tableName, data_fields, dbInstance);
            console.log("Data saved to DuckDB successfully");
            setIsLocalDBSuccess(true);
            let success_item = {
              isLocalDBLoading: false,
              isLocalDBSuccess: true,
              localDBError: null,
            };
            updateLocalDB(tableName, success_item);
            // console.log(
            //   `Local DB item success item: ${tableName}`,
            //   success_item
            // );
            // setLocalDB(item);
            // let success_merged = { ...local_db, ...success_item };
            // console.log("Local DB item success item:", success_item);
            // setLocalDB(local_db_item);
            // console.log("Local DB item success:", tableName, local_db_item);
            // success message code
            // console.log("Data saved to Table:", tableName);
            // console.log("Data saved to DuckDB:", data_items);
            // console.log("Data fields:", data_fields);
          } catch (error) {
            console.error("Error saving data to DuckDB:", error);
            setLocalDBError(error as any);
            // setLocalDB({
            //   ...local_db,
            //   [tableName]: {
            //     isLocalDBLoading: false,
            //     isLocalDBSuccess: false,
            //     localDBError: error,
            //   },
            // });
          } finally {
            setIsLocalDBLoading(false);
            // setLocalDB({
            //   ...local_db,
            //   [tableName]: {
            //     isLocalDBLoading: false,
            //     isLocalDBSuccess: false,
            //     localDBError: null,
            //   },
            // });
          }
        }
      },
      onError: (fetchError) => {
        console.log("Error fetching data:", fetchError);
      },
    },
  });

  return {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isLocalDBLoading,
    isLocalDBSuccess,
    localDBError,
  };
}

export function useReadRecordByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();
  if (state?.read_record_mode !== "remote") {
    return {
      data: state?.record,
      isLoading: false,
      error: null,
      isError: false,
    };
  }

  const { data, isLoading, error, isError, refetch } = useCustom({
    url: `${config?.API_URL}/read`,
    method: "post",
    config: {
      payload: {
        action_steps: state?.action_steps || [
          {
            execution_order: state?.execution_order || 1,
            description: state?.description || "use read record by state",
            name: state?.name || "use read record by state",
            job: state?.description || "use read record by state",
            method: state?.method || "select",
            type: state?.type || "action_steps",
            credential: state?.credential || "surrealdb catchmytask dev",
            credential_id: "credentials:5drygx90zfe8mf2jigvl",
            implement: state?.implement,
            action_step_query: `SELECT * FROM ${state?.record?.id}`,
            success_message_code: state?.success_message_code || "record_read",
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [
        `readByState_${JSON.stringify({
          success_message_code: state?.success_message_code,
        })}`,
      ],
    },
  });

  return { data, isLoading, error, isError, refetch };
}

export function useFetchTaskInputDataByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-task-input`,
    method: "post",
    config: {
      payload: {
        ...state,
        // task_variables: {},
        // global_variables: {},
        // include_action_steps: [1],
        // action_steps: [
        //   {
        //     id: "1",
        //     execution_order: 1,
        //     description: "get recommendation data",
        //     name: "recommendation_data",
        //     job: "get recommendation data",
        //     action_step_query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //       state
        //     )}')`,
        //     method: "get",
        //     type: "main",
        //     select: {
        //       query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //         state
        //       )}')`,
        //       credential: "surrealdb_catchmytask",
        //     },
        //   },
        // ],
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchTaskInputDataByState_${JSON.stringify({
          // name: state?.action_steps[0]?.name,
          // execution_order: state?.action_steps[0]?.execution_order,
          description: state?.description,
          id: state?.id,
          // success_message_code: state?.action_steps[0]?.success_message_code,
        })}`,
      ],
      // enabled: false,
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchActionPlanDataByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-task`,
    method: "post",
    config: {
      payload: {
        ...state,
        // task_variables: {},
        // global_variables: {},
        // include_action_steps: [1],
        // action_steps: [
        //   {
        //     id: "1",
        //     execution_order: 1,
        //     description: "get recommendation data",
        //     name: "recommendation_data",
        //     job: "get recommendation data",
        //     action_step_query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //       state
        //     )}')`,
        //     method: "get",
        //     type: "main",
        //     select: {
        //       query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //         state
        //       )}')`,
        //       credential: "surrealdb_catchmytask",
        //     },
        //   },
        // ],
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchActionPlanDataByState_${JSON.stringify({
          id: state?.input_values?.id,
          // id: state?.id,
          // name: state?.action_steps[0]?.name,
          // execution_order: state?.action_steps[0]?.execution_order,
          // id: state?.action_steps[0]?.id,
          // success_message_code: state?.action_steps[0]?.success_message_code,
        })}`,
      ],
      // enabled: false,
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchActionStepsDataByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-action-step`,
    method: "post",
    config: {
      payload: {
        ...state,
        // task_variables: {},
        // global_variables: {},
        // include_action_steps: [1],
        // action_steps: [
        //   {
        //     id: "1",
        //     execution_order: 1,
        //     description: "get recommendation data",
        //     name: "recommendation_data",
        //     job: "get recommendation data",
        //     action_step_query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //       state
        //     )}')`,
        //     method: "get",
        //     type: "main",
        //     select: {
        //       query: `SELECT * FROM fn::execute_query('recommendation_data', '${JSON.stringify(
        //         state
        //       )}')`,
        //       credential: "surrealdb_catchmytask",
        //     },
        //   },
        // ],
      },
    },
    queryOptions: {
      // queryKey: [
      //   `useFetchActionStepsDataByState_${JSON.stringify({
      //     id: "tasks:hlw9ig5ncahfx8eaec7h",
      //   })}`,
      // ],
      // enabled: false,
      queryKey: [
        `useFetchActionStepsDataByState_${JSON.stringify({
          id: "tasks:hlw9ig5ncahfx8eaec7h",
        })}`,
      ],
    },
  });

  return { data, isLoading, error, isError };
}

interface useFetchGenerativeRecommendationDataByStateProps {
  state: any;
  response_model?: string;
  type?: string;
}

export function useFetchGenerativeRecommendationDataByState({
  state,
  response_model = "GenerativeRecommendation",
  type = "recommendations",
}: useFetchGenerativeRecommendationDataByStateProps) {
  // const variables = state;

  let query_key_variables = {
    state: state,
    response_model: response_model,
    type: type,
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-generative-recommendation`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get generative recommendation data",
            name: "generative_recommendation_data",
            job: "get generative recommendation data",
            action_step_query: `${JSON.stringify(state)}`,
            method: "get",
            type: "main",
            select: {
              query: `${JSON.stringify(state)}`,
              response_model: response_model,
              type: type,
              credential: "openapi_dpwanjala_35turbo1106",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchGenerativeRecommendationDataByState_${JSON.stringify(
          query_key_variables
        )}`,
      ],
    },
  });

  return { data, isLoading, error, isError };
}

interface useFetchGenerativeComponentDataByStateAndModelProps {
  state: any;
  response_model?: string;
  type?: string;
  instruction?: string;
}

export function useFetchGenerativeComponentDataByStateAndModel({
  state,
  response_model = "GenerativeRecommendation",
  type = "recommendations",
  instruction = "",
}: useFetchGenerativeComponentDataByStateAndModelProps) {
  let query_key_variables = {
    state: state,
    response_model: response_model,
    type: type,
    instruction: instruction,
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/catch-generate`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get generative component data",
            name: "generative_component_data",
            job: "get generative component data",
            action_step_query: `${JSON.stringify(state)}`,
            method: "get",
            type: "main",
            select: {
              query: `${JSON.stringify(state)}`,
              response_model: response_model,
              type: type,
              instruction: instruction,
              credential: "openapi_dpwanjala_35turbo1106",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchGenerativeComponentDataByStateAndModel_${JSON.stringify(
          query_key_variables
        )}`,
      ],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchActionDataByName(state: any) {
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/execute-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get action data",
            name: "action_data",
            job: "get action data",
            action_step_query: `SELECT * FROM fn::execute_query('action_data', '${JSON.stringify(
              state
            )}')`,
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            select: {
              query: `SELECT * FROM fn::execute_query('action_data', '${JSON.stringify(
                state
              )}')`,
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchActionDataByName_${state}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchDataModelByState(state: any) {
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/execute-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "get data model",
            name: "get data model",
            job: "get data model",
            action_step_query: `SELECT * FROM fn::execute_query('data_model', '${JSON.stringify(
              state
            )}')`,
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            select: {
              query: `SELECT * FROM fn::execute_query('data_model', '${JSON.stringify(
                state
              )}')`,
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchDataModelByState_${state}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchQueryDataByState(state: any) {
  const { runtimeConfig: config } = useAppStore();
  // pop out frequently changing search_term or other part of state i don't want to trigger a new fetch/use in queryKey
  const { search_term, ...rest } = state;

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/execute-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_action_steps: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "query data",
            name: "query data",
            job: "query data",
            action_step_query: `SELECT * FROM fn::execute_query('${
              state?.query_name
            }', '${JSON.stringify(state)}')`,
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            success_message_code:
              state?.success_message_code ?? "query_success_results",
            select: {
              query: `SELECT * FROM fn::execute_query('${
                state?.query_name
              }', '${JSON.stringify(state)}')`,
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchQueryDataByState_${JSON.stringify(state)}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useFetchSessionById(sessionId: string | null) {
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/execute-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "Retrieve session data",
            name: "retrieve_session_data",
            job: "retrieve session data",
            action_step_query: `RETURN {
                LET $session_id = '${sessionId}';
                LET $task_ids = SELECT VALUE out FROM execute_task WHERE in = $session_id;
                RETURN {
                    'session': (SELECT *, show.view_id.* AS show.view, list.view_id.* AS list.view FROM ONLY sessions WHERE id = $session_id LIMIT 1),
                    'task_ids': $task_ids,
                    'action_steps': SELECT * FROM action_steps WHERE task_id IN $task_ids
                }
            }`,
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            select: {
              query: `RETURN {
                        LET $session_id = '${sessionId}';
                        LET $task_ids = SELECT VALUE out FROM execute_task WHERE in = $session_id;
                        RETURN {
                            'session': (SELECT *, show.view_id.* AS show.view, list.view_id.* AS list.view FROM ONLY sessions WHERE id = $session_id LIMIT 1),
                            'task_ids': $task_ids,
                            'action_steps': SELECT * FROM action_steps WHERE task_id IN $task_ids
                        }
                    }`,
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchSessionById_${sessionId}`],
    },
  });

  // useEffect(() => {
  //   if (!isLoading && data && !error) {
  //     setAction(data?.data[0]);
  //   }
  // }, [data, isLoading, error]);
  return { data, isLoading, error };
}

export function useFetchViewById(viewId: string | null) {
  const { runtimeConfig: config } = useAppStore();

  // const [data, setAction] = useState<IAction | null>(null);
  // const view_query = {
  //   credentials: "surrealdb_catchmytask",
  //   query: `SELECT ->includes_field_configuration.*.out.* AS field_configurations FROM '${viewId}';`,
  //   query_language: "surrealql",
  // };
  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/catch`,
    method: "post",
    config: {
      payload: {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "retrieve",
            tool_arguments: {
              queries: [
                {
                  query: `SELECT ->includes_field_configuration.*.out.* AS field_configurations FROM '${viewId}';`,
                  credential: "surrealdb_catchmytask",
                  params: {},
                },
              ],
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`useFetchViewById_${viewId}`],
    },
  });

  // useEffect(() => {
  //   if (!isLoading && data && !error) {
  //     setAction(data?.data[0]);
  //   }
  // }, [data, isLoading, error]);
  return { data, isLoading, error };
}

export function useFetchViewByName(viewName: string | null) {
  // const [data, setAction] = useState<IAction | null>(null);
  const view_query = {
    credentials: "surrealdb_catchmytask",
    query: `SELECT (SELECT *, out.* FROM includes_field_configuration WHERE in == $parent.id) AS field_configurations, (SELECT *, out.* FROM includes_action_configuration WHERE in == $parent.id) AS action_configurations, * FROM views WHERE name = '${viewName}';`,
    query_language: "surrealql",
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        function_arguments: view_query,
      },
    },
    queryOptions: {
      queryKey: [`useFetchViewByName_${viewName}`],
    },
  });

  // useEffect(() => {
  //   if (!isLoading && data && !error) {
  //     setAction(data?.data[0]);
  //   }
  // }, [data, isLoading, error]);
  return { data, isLoading, error };
}

export function useFetchActionByName(actionName: string | null) {
  // const [data, setAction] = useState<IAction | null>(null);
  const view_query = {
    credentials: "surrealdb_catchmytask",
    query: `SELECT (SELECT *, out.* FROM includes_field_configuration WHERE in == $parent.id) AS field_configurations, (SELECT *, out.* FROM includes_action_configuration WHERE in == $parent.id) AS action_configurations, * FROM views WHERE name = '${actionName}';`,
    query_language: "surrealql",
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        function_arguments: view_query,
      },
    },
    queryOptions: {
      queryKey: [`useFetchActionByName_${actionName}`],
    },
  });

  return { data, isLoading, error };
}

export function useFetchExecutionTraceBySessionId(sessionId: string | null) {
  // const [data, setAction] = useState<IAction | null>(null);
  const view_query = {
    credentials: "surrealdb_catchmytask",
    query: `SELECT * FROM execution_traces WHERE session_id = '${sessionId}';`,
    query_language: "surrealql",
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        function_arguments: view_query,
      },
    },
    queryOptions: {
      queryKey: [`useFetchExecutionTraceBySessionId_${sessionId}`],
    },
  });

  return { data, isLoading, error };
}

export function useFetchResourceByField(item: {
  resource: string;
  field: string;
  value: string | number | boolean | undefined | null;
  operator: string;
}) {
  // const [data, setAction] = useState<IAction | null>(null);
  const { resource, field, value, operator } = item;
  const view_query = {
    credentials: "surrealdb_catchmytask",
    query: `SELECT * FROM ${resource} WHERE ${field} ${operator} '${value}';`,
    query_language: "surrealql",
  };
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        function_arguments: view_query,
      },
    },
    queryOptions: {
      queryKey: [
        `useFetchResource_${resource}_where_${field}_${operator}_${value}`,
      ],
    },
  });

  return { data, isLoading, error };
}

export function useFetchApplicationById(applicationId: string | null) {
  const [application, setApplication] = useState<IApplication | null>(null);
  const { data, error, isLoading } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: `${applicationId}`,
  });

  useEffect(() => {
    if (!isLoading && data && !error) {
      setApplication(data.data);
    }
  }, [data, isLoading, error]);

  return { application, isLoading, error };
}

export type AggregationFn = (
  getLeafRows: () => { original: { status: string } }[],
  getChildRows: () => any[]
) => string;

export const getActionStatus: AggregationFn = (getLeafRows, getChildRows) => {
  const leafRows = getLeafRows();
  if (leafRows.some((row) => row.original.status === "error")) {
    return "error";
  } else if (leafRows.some((row) => row.original.status === "pending")) {
    return "pending";
  }
  return "complete";
};

export function selectExecutionStatus(statusList: string[]): string {
  if (statusList.some((status) => status === "error")) {
    return "error";
  } else if (statusList.some((status) => status === "pending")) {
    return "pending";
  }
  return "complete";
}

// export const queryClient = useQueryClient();

export type ReplacementValues = { [key: string]: string };

// // Helper function to get component by resource type
// export function getComponentByResourceType(resourceType: ComponentKey) {
//   const Component = componentMapping[resourceType];
//   if (!Component) {
//     throw new Error(`Component for resource type "${resourceType}" not found`);
//   }
//   return Component;
// }

// Define a fallback component that accepts the resource type as a prop
const ComponentNotFound = ({ resourceType }: { resourceType: string }) => {
  return <div>Component not found: "{resourceType}"</div>;
};

// Helper function to get component by resource type
export function getComponentByResourceType(resourceType: ComponentKey) {
  const Component = componentMapping[resourceType];
  if (!Component) {
    return () => <ComponentNotFound resourceType={resourceType} />;
  }
  return Component;
}

export const ComponentNotFoundComponent = (props: any) => {
  return <div>{props?.section} component not found</div>;
};

// Helper function to get component by resource type
export function getComponentByKey(key: ComponentKey) {
  const Component = componentMapping[key];
  // const Component = false;
  if (!Component) {
    // throw new Error(`Component "${key}" not found`);
    return ComponentNotFoundComponent;
  }
  return Component;
  // return <div>Returned component</div>;
}

export function formatValue(
  value: string,
  dataType: string,
  formatString: string
): string {
  // console.log(
  //   `Formatting value: ${value} as ${dataType} with format: ${formatString}`
  // );
  switch (dataType) {
    case "date":
      // Use formatDateTime for date values
      const formattedDate = formatDateTime(value, formatString);
      if (formattedDate !== undefined) {
        return formattedDate;
      } else {
        console.error(
          `Failed to format date value: ${value} with format: ${formatString}`
        );
        return value; // Return original value if formatting fails
      }
    case "number":
      // Add logic for number formatting if necessary
      return value;
    default:
      return value;
  }
}

export function recursiveReplace(
  currentObj: any,
  replacementValues: { [key: string]: string },
  parentFormats: { [key: string]: string } = {}
): any {
  if (typeof currentObj === "string") {
    return currentObj.replace(/\$\{([^}]+)\}/g, (_, variableName) => {
      // console.log(`Found variable: ${variableName}`);
      // Directly construct the expected format key based on the variable name
      const expectedFormatKey = `${variableName}_date_format`;
      const formatSpec = parentFormats[expectedFormatKey];

      if (formatSpec) {
        // console.log(`Using format spec: ${formatSpec} for ${variableName}`);
        // Assuming 'date' as the dataType for simplicity, since that's what's being used
        const formatString = formatSpec; // In your structure, the spec itself is the format string
        let replacementValue = formatValue(
          replacementValues[variableName],
          "date",
          formatString
        );
        return replacementValue;
      } else {
        // console.log(
        //   `No format spec found for ${variableName} using key ${expectedFormatKey}`
        // );
        return replacementValues[variableName] || variableName; // Use original if no format found
      }
    });
  } else if (Array.isArray(currentObj)) {
    return currentObj.map((item) =>
      recursiveReplace(item, replacementValues, parentFormats)
    );
  } else if (typeof currentObj === "object" && currentObj !== null) {
    const childFormats = { ...parentFormats };
    Object.keys(currentObj).forEach((key) => {
      if (key.includes("_format")) {
        // console.log(
        //   `Extracting format for key: ${key}, Format: ${currentObj[key]}`
        // );
        // Add the entire format key and its value to childFormats
        childFormats[key] = currentObj[key];
      }
    });

    const replacedObj: any = {};
    Object.keys(currentObj).forEach((key) => {
      replacedObj[key] = recursiveReplace(
        currentObj[key],
        replacementValues,
        childFormats
      );
    });
    return replacedObj;
  }
  return currentObj;
}

export function replacePlaceholdersInObject(
  obj: any,
  replacementValues: { [key: string]: string }
) {
  return recursiveReplace(obj, replacementValues);
}

// Define your function to extract default values
export function extractActiveActionDefaultValues(
  fieldConfigurations: FieldConfiguration[]
): Record<string, any> {
  const defaultValues: Record<string, any> = {};

  fieldConfigurations.forEach((fieldConfig) => {
    if (fieldConfig.default_value !== undefined) {
      defaultValues[fieldConfig.name] = fieldConfig.default_value;
    }
  });

  return defaultValues;
}

export async function getFileHash(file: any) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `file_${hashHex}`;
}

export async function getFileArrayBufferById(recordId: any) {
  const fileHandleEntry = await localDb.file_handles
    .where({ record_id: recordId })
    .first(); // Assuming record_id is unique or you're only interested in the first match

  if (!fileHandleEntry) {
    throw new Error("File handle not found for the given record ID.");
  }

  return fileHandleEntry.file_handle; // This is the ArrayBuffer of the file
}

// export function useTableColumns(field_configurations: FieldConfiguration[]) {
//   const tableColumns = useMemo<ColumnDef<RowData, any>[]>(
//     () => [...field_configurations].map((item) => item)],
//     []
//   );

//   // useEffect(() => {
//   //   if (!isLoading && data && !error) {
//   //     setAction(data?.data[0]);
//   //   }
//   // }, [data, isLoading, error]);
//   return { tableColumns };
// }

const renderContent = (content: string) => {
  return useMemo(() => {
    const parts = content.split(/(```[\s\S]*?```)/g); // Splits content into code blocks and plain text

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract code block language if specified
        const codeContent = part.slice(3, -3);
        const language = "sql"; // Default to 'sql', or extract from the code block if specified

        return (
          <MonacoEditor
            key={`${index}-${language}`} // Ensure the key is stable
            value={codeContent.trim()}
            language={language}
            // options={{
            //   readOnly: true,
            //   minimap: { enabled: false },
            //   automaticLayout: true,
            // }}
            // height="100px" // Adjust height as needed
          />
        );
      } else {
        // Render the rest of the content with dangerouslySetInnerHTML
        return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      }
    });
  }, [content]); // Only recalculate if content changes
};

const MemoizedCell = React.memo(({ content }: { content: string }) => (
  <div>{renderContent(content)}</div>
));

function DescriptionPopover({
  rowId,
  isOpen,
  onOpen,
  onClose,
}: {
  rowId: string;
  isOpen: boolean;
  onOpen: (e: any, rowId: string) => void;
  onClose: () => void;
}) {
  const ref = useClickOutside(onClose);

  return (
    <div className="pr-1">
      <Popover
        width={200}
        position="bottom"
        withArrow
        shadow="md"
        opened={isOpen}
        trapFocus
      >
        <Popover.Target>
          <ActionIcon
            aria-label="Settings"
            size={"xs"}
            variant="subtle"
            onClick={(e) => onOpen(e, rowId)}
          >
            <IconMessageCircle />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown ref={ref}>
          <TextInput label="prompt" placeholder="prompt" size="xs" />
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}

interface UseTableColumnsProps {
  field_configurations: FieldConfiguration[];
  table_id: string;
}

export function useTableColumns({
  field_configurations,
  table_id,
}: UseTableColumnsProps) {
  const [openedPopover, setOpenedPopover] = useState<string | null>(null);

  const handlePopoverOpen = (e: any, rowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenedPopover(rowId);
  };

  const handlePopoverClose = () => {
    setOpenedPopover(null);
  };

  const tableColumns = useMemo<ColumnDef<RowData, any>[]>(
    () =>
      field_configurations?.map((item) => {
        return {
          // id: `${table_id}-${item?.name}`,
          id: item?.name,
          accessorKey: item?.accessor_key || item?.name, // Assuming each FieldConfiguration has a 'name' property
          header: item?.name, // Assuming each FieldConfiguration has a 'name' property
          filterFn: "includesString", // use built-in filter function
          sortingFn: "alphanumeric",
          // cell: (row: RowData) => {
          //   const rowId = `${row?.id}`; // Assuming each row has a unique 'id' property

          //   return (
          //     <div className="flex">
          //       {/* {item?.name === "description" && (
          //         <DescriptionPopover
          //           rowId={rowId}
          //           isOpen={openedPopover === rowId}
          //           onOpen={handlePopoverOpen}
          //           onClose={handlePopoverClose}
          //         />
          //       )} */}
          //       <div dangerouslySetInnerHTML={{ __html: row[item?.name] }} />
          //     </div>
          //   );
          // },
          // Add more properties as needed from item
        };
      }),
    [field_configurations, table_id, openedPopover]
  );

  return { tableColumns };
}

export const RetrieveFieldData = ({ field }: { field: FieldConfiguration }) => {
  // const queryClient = useQueryClient();
  // const fieldData = queryClient.getQueryData<FieldData>([field]) || {};
  // console.log("field", field);
  const { activeField } = useAppStore();
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config?.API_URL}/execute-query`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "Retrieve field data",
            name: "retrieve_field_data",
            job: "retrieve field data",
            action_step_query:
              field?.data_prop_query || "SELECT * FROM sessions",
            method: "get",
            type: "main",
            credential: "surrealdb catchmytask dev",
            select: {
              query: field?.data_prop_query || "SELECT * FROM sessions",
              credential: "surrealdb catchmytask dev",
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`field_data_for_${field?.name}`], // simply change the query key to trigger call for that field
      // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
      // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
      // enabled:
      //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
      // enabled:
      // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
      // enabled:
      //   activeField?.field_name && !focusedFields?.[activeField?.field_name]
      //     ? true
      //     : false, // as long as there is a activefield with field name, run the query
      // enabled: touchedFields.includes(field?.name),
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // data is the response from the query
      // setFocusedFields({
      //   ...focusedFields,
      //   [activeField?.field_name]: {
      //     ...activeField,
      //     data: data?.data,
      //   },
      // }); // Reset focused field after successful query
      return {
        message: `successfully retrieved ${activeField?.field_name}s.`,
        description: "Success with no errors",
        type: "success",
      };
    },
  });
  return null;
};

export const mergeEdgeWithEntityValues = (edge_and_entity: any) => {
  // pop the key out from the object
  let { out, ...edge } = edge_and_entity;
  // pop the key id from rest object
  let { id, ...edge_without_id } = edge;
  // console.log("edge_without_id", edge_without_id);
  // return and merge the rest object with the out object
  return {
    ...out,
    edge_id: id,
    ...edge_without_id,
  };
};

export const useDomain = () => {
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // This includes the protocol and domain up to the extension
      setDomain(window.location.origin);
    }
  }, []);

  return domain;
};

// A typical debounced input react component
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  // const icon = (
  //   <Tooltip label="toggle sql mode" position="left">
  //     <div>
  //       <ActionIcon
  //         size="sm"
  //         variant="outline"
  //         // variant="outline"
  //         // color="green"
  //         // onClick={(e) => handleImplement(e)}
  //         // disabled={!canSubmit}
  //         // loading={mutationIsLoading || isSubmitting}
  //         // onClick={(e) => handleExecuteSelected(e)}
  //         // disabled={!canSubmit}
  //         // loading={mutationIsLoading || isSubmitting}
  //       >
  //         {/* hide or reveal a natural languge input with correct context */}
  //         <IconSql />
  //       </ActionIcon>
  //       {/* // {JSON.stringify(record?.natural_language_prompt)} */}
  //     </div>
  //   </Tooltip>
  // );

  return (
    <TextInput
      size="sm"
      // {...props}
      placeholder={props?.placeholder}
      // leftSection={icon}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const useRuntimeConfig = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await fetch("/api/runtime-config");
      const data = await res.json();
      setConfig(data);
    };

    fetchConfig();
  }, []);

  return config as any;
};

export function useSessionNavigation() {
  const { setActiveSession, activeApplication } = useAppStore();
  const go = useGo();

  const navigateToSession = (
    sessionId: string,
    sessions: { id: string; name: string }[]
  ) => {
    const selectedSession = sessions.find(
      (session) => session.id === sessionId
    );

    console.log(`Navigating to session: ${sessionId}`);
    // console.log(`Selected session: ${selectedSession}`);
    // console.log(sessions);

    if (selectedSession) {
      setActiveSession(selectedSession);
      go({
        to: {
          resource: "sessions",
          action: "show",
          id: selectedSession.id,
          meta: {
            applicationId: activeApplication?.id,
          },
        },
        type: "push",
      });
    }
  };

  return navigateToSession;
}

export function useNavigation() {
  const { activeApplication, activeSession, activeTask } = useAppStore();
  const go = useGo();

  const navigate = (
    record: any
    // sessionId: string,
    // sessions: { id: string; name: string }[]
  ) => {
    // const selectedSession = sessions.find(
    //   (session) => session.id === sessionId
    // );

    // console.log(`Navigating to session: ${sessionId}`);
    // console.log(`Selected session: ${selectedSession}`);
    // console.log(sessions);

    if (record?.entity_type === "tasks") {
      // setActiveSession(selectedSession);
      go({
        to: {
          resource: "tasks",
          action: "show",
          id: record.id,
          meta: {
            applicationId: activeApplication?.id,
            sessionId: activeSession?.id,
            taskId: record.id,
          },
        },
        query: {
          applicationId: activeApplication?.id,
          sessionId: activeSession?.id,
        },
        type: "push",
      });
    }
  };

  return navigate;
}

// Helper function to truncate the description to a word limit
export const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return text;
};

export function extractDefaultValues(model: any) {
  const defaultValues: { [key: string]: any } = {};
  const properties = model.schema.properties;

  for (const key in properties) {
    if (
      properties[key].hasOwnProperty("default") &&
      properties[key].default !== null
    ) {
      defaultValues[key] = properties[key].default;
    }
  }

  return defaultValues;
}

export function extractLabelsFromDefaults(defaultValues: any) {
  const labelValues: { [key: string]: any } = {};

  for (const key in defaultValues) {
    if (defaultValues[key].hasOwnProperty("label")) {
      labelValues[key] = defaultValues[key].label;
    }
  }

  return labelValues;
}

export function isAllLocalDBSuccess(
  localDBState: any,
  selectedActionSteps: any
) {
  const success_message_codes = new Set(
    selectedActionSteps.map((action: any) => action.success_message_code)
  );

  // Ensure all keys in localDBState that match success_message_codes have isLocalDBSuccess as true
  return Object.keys(localDBState)
    .filter((key: any) => success_message_codes.has(key))
    .every((key: any) => localDBState[key].isLocalDBSuccess === true);
}

// Icon mapping object
export const iconMap: Record<string, React.ElementType> = {
  pin: IconPin,
  remove: IconCircleMinus,
  configure: IconTool,
  automate: IconSettingsAutomation,
  save: IconFileDownload,
  search: IconSearch,
  execute: IconPlayerPlay,
  query: IconZoomCode,
  share: IconShare,
  cancel: IconCircleX,
  display: IconPlayerStop,
  menu: IconMenu2,
  implement: IconPlaylistAdd,
  plan: IconSitemap,
  build: IconCode,
  fields: IconTallymark3,
  edit: IconPencil,
  summary: IconChartBar,
  activity: IconTimelineEventPlus,
  issues: IconSquare,
};
