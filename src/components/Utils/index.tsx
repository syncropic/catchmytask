import Decimal from "@components/Decimal";
import ExecutionStatus from "@components/ExecutionStatus";
import ExternalLink from "@components/ExternalLink";
import FilePath from "@components/FilePath";
import PrimaryKey from "@components/PrimaryKey";
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
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { HttpError, useGetIdentity, useList, useOne } from "@refinedev/core";
import { MRT_ColumnDef } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import DateTime from "src/components/DateTime";
import { useAppStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";

// Adjusted createColumnDef to fit your use case
export function createColumnDef<RowDataType extends RowData>(
  column: FieldConfiguration
): MRT_ColumnDef<RowDataType> {
  const isDateTime = column.data_type === "datetime";
  const isDecimal = column.data_type === "decimal";
  const isExternalLink = column?.display_component === "ExternalLink";
  const isPrimaryKey = column?.display_component === "PrimaryKey";
  const isFilePath = column?.display_component === "FilePath";
  const isReveal = column?.display_component === "Reveal";
  const isSessionLink = column?.display_component === "SessionLink";
  const isExecutionStatus = column?.display_component === "ExecutionStatus";
  const isRowActions = column?.field_name === "row_actions";
  const isDisplayColumn = [
    "mrt-row-select",
    "mrt-row-expand",
    "mrt-row-actions",
  ].includes(column?.field_name);
  // default is when it is not a datetime or decimal
  const isDefault =
    !isDateTime &&
    !isDecimal &&
    !isExternalLink &&
    !isPrimaryKey &&
    !isFilePath &&
    !isDisplayColumn &&
    !isReveal &&
    !isSessionLink &&
    !isExecutionStatus &&
    !isRowActions;
  return {
    id: column?.field_name,
    header: column?.field_name,
    ...(column?.filter_variant && {
      filterVariant: column.filter_variant,
      filterFn: column.filter_fn,
    }),
    ...(isDefault && {
      accessorKey: column?.field_name,
    }),
    ...(column?.aggregation_fn && {
      aggregationFn: column?.aggregation_fn,
      AggregatedCell: ({ cell }) => {
        if (isDateTime) {
          return (
            <DateTime
              {...column}
              value={cell.getValue()}
              display_format={column.display_format ?? "yyyy-MM-dd"}
              record={cell.row.original}
            />
          );
        } else {
          return <div>{JSON.stringify(cell.getValue())}</div>;
        }
      },
    }),
    ...(isDisplayColumn && {
      columnDefType: "display",
    }),
    ...(isRowActions && {
      columnDefType: "display", //turns off data column features like sorting, filtering, etc.
      enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
      Cell: ({ row }) => <RowActions record={row.original}></RowActions>,
    }),
    ...(isDateTime && {
      accessorFn: (row) => new Date(row[column.field_name] ?? ""),
      Cell: ({ row }) => (
        <DateTime
          {...column}
          value={row.original[column.field_name]}
          record={row.original}
          display_format={column.display_format ?? "yyyy-MM-dd"}
        />
      ),
    }),
    ...(isDecimal && {
      // Convert strings to numbers and replace null or undefined with 0
      accessorFn: (row) => {
        const value = row[column.field_name];
        return value ? Number(value) : 0;
      },
      Cell: ({ row }) => (
        <Decimal
          {...column}
          value={row.original[column.field_name]}
          display_format={column.display_format ?? ""}
          record={row.original}
        />
      ),
    }),
    ...(isExternalLink && {
      Cell: ({ row }) => (
        <ExternalLink
          {...column}
          value={row.original[column.field_name]}
          display_format={column.display_format ?? ""}
          display_component_content={column.display_component_content}
          record={row.original}
        />
      ),
    }),

    ...(isSessionLink && {
      Cell: ({ row }) => (
        <SessionLink
          {...column}
          value={row.original[column.field_name]}
          record={row.original}
          display_component_content={column.display_component_content ?? null}
        />
      ),
    }),
    ...(isPrimaryKey && {
      Cell: ({ row }) => (
        <PrimaryKey
          {...column}
          value={row.original[column.field_name]}
          record={row.original}
          display_component_content={column.display_component_content ?? null}
        />
      ),
    }),
    ...(isFilePath && {
      Cell: ({ row }) => (
        <FilePath
          {...column}
          value={row.original[column.field_name]}
          record={row.original}
          display_component_content={column.display_component_content ?? null}
        />
      ),
    }),
    ...(isReveal && {
      Cell: ({ row }) => (
        <Reveal
          value={row.original[column.field_name]}
          resource={column?.field_name}
        />
      ),
    }),
  };
}

// export function useDataColumns(columns: FieldConfiguration[]) {
//   return useMemo(() => {
//     return columns
//       .filter((column) => column?.visible)
//       .map((column) => createColumnDef<RowData>(column));
//   }, [columns]);
// }

export function useDataColumns(columns: FieldConfiguration[], tableId: string) {
  return useMemo(() => {
    return columns
      .filter((column) => column?.visible)
      .map((column, index) => ({
        ...createColumnDef<RowData>(column),
        // id: `${tableId}-${column.field_name}-${index}`, // Adjusting the ID to include the tableId
        id: `${tableId}-${column.field_name}`, // Adjusting the ID to include the tableId
      }));
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

  fields.forEach(({ field_name }) => {
    // If the dataObject has the key specified in the field configuration, add it to the result
    if (dataObject.hasOwnProperty(field_name)) {
      result[field_name] = dataObject[field_name];
    }
  });

  return result;
}

// Adjust your componentMapping to explicitly use this type for its keys
export const componentMapping: Record<ComponentKey, React.ElementType> = {
  TextInput: TextInput,
  Textarea: Textarea,
  DateInput: DateInput,
  MultiSelect: MultiSelect,
  Select: Select,
  NumberInput: NumberInput,
  trips: ViewTrip,
  bookings: ViewBooking,
  payments: ViewPayment,
  test_runs: ViewTestRun,
  files: ViewFile,
  applications: ViewApplication,
  tasks: ViewTask,
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

export function useAuthToken() {
  const { data: identity } = useGetIdentity<IIdentity>();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuthToken = async () => {
      setLoading(true);
      const auth_token = localStorage.getItem("cmt_auth_token");
      if (auth_token) {
        console.log("Data already in localStorage", JSON.parse(auth_token));
        setToken(auth_token);
        setLoading(false);
        return;
      }
      try {
        const formData = new URLSearchParams();
        formData.append("username", identity?.email);
        formData.append("password", identity?.email);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Failed to fetch auth token");

        const data = await response.json();
        localStorage.setItem("cmt_auth_token", JSON.stringify(data));
        setToken(JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (identity) {
      fetchAuthToken();
    }
  }, [identity]); // Re-run when `identity` changes

  return { token, loading, error };
}

type RecordIdentifier = {
  id: string;
  name: string;
};

export function extractIdentifier(activeRecord: any): RecordIdentifier | null {
  // Define the keys in the priority order you want to check
  const keysToCheck: string[] = ["id", "flight_pnr", "trip_id", "test_id"];

  for (let key of keysToCheck) {
    if (activeRecord?.[key]) {
      return { id: activeRecord[key], name: key };
    }
  }

  // Return null or any other default value if no keys are found
  return null;
}

export function useFetchActionById(actionId: string | null) {
  const [action, setAction] = useState<IAction | null>(null);
  const { data, error, isLoading } = useOne<IAction, HttpError>({
    resource: "actions",
    id: `${actionId}`,
  });

  useEffect(() => {
    if (!isLoading && data && !error) {
      setAction(data.data);
    }
  }, [data, isLoading, error]);

  return { action, isLoading, error };
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

// Helper function to get component by resource type
export function getComponentByResourceType(resourceType: ComponentKey) {
  const Component = componentMapping[resourceType];
  if (!Component) {
    throw new Error(`Component for resource type "${resourceType}" not found`);
  }
  return Component;
}
