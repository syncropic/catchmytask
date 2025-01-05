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
import type { FieldApi } from "@tanstack/react-form";
import ExcelJS from "exceljs";
import { format, isValid, parseISO } from "date-fns";
import Surreal, { LiveHandler, Uuid } from "surrealdb";
import { getDb } from "src/surreal";

import {
  ComponentKey,
  NavigateOnSelect,
  QueryResult,
  SQLFilter,
  SQLTemplateOptions,
  SQLValueType,
} from "@components/interfaces";
import { CellStyle } from "@silevis/reactgrid";
import { useNavigation as useNavigationRefine } from "@refinedev/core";
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
  RangeSlider,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  IconStackBack,
  IconListDetails,
  IconCopyCheck,
  IconEye,
  IconUserPlus,
  IconListCheck,
  IconUpload,
  IconTimelineEventText,
  IconAffiliate,
  IconFilter,
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
import { useClickOutside, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ListEditorFormInput } from "@components/ListEditor";
// import { useDuckDB } from "pages/_app";
// import { saveToLocalDB } from "src/local_db";
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

export function useSearchFilters() {
  const { activeView, activeTask, action_input_form_values } = useAppStore();
  const search_action_input_form_values_key = `search_${activeView?.id}`;
  const search_action_input_form_values =
    action_input_form_values[`${search_action_input_form_values_key}`];
  let searchFilters = search_action_input_form_values;
  // const activateSection = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };
  return { searchFilters };
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
  RangeSlider: RangeSlider,
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

export function useFetchByState(state: any) {
  // const variables = state;
  const { runtimeConfig: config } = useAppStore();

  const { data, isLoading, error, isError, refetch } = useCustom({
    url: `${config?.API_URL}/route`,
    method: "post",
    config: {
      payload: {
        ...state,
      },
    },
    queryOptions: {
      queryKey: [
        `fetchByState_${JSON.stringify({
          id: state?.id,
          success_message_code:
            state?.success_message_code || `fetch_${state?.id}`,
        })}`,
      ],
      enabled: state?.enable_query || true,
    },
  });

  return { data, isLoading, error, isError, refetch };
}

// export function useReadByState(state: any) {
//   const {
//     runtimeConfig: config,
//     local_db,
//     setLocalDB,
//     updateLocalDB,
//     setDataFields,
//     activeView,
//   } = useAppStore();

//   const viewState = {
//     record: { id: activeView?.id },
//     read_record_mode: "remote",
//   };

//   let view_query_key = `readByState_${JSON.stringify({
//     id: viewState?.record?.id,
//     success_message_code: viewState?.record?.id || "record_read",
//   })}`;

//   const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
//   const queryClient = useQueryClient();
//   // const viewData = queryClient.getQueryData([view_query_key]);
//   const viewData = queryClient.getQueryData([view_query_key]) as {
//     data: any[];
//   };

//   const viewRecord = viewData?.data?.find(
//     (item: any) => item?.message?.code === activeView?.id
//   )?.data[0];

//   // State variables for LocalDB operation statuses
//   const [isLocalDBLoading, setIsLocalDBLoading] = useState(false);
//   const [isLocalDBSuccess, setIsLocalDBSuccess] = useState(false);
//   const [localDBError, setLocalDBError] = useState(null);

//   const { data, isLoading, error, isError, refetch } = useCustom({
//     url: `${config?.API_URL}/read`,
//     method: "post",
//     config: {
//       payload: { ...state },
//     },
//     queryOptions: {
//       queryKey: [
//         `readByState_${JSON.stringify({
//           success_message_code: state?.success_message_code,
//         })}`,
//       ],
//       onSuccess: async (fetchedData) => {
//         // console.log("Fetched data successfully:", fetchedData);
//         // table name is the success message code
//         let tableName = state.success_message_code;

//         // Extract data_items and data_fields from the fetched data
//         const dataRecord = fetchedData?.data?.find(
//           (item: any) => item?.message?.code === state.success_message_code
//         );

//         const data_items = dataRecord?.data || [];
//         const infered_data_fields = (dataRecord?.data_fields || []).map(
//           (field: any) => ({
//             ...field,
//           })
//         );

//         // console.log("useReadByState > viewRecord", viewRecord);
//         const data_fields = viewRecord?.fields || infered_data_fields || [];
//         console.log(
//           `${state?.success_message_code} / useReadByState > viewRecord data_fields`,
//           data_fields
//         );

//         // Save the data fields to the Zustand store
//         setDataFields(tableName, data_fields);

//         // Save to DuckDB local_db
//         if (data_items.length > 0 && data_fields.length > 0) {
//           setIsLocalDBLoading(true);
//           setLocalDBError(null);
//           setIsLocalDBSuccess(false);
//           // Update the state with functional updates
//           // setLocalDB((prevLocalDB) => ({
//           //   ...prevLocalDB,
//           //   [tableName]: {
//           //     isLocalDBLoading: true,
//           //     isLocalDBSuccess: false,
//           //     localDBError: null,
//           //   },
//           // }));
//           let item = {
//             isLocalDBLoading: true,
//             isLocalDBSuccess: false,
//             localDBError: null,
//           };
//           updateLocalDB(tableName, item);
//           // console.log("Local DB item init:", item);

//           try {
//             const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
//             await dbInstance.query(dropQuery);
//             await saveToLocalDB(data_items, tableName, data_fields, dbInstance);
//             console.log("Data saved to DuckDB successfully");
//             setIsLocalDBSuccess(true);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: true,
//               localDBError: null,
//             };
//             updateLocalDB(tableName, success_item);
//             // console.log(
//             //   `Local DB item success item: ${tableName}`,
//             //   success_item
//             // );
//             // setLocalDB(item);
//             // let success_merged = { ...local_db, ...success_item };
//             // console.log("Local DB item success item:", success_item);
//             // setLocalDB(local_db_item);
//             // console.log("Local DB item success:", tableName, local_db_item);
//             // success message code
//             // console.log("Data saved to Table:", tableName);
//             // console.log("Data saved to DuckDB:", data_items);
//             // console.log("Data fields:", data_fields);
//           } catch (error) {
//             console.error("Error saving data to DuckDB:", error);
//             setLocalDBError(error as any);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: error,
//             //   },
//             // });
//           } finally {
//             setIsLocalDBLoading(false);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: null,
//             //   },
//             // });
//           }
//         }
//       },
//       onError: (fetchError) => {
//         console.log("Error fetching data:", fetchError);
//       },
//     },
//   });

//   return {
//     data,
//     isLoading,
//     error,
//     isError,
//     refetch,
//     isLocalDBLoading,
//     isLocalDBSuccess,
//     localDBError,
//   };
// }

// export function useFetchExecutionData(state: any) {
//   const { runtimeConfig: config, updateLocalDB, setDataFields } = useAppStore();
//   const { view_record, ...rest } = state;

//   // const viewState = {
//   //   record: { id: state?.view_id },
//   //   read_record_mode: "remote",
//   // };

//   // let view_query_key = `readByState_${JSON.stringify({
//   //   id: viewState?.record?.id,
//   //   success_message_code: viewState?.record?.id || "record_read",
//   // })}`;

//   const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
//   // const queryClient = useQueryClient();
//   // // const viewData = queryClient.getQueryData([view_query_key]);
//   // const viewData = queryClient.getQueryData([view_query_key]) as {
//   //   data: any[];
//   // };

//   // const viewRecord = viewData?.data?.find(
//   //   (item: any) => item?.message?.code === state?.view_id
//   // )?.data[0];

//   // State variables for LocalDB operation statuses
//   const [isLocalDBLoading, setIsLocalDBLoading] = useState(false);
//   const [isLocalDBSuccess, setIsLocalDBSuccess] = useState(false);
//   const [localDBError, setLocalDBError] = useState(null);

//   const { data, isLoading, error, isError, refetch } = useCustom({
//     url: `${config?.API_URL}/execute?task_id=${state?.task.id}`,
//     method: "post",
//     config: {
//       payload: {
//         ...rest,
//       },
//     },
//     queryOptions: {
//       queryKey: [
//         `readByState_${JSON.stringify({
//           success_message_code: state?.success_message_code,
//         })}`,
//       ],
//       onSuccess: async (fetchedData) => {
//         console.log(
//           `Fetched data successfully: ${state?.success_message_code}`
//         );
//         // table name is the success message code
//         let tableName = state.success_message_code;

//         // Extract data_items and data_fields from the fetched data
//         const dataRecord = fetchedData?.data?.find(
//           (item: any) => item?.message?.code === state.success_message_code
//         );
//         console.log("dataRecord");
//         console.log(fetchedData);

//         const data_items = dataRecord?.data || [];
//         const infered_data_fields = (dataRecord?.data_fields || []).map(
//           (field: any) => ({
//             ...field,
//           })
//         );
//         console.log("data_items");
//         console.log(data_items);

//         // // console.log("useReadByState > viewRecord", viewRecord);
//         const data_fields = view_record?.fields || infered_data_fields || [];
//         // console.log(
//         //   `${state?.success_message_code} / useReadByState > viewRecord data_fields`,
//         //   data_fields
//         // );

//         // // Save the data fields to the Zustand store
//         setDataFields(tableName, data_fields);
//         // const data_items = [];
//         // const data_fields = [];

//         // Save to DuckDB local_db
//         if (data_items.length > 0 && data_fields.length > 0) {
//           // console.log("update local db here");
//           setIsLocalDBLoading(true);
//           setLocalDBError(null);
//           setIsLocalDBSuccess(false);
//           // Update the state with functional updates
//           // setLocalDB((prevLocalDB) => ({
//           //   ...prevLocalDB,
//           //   [tableName]: {
//           //     isLocalDBLoading: true,
//           //     isLocalDBSuccess: false,
//           //     localDBError: null,
//           //   },
//           // }));
//           let item = {
//             isLocalDBLoading: true,
//             isLocalDBSuccess: false,
//             localDBError: null,
//           };
//           updateLocalDB(tableName, item);

//           try {
//             // console.log("save to db here");
//             const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
//             await dbInstance.query(dropQuery);
//             await saveToLocalDB(data_items, tableName, data_fields, dbInstance);
//             console.log("Data saved to DuckDB successfully");
//             setIsLocalDBSuccess(true);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: true,
//               localDBError: null,
//             };
//             updateLocalDB(tableName, success_item);
//             console.log(
//               `Local DB item success item: ${tableName}`,
//               success_item
//             );
//             // setLocalDB(item);
//             // let success_merged = { ...local_db, ...success_item };
//             // console.log("Local DB item success item:", success_item);
//             // setLocalDB(local_db_item);
//             // console.log("Local DB item success:", tableName, local_db_item);
//             // success message code
//             // console.log("Data saved to Table:", tableName);
//             // console.log("Data saved to DuckDB:", data_items);
//             // console.log("Data fields:", data_fields);
//           } catch (error) {
//             console.error("Error saving data to DuckDB:", error);
//             setLocalDBError(error as any);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: false,
//               localDBError: JSON.stringify(error),
//             };
//             updateLocalDB(tableName, success_item);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: error,
//             //   },
//             // });
//           } finally {
//             setIsLocalDBLoading(false);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: false,
//               localDBError: null,
//             };
//             updateLocalDB(tableName, success_item);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: null,
//             //   },
//             // });
//           }
//         }
//       },
//       onError: (fetchError) => {
//         console.log("Error fetching data:", fetchError);
//       },
//     },
//   });

//   return {
//     data,
//     isLoading,
//     error,
//     isError,
//     refetch,
//     isLocalDBLoading,
//     isLocalDBSuccess,
//     localDBError,
//   };
// }

// export function useFetchData(state: any) {
//   const { runtimeConfig: config, updateLocalDB, setDataFields } = useAppStore();
//   const { view_record, ...rest } = state;

//   // const viewState = {
//   //   record: { id: state?.view_id },
//   //   read_record_mode: "remote",
//   // };

//   // let view_query_key = `readByState_${JSON.stringify({
//   //   id: viewState?.record?.id,
//   //   success_message_code: viewState?.record?.id || "record_read",
//   // })}`;

//   const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
//   // const queryClient = useQueryClient();
//   // // const viewData = queryClient.getQueryData([view_query_key]);
//   // const viewData = queryClient.getQueryData([view_query_key]) as {
//   //   data: any[];
//   // };

//   // const viewRecord = viewData?.data?.find(
//   //   (item: any) => item?.message?.code === state?.view_id
//   // )?.data[0];

//   // State variables for LocalDB operation statuses
//   const [isLocalDBLoading, setIsLocalDBLoading] = useState(false);
//   const [isLocalDBSuccess, setIsLocalDBSuccess] = useState(false);
//   const [localDBError, setLocalDBError] = useState(null);

//   const { data, isLoading, error, isError, refetch } = useCustom({
//     url: `${config?.API_URL}/route`,
//     method: "post",
//     config: {
//       payload: {
//         ...rest,
//       },
//     },
//     queryOptions: {
//       queryKey: [
//         `useFetchData_${JSON.stringify({
//           success_message_code: state?.success_message_code,
//         })}`,
//       ],
//       onSuccess: async (fetchedData) => {
//         console.log(
//           `Fetched data successfully: ${state?.success_message_code}`
//         );
//         // table name is the success message code
//         let tableName = state.success_message_code;

//         // Extract data_items and data_fields from the fetched data
//         const dataRecord = fetchedData?.data?.find(
//           (item: any) => item?.message?.code === state.success_message_code
//         );
//         console.log("dataRecord");
//         console.log(fetchedData);

//         const data_items = dataRecord?.data || [];
//         const infered_data_fields = (dataRecord?.data_fields || []).map(
//           (field: any) => ({
//             ...field,
//           })
//         );
//         console.log("data_items");
//         console.log(data_items);

//         // console.log(`view_record: ${view_record}`);

//         // // console.log("useReadByState > viewRecord", viewRecord);
//         const data_fields = view_record?.fields || infered_data_fields || [];
//         // console.log(
//         //   `${state?.success_message_code} / useReadByState > viewRecord data_fields`,
//         //   data_fields
//         // );

//         // // Save the data fields to the Zustand store
//         setDataFields(tableName, data_fields);
//         // const data_items = [];
//         // const data_fields = [];
//         // if (data_items.length == 0) {
//         //   console.log("data_items.length == 0");
//         //   console.log(data_fields);
//         // }

//         // Save to DuckDB local_db
//         if (data_items.length >= 0 && data_fields.length > 0) {
//           // console.log("update local db here");
//           setIsLocalDBLoading(true);
//           setLocalDBError(null);
//           setIsLocalDBSuccess(false);
//           // Update the state with functional updates
//           // setLocalDB((prevLocalDB) => ({
//           //   ...prevLocalDB,
//           //   [tableName]: {
//           //     isLocalDBLoading: true,
//           //     isLocalDBSuccess: false,
//           //     localDBError: null,
//           //   },
//           // }));
//           let item = {
//             isLocalDBLoading: true,
//             isLocalDBSuccess: false,
//             localDBError: null,
//           };
//           updateLocalDB(tableName, item);

//           try {
//             // console.log("save to db here");
//             const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
//             await dbInstance.query(dropQuery);
//             await saveToLocalDB(data_items, tableName, data_fields, dbInstance);
//             console.log("Data saved to DuckDB successfully");
//             setIsLocalDBSuccess(true);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: true,
//               localDBError: null,
//             };
//             updateLocalDB(tableName, success_item);
//             console.log(
//               `Local DB item success item: ${tableName}`,
//               success_item
//             );
//             // setLocalDB(item);
//             // let success_merged = { ...local_db, ...success_item };
//             // console.log("Local DB item success item:", success_item);
//             // setLocalDB(local_db_item);
//             // console.log("Local DB item success:", tableName, local_db_item);
//             // success message code
//             // console.log("Data saved to Table:", tableName);
//             // console.log("Data saved to DuckDB:", data_items);
//             // console.log("Data fields:", data_fields);
//           } catch (error) {
//             console.error("Error saving data to DuckDB:", error);
//             setLocalDBError(error as any);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: false,
//               localDBError: JSON.stringify(error),
//             };
//             updateLocalDB(tableName, success_item);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: error,
//             //   },
//             // });
//           } finally {
//             setIsLocalDBLoading(false);
//             let success_item = {
//               isLocalDBLoading: false,
//               isLocalDBSuccess: false,
//               localDBError: null,
//             };
//             updateLocalDB(tableName, success_item);
//             // setLocalDB({
//             //   ...local_db,
//             //   [tableName]: {
//             //     isLocalDBLoading: false,
//             //     isLocalDBSuccess: false,
//             //     localDBError: null,
//             //   },
//             // });
//           }
//         }
//       },
//       onError: (fetchError) => {
//         console.log("Error fetching data:", fetchError);
//       },
//     },
//   });

//   return {
//     data,
//     isLoading,
//     error,
//     isError,
//     refetch,
//     isLocalDBLoading,
//     isLocalDBSuccess,
//     localDBError,
//   };
// }

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
            action_step_query: `SELECT *, data_model.* FROM ${state?.record?.id}`,
            success_message_code: state?.success_message_code || "read_record",
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [
        `readByState_${JSON.stringify({
          id: state?.record?.id,
          success_message_code: state?.success_message_code || "read_record",
        })}`,
      ],
      enabled: state?.enable_query || true,
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
      queryKey: [`useFetchQueryDataByState_${JSON.stringify(rest)}`],
    },
  });

  return { data, isLoading, error, isError };
}

export function useRunTask(state: any) {
  const { runtimeConfig: config } = useAppStore();
  // pop out frequently changing search_term or other part of state i don't want to trigger a new fetch/use in queryKey
  // const { search_term, ...rest } = state;

  const { data, isLoading, error, isError } = useCustom({
    url: `${config?.API_URL}/run-task`,
    method: "post",
    config: {
      payload: {
        ...state,
      },
    },
    queryOptions: {
      queryKey: [`useRunTask_${JSON.stringify(state)}`],
    },
  });

  return { data, isLoading, error, isError };
}

// export function useListItems(state: any) {
//   const { runtimeConfig: config } = useAppStore();
//   // pop out frequently changing search_term or other part of state i don't want to trigger a new fetch/use in queryKey
//   const { search_term, ...rest } = state;

//   const { data, isLoading, error, isError } = useCustom({
//     url: `${config?.API_URL}/execute-query`,
//     method: "post",
//     config: {
//       payload: {
//         task_variables: {},
//         global_variables: {},
//         include_action_steps: [1],
//         action_steps: [
//           {
//             id: "1",
//             execution_order: 1,
//             description: "query data",
//             name: "query data",
//             job: "query data",
//             action_step_query: `SELECT * FROM fn::execute_query('${
//               state?.query_name
//             }', '${JSON.stringify(state)}')`,
//             method: "get",
//             type: "main",
//             credential: "surrealdb catchmytask dev",
//             success_message_code:
//               state?.success_message_code ?? "query_success_results",
//             select: {
//               query: `SELECT * FROM fn::execute_query('${
//                 state?.query_name
//               }', '${JSON.stringify(state)}')`,
//               credential: "surrealdb catchmytask dev",
//             },
//           },
//         ],
//       },
//     },
//     queryOptions: {
//       queryKey: [`useFetchQueryDataByState_${JSON.stringify(state)}`],
//     },
//   });

//   return { data, isLoading, error, isError };
// }

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

// export function useNavigation() {
//   const { activeApplication, activeSession, activeTask } = useAppStore();
//   const go = useGo();

//   const navigate = (
//     record: any
//     // sessionId: string,
//     // sessions: { id: string; name: string }[]
//   ) => {
//     // const selectedSession = sessions.find(
//     //   (session) => session.id === sessionId
//     // );

//     // console.log(`Navigating to session: ${sessionId}`);
//     // console.log(`Selected session: ${selectedSession}`);
//     // console.log(sessions);

//     if (record?.entity_type === "tasks") {
//       // setActiveSession(selectedSession);
//       go({
//         to: {
//           resource: "tasks",
//           action: "show",
//           id: record.id,
//           meta: {
//             applicationId: activeApplication?.id,
//             sessionId: activeSession?.id,
//             taskId: record.id,
//           },
//         },
//         query: {
//           applicationId: activeApplication?.id,
//           sessionId: activeSession?.id,
//         },
//         // type: "push",
//       });
//     }
//   };

//   return navigate;
// }

// export function useNavigation() {
//   const { activeApplication, activeSession, activeTask } = useAppStore();
//   const go = useGo();

//   const navigate = (record: any) => {
//     if (record?.entity_type === "tasks") {
//       // Construct the target URL given the passed record
//       const targetUrl = record?.id
//         ? `/tasks/show/${record.id}?applicationId=${activeApplication?.id}&sessionId=${activeSession?.id}`
//         : "/home";

//       // Check if the current URL is the same as the target URL
//       if (
//         window.location.pathname + window.location.search !== targetUrl &&
//         record?.id
//       ) {
//         go({
//           to: {
//             resource: "tasks",
//             action: "show",
//             id: record.id,
//             meta: {
//               applicationId: activeApplication?.id,
//               sessionId: activeSession?.id,
//               taskId: record.id,
//             },
//           },
//           query: {
//             applicationId: activeApplication?.id,
//             sessionId: activeSession?.id,
//           },
//         });
//       } else if (
//         window.location.pathname + window.location.search !== targetUrl &&
//         !record?.id
//       ) {
//         go({
//           to: {
//             resource: "home",
//             action: "list",
//             // id: record.id,
//             // meta: {
//             //   applicationId: activeApplication?.id,
//             //   sessionId: activeSession?.id,
//             //   taskId: record.id,
//             // },
//           },
//           // query: {
//           //   applicationId: activeApplication?.id,
//           //   sessionId: activeSession?.id,
//           // },
//         });
//       } else {
//         console.log("You are already on this page");
//       }
//     }
//   };

//   return navigate;
// }

// export function useNavigation() {
//   const { activeApplication, activeSession, activeTask } = useAppStore();
//   const go = useGo();
//   const { push } = useNavigationRefine();

//   const navigate = (record: any) => {
//     let targetUrl = record?.id
//       ? `/tasks/show/${record.id}?applicationId=${activeApplication?.id}&sessionId=${activeSession?.id}`
//       : "/home";

//     if (
//       window.location.pathname + window.location.search !== targetUrl &&
//       !record?.id
//     ) {
//       go({
//         to: {
//           resource: "home",
//           action: "list",
//         },
//       });
//     } else if (
//       window.location.pathname + window.location.search !== targetUrl &&
//       record?.id &&
//       record?.entity_type === "tasks"
//     ) {
//       go({
//         to: {
//           resource: "tasks",
//           action: "show",
//           id: record.id,
//           meta: {
//             applicationId: activeApplication?.id,
//             sessionId: activeSession?.id,
//             taskId: record.id,
//           },
//         },
//         query: {
//           applicationId: activeApplication?.id,
//           sessionId: activeSession?.id,
//         },
//       });
//     } else if (record?.entity_type === "views") {
//       // get the current path and append path query viewId to it
//       // let currentPath = window.location.pathname;
//       // let currentSearch = window.location.search;
//       // let currentHash = window.location.hash;
//       // let currentUrl = `${currentPath}${currentSearch}${currentHash}`;
//       // let newUrl = `${currentUrl}?viewId=${record.id}`;
//       // console.log("currentUrl", currentUrl);
//       // Retrieve the current search parameters
//       const searchParams = new URLSearchParams(location.search);

//       // Add or update the 'patch' parameter
//       searchParams.set("viewId", record?.id);

//       // Construct the new URL with the patch parameter
//       // const newUrl = `${location.pathname}?${searchParams}`;
//       // console.log("newUrl", newUrl);

//       // Use push to update the browser's URL
//       // push("/home");
//     } else {
//       console.log("You are already on this page");
//     }
//   };

//   return navigate;
// }

export function useNavigation() {
  const go = useGo();
  const { push } = useNavigationRefine();

  // Use selectors to get the latest state
  // const activeApplication = useAppStore(state => state.activeApplication);
  // const activeSession = useAppStore(state => state.activeSession);
  // const activeTask = useAppStore(state => state.activeTask);
  // const activeView = useAppStore(state => state.activeView);

  const navigate = useCallback(
    (navigateOnSelect: NavigateOnSelect) => {
      // Get the current state at the time of navigation
      const state = useAppStore.getState();
      const { activeApplication, activeSession, activeTask, activeView } =
        state;

      // These will always have the latest values
      const resourceRecordMap = {
        tasks: activeTask,
        views: activeView,
        sessions: activeSession,
        applications: activeApplication,
        home: activeApplication,
      };

      console.log("navigateOnSelect", navigateOnSelect);
      let resourceRecord = resourceRecordMap[navigateOnSelect?.resource];
      console.log("resourceRecord", resourceRecord);
      if (activeTask) {
        go({
          to: {
            resource: navigateOnSelect?.resource,
            action: "show",
            id: activeTask?.id,
            meta: {
              applicationId: activeApplication?.id,
              sessionId: activeSession?.id,
              taskId: activeTask?.id,
              ...(activeView && { viewId: activeView?.id }),
            },
          },
          query: {
            applicationId: activeApplication?.id,
            sessionId: activeSession?.id,
            ...(activeView && { viewId: activeView?.id }),
          },
        });
      } else {
        go({
          to: {
            resource: "home",
            action: "list",
          },
        });
      }
    },
    [go]
  );

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
  const properties = model?.schema?.properties;

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
    selectedActionSteps?.map((action: any) => action?.success_message_code)
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
  activity: IconTimelineEventText,
  issues: IconSquare,
  state: IconStackBack,
  execution: IconListDetails,
  run: IconListCheck,
  delete: IconTrash,
  close: IconCopyCheck,
  bulk_update: IconForms,
  assign: IconUserPlus,
  view: IconEye,
  upload: IconUpload,
  view_modes: IconEye,
  code: IconCode,
  input: IconForms,
  thinking: IconAffiliate,
  reasoning: IconAffiliate,
  filters: IconFilter,
  copy: IconCopy,
  dublicate: IconCopy,
};

// export const useDuckDBSchema = () => {
//   const [tables, setTables] = useState([]);
//   const dbInstance = useDuckDB();

//   useEffect(() => {
//     const fetchSchema = async () => {
//       try {
//         const result = await dbInstance.query(`
//           SELECT table_name, column_name
//           FROM information_schema.columns
//         `);
//         const schemaData = result.toArray();
//         const groupedTables = schemaData.reduce((acc: any, row: any) => {
//           if (!acc[row.table_name]) {
//             acc[row.table_name] = [];
//           }
//           acc[row.table_name].push(row.column_name);
//           return acc;
//         }, {});
//         setTables(groupedTables);
//       } catch (error) {
//         console.error("Error fetching schema from DuckDB:", error);
//       }
//     };

//     fetchSchema();
//   }, [dbInstance]);

//   return tables;
// };

export function createIssueIdSubquery(subquery: string): string {
  // Extract the FROM clause and optional WHERE clause from the subquery
  const fromClauseMatch = subquery.match(/FROM\s+[\w.]+(\s+WHERE\s+.*)?/i);

  if (!fromClauseMatch) {
    // throw new Error("Invalid subquery: FROM clause not found.");
    return "";
  }

  // Extract the FROM and WHERE clauses
  const fromClause = fromClauseMatch[0];

  // Dynamically create the subquery with issue_id
  const issueIdSubquery = `SELECT issue_id ${fromClause}`;

  return issueIdSubquery.trim();
}

export const useIsMobile = () => {
  return useMediaQuery("(max-width: 1024px)");
};

// Utility function to get the tooltip label
export const getTooltipLabel = (item: {
  entity_type?: string;
  title?: string;
  name?: string;
  id?: string;
}) => {
  const entityType = item?.entity_type ? item.entity_type : "";
  const name =
    item?.title || item?.name || item?.id || (!item?.entity_type ? "item" : "");

  // If entity type exists, show it with colon and name
  return `Click to see ${entityType}${
    entityType && name ? ": " : ""
  }${name} details or expand to update`;
};

export const getLabel = (item: {
  title?: string;
  name?: string;
  id?: string;
}) => {
  // Return title, name, or id, and fallback to 'item' if none are present
  return item?.title || item?.name || item?.id || "item";
};

export const useUpdateComponentAction = () => {
  const {
    focused_entities,
    setFocusedEntities,
    pinned_main_action,
    setPinnedMainAction,
    activeLayout,
    setActiveLayout,
  } = useAppStore();

  // handle toggleDisplay
  const openDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

  const updateComponentAction = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };

      if (!new_focused_entities[record?.id]) {
        new_focused_entities[record?.id] = {};
      }

      if (new_focused_entities[record?.id].action === action) {
        new_focused_entities[record?.id].action = null;
      } else {
        new_focused_entities[record?.id].action = action;
      }
      setFocusedEntities(new_focused_entities);
    }

    if (["search", "save"].includes(action)) {
      openDisplay("leftSection");

      if (pinned_main_action === action) {
        setPinnedMainAction(null);
      } else {
        setPinnedMainAction(action);
      }
    }
  };

  return { updateComponentAction };
};

export const useBulkActionSelect = () => {
  const {
    focused_entities,
    setFocusedEntities,
    activeLayout,
    setActiveLayout,
  } = useAppStore();

  const bulkActionSelect = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // handle toggleDisplay
    const openDisplay = (section: string) => {
      if (activeLayout) {
        const newLayout = { ...activeLayout };
        newLayout[section].isDisplayed = true;
        setActiveLayout(newLayout);
      }
    };

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };

      if (!new_focused_entities[record?.id]) {
        new_focused_entities[record?.id] = {};
      }

      if (new_focused_entities[record?.id].action === action) {
        new_focused_entities[record?.id].action = null;
      } else {
        new_focused_entities[record?.id].action = action;
      }
      setFocusedEntities(new_focused_entities);
    }

    openDisplay("rightSection");
  };

  return { bulkActionSelect };
};

export const serializeBigInt = (obj: any) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

// Type mapping between field types and DuckDB-compatible types
export const cellTemplateMap = {
  integer: "number",
  unsigned_integer: "text",
  float: "number",
  complex: "text",
  string: "text",
  boolean: "text",
  datetime: "date",
  timedelta: "text",
  category: "text",
  sparse: "text",
  period: "text",
  interval: "text",
  mixed: "text",
  unknown: "text",
};

// create a type for cellTemplateKeys

export function getExcelJSStyleFromClass(className: string) {
  switch (className) {
    case "bg-green-500":
      return { backgroundColor: "#4CAF50", color: "#FFFFFF" };
    case "bg-red-500":
      return { backgroundColor: "#FF0000", color: "#FFFFFF" };
    case "bg-gray-500":
      return { backgroundColor: "#9E9E9E", color: "#FFFFFF" };
    case "bg-orange-500":
      return { backgroundColor: "#FFA500", color: "#000000" };
    default:
      return { backgroundColor: "#FFFFFF", color: "#000000" };
  }
}

/**
 * Converts CSS properties into the format ReactGrid expects for CellStyle.
 * @param className - CSS class name to map to CellStyle.
 * @returns A CellStyle object.
 */
export function getReactGridCellStyle(className: string): CellStyle {
  switch (className) {
    case "bg-green-500":
      return {
        background: "#4CAF50",
        color: "#FFFFFF",
      };
    case "bg-red-500":
      return {
        background: "#FF0000",
        color: "#FFFFFF",
      };
    case "bg-gray-500":
      return {
        background: "#9E9E9E",
        color: "#FFFFFF",
      };
    case "bg-orange-500":
      return {
        background: "#FFA500",
        color: "#000000",
      };
    default:
      return {
        background: "#FFFFFF",
        color: "#000000",
      };
  }
}

// export function useActionStepsData(action_steps: any[]) {
//   const { activeTask, activeApplication, activeSession } = useAppStore();
//   const dbInstance = useDuckDB(); // Get DuckDB instance from context

//   const [dataItems, setDataItems] = useState<[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (action_steps?.length > 0) {
//       fetchAndJoinActionSteps();
//     }

//     async function fetchAndJoinActionSteps() {
//       try {
//         await Promise.all(
//           action_steps.map(async (step) => {
//             const state = {
//               success_message_code: step.success_message_code,
//               id: step.id,
//               action_steps: [step],
//               application: {
//                 id: activeApplication?.id,
//                 name: activeApplication?.name,
//               },
//               session: {
//                 id: activeSession?.id,
//                 name: activeSession?.name,
//               },
//               task: { id: activeTask?.id, name: activeTask?.name },
//               input_values: {},
//               include_action_steps: [step.execution_order || 0],
//             };

//             const { isLocalDBSuccess } = useReadByState(state);
//             if (!isLocalDBSuccess) {
//               throw new Error(`Failed to load data for step ${step.id}`);
//             }
//           })
//         );

//         // Execute the dynamic join once all steps are processed
//         await executeDynamicOuterJoin();
//       } catch (error) {
//         console.error("Error fetching and joining action steps:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     async function executeDynamicOuterJoin() {
//       try {
//         const joinClauses = action_steps
//           .map((step) => `step_${step.id}`)
//           .join(" FULL OUTER JOIN ");

//         const query = `
//           SELECT *
//           FROM ${joinClauses} USING (issue_id);
//         `;

//         console.log("Executing dynamic outer join query:", query);
//         const result = await dbInstance.query(query);
//         setDataItems(result.toArray());
//       } catch (error) {
//         console.error("Error executing dynamic join query:", error);
//       }
//     }
//   }, [action_steps, dbInstance, activeTask, activeApplication, activeSession]);

//   return { dataItems, isLoading };
// }

// export function generateTableAlias(tableName: string): string {
//   const parts = tableName.split("_");
//   if (parts.length === 1) {
//     return tableName.slice(0, 2); // First two letters if it's a single word
//   }
//   return parts.map((part) => part[0]).join(""); // First letter of each word
// }

export function generateTableAlias(tableName: string): string {
  const parts = tableName.split("_");

  // If the table name is one word, use it as the alias directly
  if (parts.length === 1) {
    return tableName;
  }

  // If the table name contains underscores, use the first letter of each word
  return parts.map((part) => part[0]).join("");
}

export function aliasDataFields(
  fields: any[],
  alias: string
): { name: string; data_type: string }[] {
  return fields.map((field) => ({
    name: `${alias}_${field.name}`, // Add alias prefix to the field name
    data_type: field.data_type,
  }));
}

/**
 * Returns the preferred column from the fields: title > name > id.
 */
export const getPreferredColumn = (fields: any[]) => {
  const preferredOrder = ["title", "name", "id"];
  for (const column of preferredOrder) {
    if (fields.some((field: any) => field.name === column)) {
      return column;
    }
  }
  // Fallback to 'id' if none of the preferred columns exist
  return "id";
};

export interface FieldMetadata {
  originalField: string;
  alias: string;
  successMessageCode: string;
  relationType: string;
}

export function getQueryFieldMetadata(
  action_steps: any[],
  dataFields: any
): FieldMetadata[] {
  return action_steps.flatMap((step) => {
    const alias = generateTableAlias(step.success_message_code);
    const fields = dataFields[step.success_message_code] || [];

    const relationType =
      step.primary_step_relation?.cardinality || "one-to-one";

    if (relationType === "one-to-many") {
      const preferredColumn = getPreferredColumn(fields);

      // Annotate one-to-many fields with count and preferred column
      return [
        {
          originalField: "id",
          alias: `${alias}_${step.success_message_code}_count`,
          successMessageCode: step.success_message_code,
          relationType: "one-to-many",
        },
        {
          originalField: preferredColumn,
          alias: `${alias}_${preferredColumn}`,
          successMessageCode: step.success_message_code,
          relationType: "one-to-many",
        },
      ];
    } else {
      // Annotate one-to-one fields
      return fields.map((field: any) => ({
        originalField: field.name,
        alias: `${alias}_${field.name}`,
        successMessageCode: step.success_message_code,
        relationType: "one-to-one",
      }));
    }
  });
}

export function filterDataFieldsForDisplay(
  action_steps: any[],
  dataFields: any,
  fieldMetadataList: FieldMetadata[]
) {
  const validAliases = new Set(fieldMetadataList.map((meta) => meta.alias));

  return action_steps.flatMap((step) => {
    const stepFields = dataFields[step.success_message_code] || [];
    const alias = generateTableAlias(step.success_message_code);

    return stepFields.filter((field: any) =>
      validAliases.has(`${alias}_${field.name}`)
    );
  });
}

export const concatenateAliasedDataFields = (
  fieldMetadataList: FieldMetadata[],
  action_steps: any[],
  dataFields: Record<string, any[]>
) => {
  const validAliases = new Set(fieldMetadataList.map((meta) => meta.alias));

  return action_steps.flatMap((step) => {
    const alias = generateTableAlias(step.success_message_code);
    const fields = dataFields[step.success_message_code] || [];

    return fields
      .filter((field: any) => validAliases.has(`${alias}_${field.name}`))
      .map((field: any) => ({
        ...field,
        alias: `${alias}_${field.name}`,
        original: field?.name,
        name: `${alias}_${field.name}`,
        step: step.success_message_code,
      }));
  });
};

// Define all possible operators
type ComparisonOperator =
  | "="
  | "!="
  | "<>" // equality
  | ">"
  | "<"
  | ">="
  | "<=" // comparison
  | "BETWEEN" // range
  | "LIKE"
  | "ILIKE"
  | "NOT LIKE"
  | "NOT ILIKE" // pattern matching
  | "SIMILAR TO"
  | "NOT SIMILAR TO" // regex-like
  | "GLOB" // file pattern matching
  | "IS NULL"
  | "IS NOT NULL" // null checking
  | "IS DISTINCT FROM"
  | "IS NOT DISTINCT FROM"; // null-aware equality

interface Filter {
  name: string;
  operator: ComparisonOperator;
  value?: any;
  secondValue?: any; // for BETWEEN operator
}

interface PatternConfig {
  type: "exact" | "contains" | "startsWith" | "endsWith" | "custom";
  caseSensitive?: boolean;
  customPattern?: (value: string) => string;
}

export function enrichFilters(
  filters: Filter[],
  dataObject: any,
  patternConfigs: Record<string, PatternConfig> = {}
) {
  return filters?.map((filter: Filter) => {
    let enrichedFilter = { ...filter };
    let value = dataObject?.[filter.name];
    let secondValue = dataObject?.[`${filter.name}`]?.[1];
    // console.log("filter");
    // console.log(filter);

    // Handle different types of operators
    switch (filter.operator) {
      // Pattern matching operators
      case "LIKE":
      case "ILIKE":
      case "NOT LIKE":
      case "NOT ILIKE": {
        if (value) {
          const config = patternConfigs[filter.name] || {
            type: "contains",
            caseSensitive: false,
          };
          value = formatPatternValue(value, config);
        }
        break;
      }

      // BETWEEN operator
      case "BETWEEN": {
        // console.log("between");
        // console.log(value);
        value = dataObject?.[`${filter.name}`]?.[0];
        // enrichedFilter.value = "80";
        secondValue = dataObject?.[`${filter.name}`]?.[1];
        break;
      }

      // GLOB operator
      case "GLOB": {
        if (value) {
          // Handle file pattern matching
          value = formatGlobPattern(value);
        }
        break;
      }

      // NULL checking operators don't need value transformation
      case "IS NULL":
      case "IS NOT NULL":
        value = null;
        break;

      // SIMILAR TO operators (regex-like)
      case "SIMILAR TO":
      case "NOT SIMILAR TO": {
        if (value) {
          value = formatSimilarToPattern(value);
        }
        break;
      }

      // Default case handles simple comparison operators
      default:
        // No transformation needed for =, !=, >, <, >=, <=
        // enrichedFilter.value = value;
        break;
    }
    if (value) {
      enrichedFilter.value = value;
    } else {
      const { value: _, ...rest } = enrichedFilter;
      enrichedFilter = rest;
    }

    if (secondValue) {
      enrichedFilter.secondValue = secondValue;
    } else {
      const { secondValue: _, ...rest } = enrichedFilter;
      enrichedFilter = rest;
    }

    return enrichedFilter;
  });
}

function formatPatternValue(value: string, config: PatternConfig): string {
  if (config.type === "custom" && config.customPattern) {
    return config.customPattern(value);
  }

  switch (config.type) {
    case "contains":
      return `%${value}%`;
    case "startsWith":
      return `${value}%`;
    case "endsWith":
      return `%${value}`;
    case "exact":
      return value;
    default:
      return `%${value}%`;
  }
}

function formatGlobPattern(value: string): string {
  // Convert SQL LIKE patterns to GLOB patterns
  return value.replace(/%/g, "*").replace(/_/g, "?");
}

function formatSimilarToPattern(value: string): string {
  // Escape special regex characters and convert to SIMILAR TO pattern
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const isEmptyOrNull = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  return false;
};

// export const formatSQLIdentifier = (str: string): string => {
//   if (!str) return '""';
//   return `"${str.replace(/"/g, '""')}"`;
// };

// export const formatDateValue = (value: any): string => {
//   try {
//     const date = new Date(value);
//     if (isNaN(date.getTime())) {
//       throw new Error("Invalid date");
//     }
//     return `DATE '${date.toISOString().split("T")[0]}'`;
//   } catch (error) {
//     throw new Error(`Invalid date value: ${value}`);
//   }
// };

// export const formatNumberValue = (value: any): string => {
//   const num = Number(value);
//   if (isNaN(num)) {
//     throw new Error(`Invalid number value: ${value}`);
//   }
//   return num.toString();
// };

// export const formatBooleanValue = (value: any): string => {
//   return Boolean(value) ? "TRUE" : "FALSE";
// };

// export const formatStringValue = (value: string): string => {
//   return `'${value.toString().replace(/'/g, "''")}'`;
// };

export const guessValueType = (value: any): SQLValueType => {
  if (value === null || value === undefined) return "string";
  if (value instanceof Date) return "date";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";

  const dateStr = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return "date";
    } catch (e) {}
  }

  return "string";
};

export const sanitizeFilters = (filters: any[]): SQLFilter[] => {
  return filters
    ?.filter(
      (filter) => filter && typeof filter.name === "string" && filter.operator
    )
    ?.map((filter) => ({
      name: filter.name.trim(),
      operator: filter.operator.trim(),
      value: filter.value,
      secondValue: filter.secondValue,
      type: filter.type || guessValueType(filter.value),
    }));
};

// const formatSQLValue = (value: any, type?: string): string => {
//   switch (type?.toLowerCase()) {
//     case "date":
//       return formatDateValue(value);
//     case "number":
//       return formatNumberValue(value);
//     case "boolean":
//       return formatBooleanValue(value);
//     default:
//       return formatStringValue(value);
//   }
// };

export const formatSQLIdentifier = (str: string): string => {
  if (!str) return '""';
  return `"${str.replace(/"/g, '""')}"`;
};

export const formatDateValue = (value: any): string => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return `DATE '${date.toISOString().split("T")[0]}'`;
  } catch (error) {
    throw new Error(`Invalid date value: ${value}`);
  }
};

export const formatNumberValue = (value: any): string => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number value: ${value}`);
  }
  return num.toString();
};

export const formatBooleanValue = (value: any): string => {
  return Boolean(value) ? "TRUE" : "FALSE";
};

export const formatStringValue = (value: string): string => {
  return `'${value.toString().replace(/'/g, "''")}'`;
};

export const formatSQLValue = (value: any, type?: string): string => {
  if (value === null || value === undefined) {
    return "NULL";
  }

  switch (type?.toLowerCase()) {
    case "date":
      return formatDateValue(value);
    case "number":
      return formatNumberValue(value);
    case "boolean":
      return formatBooleanValue(value);
    default:
      return formatStringValue(value);
  }
};

// const buildComparisonClause = (
//   filter: SQLFilter,
//   options: SQLTemplateOptions
// ): string | null => {
//   if (isEmptyOrNull(filter.value)) {
//     return null;
//   }

//   const column = formatSQLIdentifier(filter.name);

//   if (filter.operator.toUpperCase() === "LIKE") {
//     const value = formatSQLValue(filter.value, "string");
//     return options.caseSensitive
//       ? `${column} LIKE ${value}`
//       : `LOWER(${column}) LIKE LOWER(${value})`;
//   }

//   const value = formatSQLValue(filter.value, filter.type);
//   return `${column} ${filter.operator} ${value}`;
// };

const buildComparisonClause = (
  filter: SQLFilter,
  options: SQLTemplateOptions
): string | null => {
  const column = formatSQLIdentifier(filter.name);

  // Special handling for NULL operators
  if (filter.operator === "IS NULL" || filter.operator === "IS NOT NULL") {
    return `${column} ${filter.operator}`;
  }

  // Return null if no value is provided (except for NULL operators)
  if (filter.value === null || filter.value === undefined) {
    return null;
  }

  // Handle BETWEEN operator
  if (filter.operator === "BETWEEN") {
    if (filter.secondValue === null || filter.secondValue === undefined) {
      return null;
    }
    const value1 = formatSQLValue(filter.value, filter.type);
    const value2 = formatSQLValue(filter.secondValue, filter.type);
    return `${column} BETWEEN ${value1} AND ${value2}`;
  }

  // Handle LIKE operators
  if (["LIKE", "ILIKE", "NOT LIKE", "NOT ILIKE"].includes(filter.operator)) {
    const value = formatSQLValue(filter.value, "string");
    return options.caseSensitive
      ? `${column} ${filter.operator} ${value}`
      : `LOWER(${column}) ${filter.operator} LOWER(${value})`;
  }

  // Handle all other operators
  const value = formatSQLValue(filter.value, filter.type);
  return `${column} ${filter.operator} ${value}`;
};

const buildWhereClause = (
  filters: SQLFilter[],
  options: SQLTemplateOptions
): string => {
  if (!filters || filters.length === 0) {
    return "";
  }

  const conditions = filters
    .filter((filter) => filter.name && filter.operator)
    .map((filter) => {
      try {
        return buildComparisonClause(filter, options);
      } catch (error) {
        console.warn(`Skipping invalid filter: ${JSON.stringify(error)}`);
        return null;
      }
    })
    .filter((condition): condition is string => condition !== null)
    .join(" AND ");

  return conditions ? `WHERE ${conditions}` : "";
};

export const buildSQLQuery = (
  sqlTemplate: string,
  filters: SQLFilter[],
  options: SQLTemplateOptions = { caseSensitive: true }
): QueryResult => {
  try {
    const whereClause = buildWhereClause(filters, options);

    const query = sqlTemplate.toLowerCase().includes("where")
      ? sqlTemplate.replace("{{filters}}", whereClause.replace("WHERE", "AND"))
      : sqlTemplate.replace("{{filters}}", whereClause);

    return { query };
  } catch (error) {
    return {
      query: sqlTemplate,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const formatRatio = (num: any, total: any) => `${num}/${total}`;

export const formatPercentage = (num: any, total: any) =>
  `${((num / total) * 100).toFixed(1)}%`;

// types/reconciliation.ts

// Base Types
export interface BaseStats {
  total: number;
  matches: number;
  mismatches: number;
  missing: number;
}

export interface BaseBreakdown {
  match: number;
}

// Breakdown Types
// export interface StandardBreakdown extends BaseBreakdown {
//   mismatch: number;
//   missing: number;
// }

// First, let's update our types to include the cancelled_succeeded status
interface StandardBreakdown {
  match: number;
  mismatch: number;
  missing: number;
  cancelled_succeeded?: number; // Add this to handle cancelled but succeeded payments
}

export interface PaymentBreakdown extends BaseBreakdown {
  high_negative_difference: number;
  low_negative_difference: number;
  low_positive_difference: number;
  high_positive_difference: number;
}

// Stats Types
export interface BaseStatsWithBreakdown<T extends BaseBreakdown>
  extends BaseStats {
  breakdown: T;
}

export interface PaymentStats extends BaseStatsWithBreakdown<PaymentBreakdown> {
  totalExpectedAmount: number;
  totalCapturedAmount: number;
}

export interface StandardStats
  extends BaseStatsWithBreakdown<StandardBreakdown> {}

// Supplier Entry Types
export interface BaseSupplierEntry {
  name: string;
  matches: number;
  total: number;
  missing: number;
}

export interface SupplierEntryWithBreakdown<T extends BaseBreakdown>
  extends BaseSupplierEntry {
  breakdown: T;
}

export interface PaymentSupplierEntry
  extends SupplierEntryWithBreakdown<PaymentBreakdown> {
  totalExpectedAmount: number;
  totalCapturedAmount: number;
}

// Matrix Types
export interface BaseTotals {
  matches: number;
  total: number;
  missing: number;
}

export interface TotalsWithBreakdown<T extends BaseBreakdown>
  extends BaseTotals {
  breakdown: T;
}

export interface BaseMatrix<S extends BaseSupplierEntry, T extends BaseTotals> {
  suppliers: S[];
  totals: T;
}

export interface StandardMatrix
  extends BaseMatrix<
    SupplierEntryWithBreakdown<StandardBreakdown>,
    TotalsWithBreakdown<StandardBreakdown>
  > {}

export interface PaymentMatrix
  extends BaseMatrix<
    PaymentSupplierEntry,
    TotalsWithBreakdown<PaymentBreakdown>
  > {}

// Supplier Stats Types
export interface PaymentSupplierStats {
  payment: PaymentStats;
  status: StandardStats;
  individualCosts: BaseStatsWithBreakdown<PaymentBreakdown>;
}

export interface StandardSupplierStats {
  cost: StandardStats;
  status: StandardStats;
}

// Result Types
export interface PaymentReconciliationResult {
  paymentMatrix: PaymentMatrix;
  statusMatrix: StandardMatrix;
  individualCostsMatrix: BaseMatrix<
    SupplierEntryWithBreakdown<PaymentBreakdown>,
    TotalsWithBreakdown<PaymentBreakdown>
  >;
}

export interface StandardReconciliationResult {
  costMatrix: StandardMatrix;
  statusMatrix: StandardMatrix;
}

// Input Types
export interface BaseBookingData {
  sst_supplier_name: string;
  [key: string]: any;
}

export interface StandardBookingData extends BaseBookingData {
  supplier_cost_comparison: string | null;
  supplier_status_comparison: string | null;
}

export interface PaymentBookingData extends BaseBookingData {
  payment_amount_usd_comparison: string | null;
  payment_status_comparison: string | null;
  individual_costs_and_final_usd_comparison: string | null;
  sst_final_selling_price_usd?: number;
  payment_amount_captured_usd_total?: number;
}

// Processing Function Types
export type ProcessReconciliationData = (
  bookings: any[]
) => StandardReconciliationResult;
export type ProcessPaymentReconciliationData = (
  bookings: any[]
) => PaymentReconciliationResult;

// Component Props Types
export interface BaseReconciliationProps {
  type: "supplier" | "payment";
}

export interface StandardReconciliationProps extends BaseReconciliationProps {
  type: "supplier";
  costData: StandardMatrix;
  statusData: StandardMatrix;
}

export interface PaymentReconciliationProps extends BaseReconciliationProps {
  type: "payment";
  costData: PaymentMatrix;
  statusData: StandardMatrix;
  individualCostsData: PaymentMatrix;
}

export type ReconciliationProps =
  | StandardReconciliationProps
  | PaymentReconciliationProps;

// First, let's ensure our type guard is more specific
interface HasPaymentAmounts {
  totalExpectedAmount: number;
  totalCapturedAmount: number;
}

// Update PaymentSupplierEntry to implement HasPaymentAmounts
export interface PaymentSupplierEntry
  extends SupplierEntryWithBreakdown<PaymentBreakdown>,
    HasPaymentAmounts {}

// Create type guard helpers
// const hasPaymentAmounts = (obj: any): obj is HasPaymentAmounts => {
//   return "totalExpectedAmount" in obj && "totalCapturedAmount" in obj;
// };

// const isPaymentSupplierEntry = (
//   supplier: SupplierEntryWithBreakdown<StandardBreakdown> | PaymentSupplierEntry
// ): supplier is PaymentSupplierEntry => {
//   return hasPaymentAmounts(supplier);
// };

// Update the matrix type guard
// const isPaymentMatrix = (
//   matrix: StandardMatrix | PaymentMatrix,
//   type: "payment" | "status"
// ): matrix is PaymentMatrix => {
//   if (type !== "payment") return false;

//   // Check if all suppliers have payment amounts
//   return matrix.suppliers.every(isPaymentSupplierEntry);
// };

// const processReconciliationData = (bookings: any[]): ReconciliationResult => {
//   // Initialize the data structure
//   const supplierStats: { [key: string]: SupplierStats } = {};
//   let totalStats = {
//     cost: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     status: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//   };

//   // Process each booking
//   bookings.forEach((booking: BookingData) => {
//     const supplierName = booking.sst_supplier_name;

//     // Initialize supplier if not exists
//     if (!supplierStats[supplierName]) {
//       supplierStats[supplierName] = {
//         cost: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//         status: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//       };
//     }

//     // Process Cost Comparison
//     supplierStats[supplierName].cost.total++;
//     totalStats.cost.total++;

//     if (booking.supplier_cost_comparison === null) {
//       supplierStats[supplierName].cost.missing++;
//       supplierStats[supplierName].cost.breakdown.missing++;
//       totalStats.cost.missing++;
//     } else if (booking.supplier_cost_comparison === "match") {
//       supplierStats[supplierName].cost.matches++;
//       supplierStats[supplierName].cost.breakdown.match++;
//       totalStats.cost.matches++;
//     } else {
//       supplierStats[supplierName].cost.mismatches++;
//       supplierStats[supplierName].cost.breakdown.mismatch++;
//       totalStats.cost.mismatches++;
//     }

//     // Process Status Comparison
//     supplierStats[supplierName].status.total++;
//     totalStats.status.total++;

//     if (booking.supplier_status_comparison === null) {
//       supplierStats[supplierName].status.missing++;
//       supplierStats[supplierName].status.breakdown.missing++;
//       totalStats.status.missing++;
//     } else if (booking.supplier_status_comparison === "match") {
//       supplierStats[supplierName].status.matches++;
//       supplierStats[supplierName].status.breakdown.match++;
//       totalStats.status.matches++;
//     } else {
//       supplierStats[supplierName].status.mismatches++;
//       supplierStats[supplierName].status.breakdown.mismatch++;
//       totalStats.status.mismatches++;
//     }
//   });

//   // Transform into final format
//   const result: ReconciliationResult = {
//     costMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.cost.matches,
//         total: stats.cost.total,
//         missing: stats.cost.missing,
//         breakdown: stats.cost.breakdown,
//       })),
//       totals: {
//         matches: totalStats.cost.matches,
//         total: totalStats.cost.total,
//         missing: totalStats.cost.missing,
//         breakdown: {
//           match: totalStats.cost.matches,
//           mismatch: totalStats.cost.mismatches,
//           missing: totalStats.cost.missing,
//         },
//       },
//     },
//     statusMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.status.matches,
//         total: stats.status.total,
//         missing: stats.status.missing,
//         breakdown: stats.status.breakdown,
//       })),
//       totals: {
//         matches: totalStats.status.matches,
//         total: totalStats.status.total,
//         missing: totalStats.status.missing,
//         breakdown: {
//           match: totalStats.status.matches,
//           mismatch: totalStats.status.mismatches,
//           missing: totalStats.status.missing,
//         },
//       },
//     },
//   };

//   return result;
// };

// export default processReconciliationData;

// // Minimal booking interface for type checking
// // interface BookingData {
// //   // sst_supplier_name: string;
// //   // payment_amount_usd_comparison: string | null;
// //   // payment_status_comparison: string | null;
// //   // individual_costs_and_final_usd_comparison: string | null;
// //   // sst_final_selling_price_usd?: number;
// //   // payment_amount_captured_usd_total?: number;
// //   [key: string]: any; // Allow any additional properties
// // }

// export const processPaymentReconciliationData = (
//   bookings: any[]
// ): ReconciliationResult => {
//   // Initialize the data structure
//   const supplierStats: { [key: string]: SupplierStats } = {};
//   let totalStats = {
//     payment: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     status: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     individualCosts: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//   };

//   // Process each booking
//   bookings.forEach((booking: any) => {
//     const supplierName = booking.sst_supplier_name;

//     // Initialize supplier if not exists
//     if (!supplierStats[supplierName]) {
//       supplierStats[supplierName] = {
//         payment: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: {
//             match: 0,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//           totalExpectedAmount: 0,
//           totalCapturedAmount: 0,
//         },
//         status: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//         individualCosts: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: {
//             match: 0,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//         },
//       };
//     }

//     // Process Payment Amount Comparison
//     supplierStats[supplierName].payment.total++;
//     totalStats.payment.total++;
//     supplierStats[supplierName].payment.totalExpectedAmount +=
//       booking.sst_final_selling_price_usd || 0;
//     supplierStats[supplierName].payment.totalCapturedAmount +=
//       booking.payment_amount_captured_usd_total || 0;

//     if (!booking.payment_amount_usd_comparison) {
//       supplierStats[supplierName].payment.missing++;
//       totalStats.payment.missing++;
//     } else if (booking.payment_amount_usd_comparison === "match") {
//       supplierStats[supplierName].payment.matches++;
//       supplierStats[supplierName].payment.breakdown.match++;
//       totalStats.payment.matches++;
//     } else {
//       supplierStats[supplierName].payment.mismatches++;
//       supplierStats[supplierName].payment.breakdown[
//         booking.payment_amount_usd_comparison as keyof PaymentBreakdown
//       ]++;
//       totalStats.payment.mismatches++;
//     }

//     // Process Payment Status Comparison
//     supplierStats[supplierName].status.total++;
//     totalStats.status.total++;

//     if (!booking.payment_status_comparison) {
//       supplierStats[supplierName].status.missing++;
//       supplierStats[supplierName].status.breakdown.missing++;
//       totalStats.status.missing++;
//     } else if (booking.payment_status_comparison === "match") {
//       supplierStats[supplierName].status.matches++;
//       supplierStats[supplierName].status.breakdown.match++;
//       totalStats.status.matches++;
//     } else {
//       supplierStats[supplierName].status.mismatches++;
//       supplierStats[supplierName].status.breakdown.mismatch++;
//       totalStats.status.mismatches++;
//     }

//     // Process Individual Costs Comparison
//     supplierStats[supplierName].individualCosts.total++;
//     totalStats.individualCosts.total++;

//     if (!booking.individual_costs_and_final_usd_comparison) {
//       supplierStats[supplierName].individualCosts.missing++;
//       totalStats.individualCosts.missing++;
//     } else if (booking.individual_costs_and_final_usd_comparison === "match") {
//       supplierStats[supplierName].individualCosts.matches++;
//       supplierStats[supplierName].individualCosts.breakdown.match++;
//       totalStats.individualCosts.matches++;
//     } else {
//       supplierStats[supplierName].individualCosts.mismatches++;
//       supplierStats[supplierName].individualCosts.breakdown[
//         booking.individual_costs_and_final_usd_comparison as keyof PaymentBreakdown
//       ]++;
//       totalStats.individualCosts.mismatches++;
//     }
//   });

//   // Transform into final format
//   const result: ReconciliationResult = {
//     paymentMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.payment.matches,
//         total: stats.payment.total,
//         missing: stats.payment.missing,
//         breakdown: stats.payment.breakdown,
//         totalExpectedAmount: stats.payment.totalExpectedAmount,
//         totalCapturedAmount: stats.payment.totalCapturedAmount,
//       })),
//       totals: {
//         matches: totalStats.payment.matches,
//         total: totalStats.payment.total,
//         missing: totalStats.payment.missing,
//         breakdown: {
//           match: totalStats.payment.matches,
//           high_negative_difference: 0,
//           low_negative_difference: 0,
//           low_positive_difference: 0,
//           high_positive_difference: 0,
//         },
//       },
//     },
//     statusMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.status.matches,
//         total: stats.status.total,
//         missing: stats.status.missing,
//         breakdown: stats.status.breakdown,
//       })),
//       totals: {
//         matches: totalStats.status.matches,
//         total: totalStats.status.total,
//         missing: totalStats.status.missing,
//         breakdown: {
//           match: totalStats.status.matches,
//           mismatch: totalStats.status.mismatches,
//           missing: totalStats.status.missing,
//         },
//       },
//     },
//     individualCostsMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.individualCosts.matches,
//         total: stats.individualCosts.total,
//         missing: stats.individualCosts.missing,
//         breakdown: stats.individualCosts.breakdown,
//       })),
//       totals: {
//         matches: totalStats.individualCosts.matches,
//         total: totalStats.individualCosts.total,
//         missing: totalStats.individualCosts.missing,
//         breakdown: {
//           match: totalStats.individualCosts.matches,
//           high_negative_difference: 0,
//           low_negative_difference: 0,
//           low_positive_difference: 0,
//           high_positive_difference: 0,
//         },
//       },
//     },
//   };

//   return result;
// };

// export const processSupplierReconciliationData: ProcessReconciliationData = (
//   bookings: any[]
// ): StandardReconciliationResult => {
//   // Initialize the data structure
//   const supplierStats: Record<string, StandardSupplierStats> = {};
//   const totalStats = {
//     cost: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     status: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//   };

//   // Process each booking
//   bookings.forEach((booking) => {
//     const supplierName = booking.sst_supplier_name;

//     // Initialize supplier if not exists
//     if (!supplierStats[supplierName]) {
//       supplierStats[supplierName] = {
//         cost: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//         status: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//       };
//     }

//     // Process Cost Comparison
//     supplierStats[supplierName].cost.total++;
//     totalStats.cost.total++;

//     if (booking.supplier_cost_comparison === null) {
//       supplierStats[supplierName].cost.missing++;
//       supplierStats[supplierName].cost.breakdown.missing++;
//       totalStats.cost.missing++;
//     } else if (booking.supplier_cost_comparison === "match") {
//       supplierStats[supplierName].cost.matches++;
//       supplierStats[supplierName].cost.breakdown.match++;
//       totalStats.cost.matches++;
//     } else {
//       supplierStats[supplierName].cost.mismatches++;
//       supplierStats[supplierName].cost.breakdown.mismatch++;
//       totalStats.cost.mismatches++;
//     }

//     // Process Status Comparison
//     supplierStats[supplierName].status.total++;
//     totalStats.status.total++;

//     if (booking.supplier_status_comparison === null) {
//       supplierStats[supplierName].status.missing++;
//       supplierStats[supplierName].status.breakdown.missing++;
//       totalStats.status.missing++;
//     } else if (booking.supplier_status_comparison === "match") {
//       supplierStats[supplierName].status.matches++;
//       supplierStats[supplierName].status.breakdown.match++;
//       totalStats.status.matches++;
//     } else {
//       supplierStats[supplierName].status.mismatches++;
//       supplierStats[supplierName].status.breakdown.mismatch++;
//       totalStats.status.mismatches++;
//     }
//   });

//   return {
//     costMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.cost.matches,
//         total: stats.cost.total,
//         missing: stats.cost.missing,
//         breakdown: stats.cost.breakdown,
//       })),
//       totals: {
//         matches: totalStats.cost.matches,
//         total: totalStats.cost.total,
//         missing: totalStats.cost.missing,
//         breakdown: {
//           match: totalStats.cost.matches,
//           mismatch: totalStats.cost.mismatches,
//           missing: totalStats.cost.missing,
//         },
//       },
//     },
//     statusMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.status.matches,
//         total: stats.status.total,
//         missing: stats.status.missing,
//         breakdown: stats.status.breakdown,
//       })),
//       totals: {
//         matches: totalStats.status.matches,
//         total: totalStats.status.total,
//         missing: totalStats.status.missing,
//         breakdown: {
//           match: totalStats.status.matches,
//           mismatch: totalStats.status.mismatches,
//           missing: totalStats.status.missing,
//         },
//       },
//     },
//   };
// };

// interface CostBreakdown {
//   match: number;
//   high_negative_difference: number;
//   medium_negative_difference: number;
//   low_positive_difference: number;
//   low_negative_difference: number;
//   missing: number;
// }

// interface StatusBreakdown {
//   match: number;
//   mismatch: number;
//   missing: number;
// }

// interface SupplierStats {
//   cost: {
//     total: number;
//     matches: number;
//     differences: number;
//     missing: number;
//     breakdown: CostBreakdown;
//   };
//   status: {
//     total: number;
//     matches: number;
//     mismatches: number;
//     missing: number;
//     breakdown: StatusBreakdown;
//   };
// }

// interface TotalStats {
//   cost: {
//     total: number;
//     matches: number;
//     differences: number;
//     missing: number;
//     breakdown: CostBreakdown;
//   };
//   status: {
//     total: number;
//     matches: number;
//     mismatches: number;
//     missing: number;
//     breakdown: StatusBreakdown;
//   };
// }

// export interface StandardReconciliationResult {
//   costMatrix: {
//     suppliers: Array<{
//       name: string;
//       matches: number;
//       total: number;
//       missing: number;
//       breakdown: CostBreakdown;
//     }>;
//     totals: {
//       matches: number;
//       total: number;
//       missing: number;
//       breakdown: CostBreakdown;
//     };
//   };
//   statusMatrix: {
//     suppliers: Array<{
//       name: string;
//       matches: number;
//       total: number;
//       missing: number;
//       breakdown: StatusBreakdown;
//     }>;
//     totals: {
//       matches: number;
//       total: number;
//       missing: number;
//       breakdown: StatusBreakdown;
//     };
//   };
// }

// // export type ProcessReconciliationData = (bookings: any[]) => StandardReconciliationResult;

// export const processSupplierReconciliationData: ProcessReconciliationData = (
//   bookings: any[]
// ): StandardReconciliationResult => {
//   // Initialize the data structure
//   const supplierStats: Record<string, SupplierStats> = {};
//   const totalStats: TotalStats = {
//     cost: {
//       total: 0,
//       matches: 0,
//       differences: 0,
//       missing: 0,
//       breakdown: {
//         match: 0,
//         high_negative_difference: 0,
//         medium_negative_difference: 0,
//         low_positive_difference: 0,
//         low_negative_difference: 0,
//         missing: 0,
//       },
//     },
//     status: {
//       total: 0,
//       matches: 0,
//       mismatches: 0,
//       missing: 0,
//       breakdown: { match: 0, mismatch: 0, missing: 0 },
//     },
//   };

//   // Process each booking
//   bookings.forEach((booking) => {
//     const supplierName = booking.sst_supplier_name;

//     // Initialize supplier if not exists
//     if (!supplierStats[supplierName]) {
//       supplierStats[supplierName] = {
//         cost: {
//           total: 0,
//           matches: 0,
//           differences: 0,
//           missing: 0,
//           breakdown: {
//             match: 0,
//             high_negative_difference: 0,
//             medium_negative_difference: 0,
//             low_positive_difference: 0,
//             low_negative_difference: 0,
//             missing: 0,
//           },
//         },
//         status: {
//           total: 0,
//           matches: 0,
//           mismatches: 0,
//           missing: 0,
//           breakdown: { match: 0, mismatch: 0, missing: 0 },
//         },
//       };
//     }

//     // Process Cost Comparison
//     supplierStats[supplierName].cost.total++;
//     totalStats.cost.total++;

//     if (booking.supplier_cost_comparison === null) {
//       supplierStats[supplierName].cost.missing++;
//       supplierStats[supplierName].cost.breakdown.missing++;
//       totalStats.cost.missing++;
//       totalStats.cost.breakdown.missing++;
//     } else if (booking.supplier_cost_comparison === "match") {
//       supplierStats[supplierName].cost.matches++;
//       supplierStats[supplierName].cost.breakdown.match++;
//       totalStats.cost.matches++;
//       totalStats.cost.breakdown.match++;
//     } else {
//       // Handle different types of cost differences
//       supplierStats[supplierName].cost.differences++;
//       totalStats.cost.differences++;

//       // Update specific difference breakdowns
//       supplierStats[supplierName].cost.breakdown[
//         booking.supplier_cost_comparison
//       ]++;
//       totalStats.cost.breakdown[booking.supplier_cost_comparison]++;
//     }

//     // Process Status Comparison (unchanged)
//     supplierStats[supplierName].status.total++;
//     totalStats.status.total++;

//     if (booking.supplier_status_comparison === null) {
//       supplierStats[supplierName].status.missing++;
//       supplierStats[supplierName].status.breakdown.missing++;
//       totalStats.status.missing++;
//       totalStats.status.breakdown.missing++;
//     } else if (booking.supplier_status_comparison === "match") {
//       supplierStats[supplierName].status.matches++;
//       supplierStats[supplierName].status.breakdown.match++;
//       totalStats.status.matches++;
//       totalStats.status.breakdown.match++;
//     } else {
//       supplierStats[supplierName].status.mismatches++;
//       supplierStats[supplierName].status.breakdown.mismatch++;
//       totalStats.status.mismatches++;
//       totalStats.status.breakdown.mismatch++;
//     }
//   });

//   return {
//     costMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.cost.matches,
//         total: stats.cost.total,
//         missing: stats.cost.missing,
//         breakdown: stats.cost.breakdown,
//       })),
//       totals: {
//         matches: totalStats.cost.matches,
//         total: totalStats.cost.total,
//         missing: totalStats.cost.missing,
//         breakdown: totalStats.cost.breakdown,
//       },
//     },
//     statusMatrix: {
//       suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//         name,
//         matches: stats.status.matches,
//         total: stats.status.total,
//         missing: stats.status.missing,
//         breakdown: stats.status.breakdown,
//       })),
//       totals: {
//         matches: totalStats.status.matches,
//         total: totalStats.status.total,
//         missing: totalStats.status.missing,
//         breakdown: totalStats.status.breakdown,
//       },
//     },
//   };
// };

// export const processPaymentReconciliationData: ProcessPaymentReconciliationData =
//   (bookings: any[]): PaymentReconciliationResult => {
//     // Initialize the data structure
//     const supplierStats: Record<string, PaymentSupplierStats> = {};
//     const totalStats = {
//       payment: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//       status: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//       individualCosts: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     };

//     // Process each booking
//     bookings.forEach((booking) => {
//       const supplierName = booking.sst_supplier_name;

//       // Initialize supplier if not exists
//       if (!supplierStats[supplierName]) {
//         supplierStats[supplierName] = {
//           payment: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: {
//               match: 0,
//               high_negative_difference: 0,
//               low_negative_difference: 0,
//               low_positive_difference: 0,
//               high_positive_difference: 0,
//             },
//             totalExpectedAmount: 0,
//             totalCapturedAmount: 0,
//           },
//           status: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: { match: 0, mismatch: 0, missing: 0 },
//           },
//           individualCosts: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: {
//               match: 0,
//               high_negative_difference: 0,
//               low_negative_difference: 0,
//               low_positive_difference: 0,
//               high_positive_difference: 0,
//             },
//           },
//         };
//       }

//       // Process Payment Amount Comparison
//       const payment = supplierStats[supplierName].payment;
//       payment.total++;
//       totalStats.payment.total++;
//       payment.totalExpectedAmount += booking.sst_final_selling_price_usd || 0;
//       payment.totalCapturedAmount +=
//         booking.payment_amount_captured_usd_total || 0;

//       if (!booking.payment_amount_usd_comparison) {
//         payment.missing++;
//         totalStats.payment.missing++;
//       } else if (booking.payment_amount_usd_comparison === "match") {
//         payment.matches++;
//         payment.breakdown.match++;
//         totalStats.payment.matches++;
//       } else {
//         payment.mismatches++;
//         payment.breakdown[
//           booking.payment_amount_usd_comparison as keyof PaymentBreakdown
//         ]++;
//         totalStats.payment.mismatches++;
//       }

//       // Process Payment Status Comparison
//       const status = supplierStats[supplierName].status;
//       status.total++;
//       totalStats.status.total++;

//       if (!booking.payment_status_comparison) {
//         status.missing++;
//         status.breakdown.missing++;
//         totalStats.status.missing++;
//       } else if (booking.payment_status_comparison === "match") {
//         status.matches++;
//         status.breakdown.match++;
//         totalStats.status.matches++;
//       } else {
//         status.mismatches++;
//         status.breakdown.mismatch++;
//         totalStats.status.mismatches++;
//       }

//       // Process Individual Costs Comparison
//       const costs = supplierStats[supplierName].individualCosts;
//       costs.total++;
//       totalStats.individualCosts.total++;

//       if (!booking.individual_costs_and_final_usd_comparison) {
//         costs.missing++;
//         totalStats.individualCosts.missing++;
//       } else if (
//         booking.individual_costs_and_final_usd_comparison === "match"
//       ) {
//         costs.matches++;
//         costs.breakdown.match++;
//         totalStats.individualCosts.matches++;
//       } else {
//         costs.mismatches++;
//         costs.breakdown[
//           booking.individual_costs_and_final_usd_comparison as keyof PaymentBreakdown
//         ]++;
//         totalStats.individualCosts.mismatches++;
//       }
//     });

//     return {
//       paymentMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.payment.matches,
//           total: stats.payment.total,
//           missing: stats.payment.missing,
//           breakdown: stats.payment.breakdown,
//           totalExpectedAmount: stats.payment.totalExpectedAmount,
//           totalCapturedAmount: stats.payment.totalCapturedAmount,
//         })),
//         totals: {
//           matches: totalStats.payment.matches,
//           total: totalStats.payment.total,
//           missing: totalStats.payment.missing,
//           breakdown: {
//             match: totalStats.payment.matches,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//         },
//       },
//       statusMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.status.matches,
//           total: stats.status.total,
//           missing: stats.status.missing,
//           breakdown: stats.status.breakdown,
//         })),
//         totals: {
//           matches: totalStats.status.matches,
//           total: totalStats.status.total,
//           missing: totalStats.status.missing,
//           breakdown: {
//             match: totalStats.status.matches,
//             mismatch: totalStats.status.mismatches,
//             missing: totalStats.status.missing,
//           },
//         },
//       },
//       individualCostsMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.individualCosts.matches,
//           total: stats.individualCosts.total,
//           missing: stats.individualCosts.missing,
//           breakdown: stats.individualCosts.breakdown,
//         })),
//         totals: {
//           matches: totalStats.individualCosts.matches,
//           total: totalStats.individualCosts.total,
//           missing: totalStats.individualCosts.missing,
//           breakdown: {
//             match: totalStats.individualCosts.matches,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//         },
//       },
//     };
//   };

// export const processPaymentReconciliationData: ProcessPaymentReconciliationData =
//   (bookings: any[]): PaymentReconciliationResult => {
//     const supplierStats: Record<string, PaymentSupplierStats> = {};
//     const totalStats = {
//       payment: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//       status: {
//         total: 0,
//         matches: 0,
//         mismatches: 0,
//         missing: 0,
//         cancelled_succeeded: 0,
//       },
//       individualCosts: { total: 0, matches: 0, mismatches: 0, missing: 0 },
//     };

//     bookings.forEach((booking) => {
//       const supplierName = booking.sst_supplier_name;

//       // Initialize supplier if not exists
//       if (!supplierStats[supplierName]) {
//         supplierStats[supplierName] = {
//           payment: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: {
//               match: 0,
//               high_negative_difference: 0,
//               low_negative_difference: 0,
//               low_positive_difference: 0,
//               high_positive_difference: 0,
//             },
//             totalExpectedAmount: 0,
//             totalCapturedAmount: 0,
//           },
//           status: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: {
//               match: 0,
//               mismatch: 0,
//               missing: 0,
//               cancelled_succeeded: 0, // Add the new status type
//             },
//           },
//           individualCosts: {
//             total: 0,
//             matches: 0,
//             mismatches: 0,
//             missing: 0,
//             breakdown: {
//               match: 0,
//               high_negative_difference: 0,
//               low_negative_difference: 0,
//               low_positive_difference: 0,
//               high_positive_difference: 0,
//             },
//           },
//         };
//       }

//       // Process Payment Amount Comparison (unchanged)
//       const payment = supplierStats[supplierName].payment;
//       payment.total++;
//       totalStats.payment.total++;
//       payment.totalExpectedAmount += booking.sst_final_selling_price_usd || 0;
//       payment.totalCapturedAmount +=
//         booking.payment_amount_captured_usd_total || 0;

//       if (!booking.payment_amount_usd_comparison) {
//         payment.missing++;
//         totalStats.payment.missing++;
//       } else if (booking.payment_amount_usd_comparison === "match") {
//         payment.matches++;
//         payment.breakdown.match++;
//         totalStats.payment.matches++;
//       } else {
//         payment.mismatches++;
//         payment.breakdown[
//           booking.payment_amount_usd_comparison as keyof PaymentBreakdown
//         ]++;
//         totalStats.payment.mismatches++;
//       }

//       // Enhanced Payment Status Comparison
//       const status = supplierStats[supplierName].status;
//       status.total++;
//       totalStats.status.total++;

//       if (!booking.payment_status_comparison) {
//         status.missing++;
//         status.breakdown.missing++;
//         totalStats.status.missing++;
//       } else if (booking.payment_status_comparison === "match") {
//         status.matches++;
//         status.breakdown.match++;
//         totalStats.status.matches++;
//       } else if (booking.payment_status_comparison === "cancelled_succeeded") {
//         // Special handling for cancelled_succeeded status
//         status.breakdown.cancelled_succeeded =
//           (status.breakdown.cancelled_succeeded || 0) + 1;
//         totalStats.status.cancelled_succeeded++;
//         // We still count this as a mismatch for total counts
//         status.mismatches++;
//         totalStats.status.mismatches++;
//       } else {
//         status.mismatches++;
//         status.breakdown.mismatch++;
//         totalStats.status.mismatches++;
//       }

//       // Process Individual Costs Comparison (unchanged)
//       const costs = supplierStats[supplierName].individualCosts;
//       costs.total++;
//       totalStats.individualCosts.total++;

//       if (!booking.individual_costs_and_final_usd_comparison) {
//         costs.missing++;
//         totalStats.individualCosts.missing++;
//       } else if (
//         booking.individual_costs_and_final_usd_comparison === "match"
//       ) {
//         costs.matches++;
//         costs.breakdown.match++;
//         totalStats.individualCosts.matches++;
//       } else {
//         costs.mismatches++;
//         costs.breakdown[
//           booking.individual_costs_and_final_usd_comparison as keyof PaymentBreakdown
//         ]++;
//         totalStats.individualCosts.mismatches++;
//       }
//     });

//     return {
//       paymentMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.payment.matches,
//           total: stats.payment.total,
//           missing: stats.payment.missing,
//           breakdown: stats.payment.breakdown,
//           totalExpectedAmount: stats.payment.totalExpectedAmount,
//           totalCapturedAmount: stats.payment.totalCapturedAmount,
//         })),
//         totals: {
//           matches: totalStats.payment.matches,
//           total: totalStats.payment.total,
//           missing: totalStats.payment.missing,
//           breakdown: {
//             match: totalStats.payment.matches,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//         },
//       },
//       statusMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.status.matches,
//           total: stats.status.total,
//           missing: stats.status.missing,
//           breakdown: {
//             match: stats.status.breakdown.match,
//             mismatch: stats.status.breakdown.mismatch,
//             missing: stats.status.breakdown.missing,
//             cancelled_succeeded:
//               stats.status.breakdown.cancelled_succeeded || 0,
//           },
//         })),
//         totals: {
//           matches: totalStats.status.matches,
//           total: totalStats.status.total,
//           missing: totalStats.status.missing,
//           breakdown: {
//             match: totalStats.status.matches,
//             mismatch:
//               totalStats.status.mismatches -
//               totalStats.status.cancelled_succeeded,
//             missing: totalStats.status.missing,
//             cancelled_succeeded: totalStats.status.cancelled_succeeded,
//           },
//         },
//       },
//       individualCostsMatrix: {
//         suppliers: Object.entries(supplierStats).map(([name, stats]) => ({
//           name,
//           matches: stats.individualCosts.matches,
//           total: stats.individualCosts.total,
//           missing: stats.individualCosts.missing,
//           breakdown: stats.individualCosts.breakdown,
//         })),
//         totals: {
//           matches: totalStats.individualCosts.matches,
//           total: totalStats.individualCosts.total,
//           missing: totalStats.individualCosts.missing,
//           breakdown: {
//             match: totalStats.individualCosts.matches,
//             high_negative_difference: 0,
//             low_negative_difference: 0,
//             low_positive_difference: 0,
//             high_positive_difference: 0,
//           },
//         },
//       },
//     };
//   };

export function inferDataTypes(
  jsonData: any[]
): { name: string; data_type: string }[] {
  if (jsonData.length === 0) {
    return [];
  }

  const columns = Object.keys(jsonData[0]);
  const inferredTypes: { name: string; data_type: string }[] = [];

  columns.forEach((column) => {
    const nonNullValues = jsonData.filter((row) => row[column] != null);

    if (nonNullValues.length === 0) {
      inferredTypes.push({ name: column, data_type: "unknown" });
    } else {
      const types = new Set(nonNullValues.map((row) => typeof row[column]));

      let inferredType: string;
      if (types.size === 1) {
        const type = types.values().next().value || "";
        inferredType = typeMapping[type] || "unknown";
      } else if (types.has("number")) {
        // If mixed types but includes number, prefer number
        inferredType = "float";
      } else {
        // For mixed types, default to string
        inferredType = "string";
      }

      // Additional checks for more specific types
      if (
        inferredType === "float" &&
        nonNullValues.every((row) => Number.isInteger(row[column]))
      ) {
        inferredType = "integer";
      } else if (inferredType === "string") {
        // Check for date strings
        const isAllDates = nonNullValues.every(
          (row) => !isNaN(Date.parse(row[column]))
        );
        if (isAllDates) {
          inferredType = "datetime";
        }
      }

      inferredTypes.push({ name: column, data_type: inferredType });
    }
  });

  return inferredTypes;
}

// Type mapping similar to the Python version
export const typeMapping: { [key: string]: string } = {
  number: "float",
  bigint: "integer",
  string: "string",
  boolean: "boolean",
  object: "object", // For nested objects or null
  undefined: "unknown",
};

interface Field {
  name: string;
  data_type?: string;
  summary?: string;
  distinct_values?: any[] | string | null;
  samples?: any[] | string;
}

interface Collection {
  name: string;
  description?: string;
  id?: string;
}

export function createFieldsDocumentation(
  fields: Field[],
  collection: Collection
): string {
  let markdown = `# Field Documentation\n\n`;

  // Add collection information
  markdown += `## Collection Information\n\n`;
  markdown += `**Collection/Table:** ${collection.name}\n\n`;
  if (collection.description) {
    markdown += `**Description:** ${collection.description}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `## Fields\n\n`;

  for (const field of fields) {
    markdown += `### ${field.name}\n\n`;

    if (field.summary) {
      markdown += `**Description:** ${field.summary}\n\n`;
    }

    if (field.data_type) {
      markdown += `**Data Type:** ${field.data_type}\n\n`;
    }

    // Show distinct_values if available, otherwise show samples
    if (field.distinct_values !== null && field.distinct_values !== undefined) {
      markdown += `**Allowed Values:**\n`;
      if (Array.isArray(field.distinct_values)) {
        field.distinct_values.forEach((value) => {
          markdown += `- ${value}\n`;
        });
      } else {
        markdown += `- ${field.distinct_values}\n`;
      }
      markdown += `\n`;
    } else if (field.samples) {
      markdown += `**Sample Values:**\n`;
      if (Array.isArray(field.samples)) {
        field.samples.forEach((sample) => {
          markdown += `- ${sample}\n`;
        });
      } else {
        markdown += `- ${field.samples}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  return markdown;
}

export function createFieldsDocumentationHTML(
  fields: Field[],
  collection: Collection
): string {
  const html = `
      <div class="documentation">
          <h1 class="text-2xl font-bold mb-6">Field Documentation</h1>
          
          <!-- Collection Information -->
          <div class="collection-info mb-8">
              <h2 class="text-xl font-semibold mb-4">Collection Information</h2>
              <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="mb-2">
                      <span class="font-semibold">Collection/Table:</span> ${
                        collection.name
                      }
                  </div>
                  ${
                    collection.description
                      ? `
                      <div>
                          <span class="font-semibold">Description:</span> ${collection.description}
                      </div>
                  `
                      : ""
                  }
                  ${
                    collection.id
                      ? `
                      <div>
                          <span class="font-semibold">Id:</span> ${collection.id}
                      </div>
                  `
                      : ""
                  }
              </div>
          </div>

          <!-- Fields -->
          <div class="fields">
              <h2 class="text-xl font-semibold mb-4">Fields</h2>
              ${fields
                .map(
                  (field) => `
                  <div class="field-card bg-white border rounded-lg p-4 mb-4 shadow-sm">
                      <h3 class="text-lg font-semibold text-blue-600 mb-2">${
                        field.name
                      }</h3>
                      
                      ${
                        field.summary
                          ? `
                          <div class="mb-2">
                              <span class="font-semibold">Description:</span> 
                              <span class="text-gray-700">${field.summary}</span>
                          </div>
                      `
                          : ""
                      }
                      
                      ${
                        field.data_type
                          ? `
                          <div class="mb-2">
                              <span class="font-semibold">Data Type:</span> 
                              <code class="bg-gray-100 px-2 py-1 rounded">${field.data_type}</code>
                          </div>
                      `
                          : ""
                      }
                      
                      ${
                        field.distinct_values !== null &&
                        field.distinct_values !== undefined
                          ? `
                          <div class="mt-3">
                              <span class="font-semibold">Allowed Values:</span>
                              <ul class="list-disc pl-5 mt-1">
                                  ${
                                    Array.isArray(field.distinct_values)
                                      ? field.distinct_values
                                          .map(
                                            (value) => `
                                          <li class="text-gray-700">${
                                            value === null
                                              ? '<span class="text-gray-400">null</span>'
                                              : value
                                          }</li>
                                      `
                                          )
                                          .join("")
                                      : `<li class="text-gray-700">${field.distinct_values}</li>`
                                  }
                              </ul>
                          </div>
                      `
                          : field.samples
                          ? `
                          <div class="mt-3">
                              <span class="font-semibold">Sample Values:</span>
                              <ul class="list-disc pl-5 mt-1">
                                  ${
                                    Array.isArray(field.samples)
                                      ? field.samples
                                          .map(
                                            (sample) => `
                                          <li class="text-gray-700">${sample}</li>
                                      `
                                          )
                                          .join("")
                                      : `<li class="text-gray-700">${field.samples}</li>`
                                  }
                              </ul>
                          </div>
                      `
                          : ""
                      }
                  </div>
              `
                )
                .join("")}
          </div>
      </div>
  `;

  return html.trim();
}

// Most comprehensive version that handles special cases
export const toTitleCase = (text: string) => {
  // List of words that should not be capitalized (unless they're the first word)
  const minorWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "in",
    "of",
    "on",
    "at",
    "to",
    "with",
    "by",
  ]);

  return text
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((word, index) => {
      // Always capitalize the first word or if it's not a minor word
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
};

// export const replaceGlobalSearchQuery = (
//   sqlQuery: string,
//   newQueryValue: string
// ) => {
//   // Using a regular expression to match {{globalSearchQuery}} with optional whitespace
//   const regex = /\{\{\s*globalSearchQuery\s*\}\}/g;

//   // Replace all occurrences with the new value
//   return sqlQuery.replace(regex, newQueryValue);
// };

export const replaceGlobalSearchQuery = (
  sqlQuery: string,
  newQueryValue: string
): string => {
  if (!sqlQuery || !newQueryValue) {
    return sqlQuery;
  }

  // Remove leading/trailing semicolons and whitespace from the new query value
  const sanitizedQueryValue = newQueryValue
    .trim()
    .replace(/^;+|;+$/g, "")
    .trim();

  // Using a regular expression to match {{globalSearchQuery}} with optional whitespace
  const regex = /\{\{\s*globalSearchQuery\s*\}\}/g;

  // Replace all occurrences with the sanitized value
  return sqlQuery.replace(regex, sanitizedQueryValue);
};

interface Step {
  explanation: string;
  output?: string;
}

/**
 * Configuration options for markdown conversion
 */
interface MarkdownOptions {
  codeLanguage?: string;
  includeMainTitle?: boolean;
  mainTitleText?: string;
  stepPrefix?: string;
}

/**
 * Default options for markdown conversion
 */
const defaultOptions: MarkdownOptions = {
  codeLanguage: "sql",
  includeMainTitle: true,
  mainTitleText: "Analysis Steps",
  stepPrefix: "Step",
};

export const stepsToMarkdown = (
  steps: Step[],
  options: MarkdownOptions = defaultOptions
): string => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return "";
  }

  const { codeLanguage, includeMainTitle, mainTitleText, stepPrefix } = {
    ...defaultOptions,
    ...options,
  };

  let markdown = "";

  // Add main title if enabled
  // if (includeMainTitle) {
  //   markdown += `# ${mainTitleText}\n\n`;
  // }

  // Convert each step to markdown
  const stepsMarkdown = steps.map((step: Step, index: number) => {
    const stepNumber = index + 1;
    let stepMarkdown = `### ${stepPrefix} ${stepNumber}\n\n`;

    // Add explanation
    stepMarkdown += `${step.explanation}\n\n`;

    // Add output in a code block if it exists
    // if (step.output) {
    //   stepMarkdown += `\`\`\`${codeLanguage}\n`;
    //   stepMarkdown += `${step.output}\n`;
    //   stepMarkdown += "```\n\n";
    // }

    return stepMarkdown;
  });

  markdown += stepsMarkdown.join("");
  return markdown.trim();
};

export function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em style={{ color: "red" }}>{field.state.meta.errors.join(",")}</em>
      ) : field.state.meta.isValidating ? (
        "Validating..."
      ) : (
        !field.state.meta.errors.length && (
          <em style={{ color: "green" }}>Looks good!</em>
        )
      )}
    </>
  );
}

// Function to map class names to ExcelJS ARGB colors
// export const getExcelJSStyleFromClass = (className: string) => {
//   switch (className) {
//     case "bg-green-500":
//       return { fgColor: { argb: "FF4CAF50" } }; // Green background
//     case "bg-red-500":
//       return { fgColor: { argb: "FFFF0000" } }; // Red background
//     case "bg-gray-500":
//       return { fgColor: { argb: "FF9E9E9E" } }; // Gray background
//     case "bg-orange-500":
//       return { fgColor: { argb: "FFFFA500" } }; // Orange background
//     default:
//       return null;
//   }
// };

// Utility function to calculate column width based on header length
export const calculateColumnWidth = (header: any) => {
  return Math.max(header.length + 8, 15); // Add padding and set a minimum width
};

export async function excelToStandardizedJson(
  file: File,
  section?: string
): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  let worksheet;
  if (section) {
    worksheet = workbook.getWorksheet(section);
    if (!worksheet) {
      throw new Error(`Worksheet "${section}" not found in the Excel file.`);
    }
  } else {
    worksheet = workbook.getWorksheet(1);
  }

  const jsonData: any[] = [];

  // Get headers and standardize them
  const headers = worksheet?.getRow(1).values as string[];
  const standardizedHeaders = headers
    .map((header) =>
      header
        ? header
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "")
        : ""
    )
    .filter(Boolean);

  // Process each row
  worksheet?.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip header row
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = standardizedHeaders[colNumber - 1];
        if (header) {
          switch (cell.type) {
            case ExcelJS.ValueType.Date:
              rowData[header] =
                cell.value instanceof Date ? cell.value.toISOString() : null;
              break;
            // case ExcelJS.ValueType.Hyperlink:
            //   rowData[header] = (cell.value as ExcelJS.CellHyperlink).text || null;
            //   break;
            case ExcelJS.ValueType.Number:
              rowData[header] = Number(cell.value);
              break;
            case ExcelJS.ValueType.Boolean:
              rowData[header] = Boolean(cell.value);
              break;
            case ExcelJS.ValueType.Null:
              rowData[header] = null;
              break;
            default:
              rowData[header] = cell.text || null;
          }
        }
      });
      jsonData.push(rowData);
    }
  });

  return jsonData;
}

// Function to format Python code template with arguments
export const formatPythonTemplate = (
  template: string,
  args: Record<string, any>
): string => {
  let formattedCode = template;

  // Replace each argument placeholder with its value
  Object.entries(args).forEach(([key, value]) => {
    // Convert value to Python literal representation
    const pythonValue =
      typeof value === "string" ? `"${value}"` : JSON.stringify(value);

    // Replace {{key}} pattern (handles both {{key}} and {{ key }})
    formattedCode = formattedCode.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, "g"),
      pythonValue
    );
  });

  return formattedCode;
};

export const formatDate = (
  dateValue: string | Date | null | undefined,
  formatString: string = "MMM d, h:mm a",
  fallback: string = ""
): string => {
  try {
    // Handle null/undefined
    if (!dateValue) {
      return fallback;
    }

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? format(dateValue, formatString) : fallback;
    }

    // If it's a string, try to parse it
    if (typeof dateValue === "string") {
      const parsedDate = parseISO(dateValue);
      return isValid(parsedDate) ? format(parsedDate, formatString) : fallback;
    }

    // If we get here, the input was of an unexpected type
    return fallback;
  } catch (error) {
    console.warn(`Error formatting date value: ${dateValue}`, error);
    return fallback;
  }
};

// type LiveQueryResult<T> = {
//   data: T[];
//   error: Error | null;
//   loading: boolean;
// };

// type Action = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";
// type CloseResult = "killed" | "disconnected";

// export function useLiveQuery<T extends Record<string, any>>(
//   table: string,
//   where?: string
// ): LiveQueryResult<T> {
//   const [data, setData] = useState<T[]>([]);
//   const [error, setError] = useState<Error | null>(null);
//   const [loading, setLoading] = useState(true);
//   const dbRef = useRef<Surreal | null>(null);

//   useEffect(() => {
//     let queryUuid: Uuid;
//     let mounted = true;

//     const startLiveQuery = async () => {
//       try {
//         // Get DB connection
//         dbRef.current = await getDb();
//         const db = dbRef.current;

//         const query = where
//           ? `SELECT *
// FROM ${table}
// WHERE ${where} ORDER BY updated_datetime ASC;`
//           : `SELECT *
// FROM ${table} ORDER BY updated_datetime ASC;`;

//         const [result] = await db.query<T[]>(query);
//         if (mounted) {
//           // setData(result);
//           if (Array.isArray(result)) {
//             setData(result as T[]);
//           } else {
//             setData([result as T]);
//           }
//           setLoading(false);
//         }

//         queryUuid = await db.live<T>(
//           table,
//           (action: Action, result: T | CloseResult) => {
//             if (!mounted) return;

//             switch (action) {
//               case "CREATE":
//                 setData((prevData) => {
//                   const newRecord = result as T;
//                   return [...prevData, newRecord];
//                 });
//                 break;
//               case "UPDATE":
//                 setData((prevData) => {
//                   const updatedRecord = result as T;
//                   return prevData.map((item) =>
//                     item.id === updatedRecord.id ? updatedRecord : item
//                   );
//                 });
//                 break;
//               case "DELETE":
//                 setData((prevData) => {
//                   const deletedRecord = result as T;
//                   return prevData.filter(
//                     (item) => item.id !== deletedRecord.id
//                   );
//                 });
//                 break;
//               case "CLOSE":
//                 console.log(`Live query ${result as CloseResult}`);
//                 break;
//             }
//           }
//         );
//       } catch (err) {
//         if (mounted) {
//           setError(err instanceof Error ? err : new Error("Live query failed"));
//           setLoading(false);
//         }
//       }
//     };

//     startLiveQuery();

//     // Cleanup function
//     return () => {
//       mounted = false;

//       // Kill the live query if it exists
//       const cleanup = async () => {
//         if (queryUuid && dbRef.current) {
//           try {
//             await dbRef.current.kill(queryUuid);
//           } catch (error) {
//             console.error("Error killing live query:", error);
//           }
//         }
//       };

//       cleanup();
//     };
//   }, [table, where]);

//   return { data, error, loading };
// }

export function extractKeys(obj: any, keys: any, mode = "include") {
  if (!["include", "exclude"].includes(mode)) {
    throw new Error("Mode must be either 'include' or 'exclude'");
  }

  return Object.fromEntries(
    Object.entries(obj).filter(([key]) =>
      mode === "include" ? keys.includes(key) : !keys.includes(key)
    )
  );
}
