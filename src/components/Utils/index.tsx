import Decimal from "@components/Decimal";
import ExternalLink from "@components/ExternalLink";
import FilePath from "@components/FilePath";
import PrimaryKey from "@components/PrimaryKey";
import Reveal from "@components/Reveal";
import {
  FieldConfiguration,
  IIdentity,
  ISubscription,
  RowData,
} from "@components/interfaces";
import { MultiSelect, TextInput, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { HttpError, useGetIdentity, useList } from "@refinedev/core";
import { MRT_ColumnDef } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import DateTime from "src/components/DateTime";
import { useAppStore } from "src/store";

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
  // default is when it is not a datetime or decimal
  const isDefault =
    !isDateTime &&
    !isDecimal &&
    !isExternalLink &&
    !isPrimaryKey &&
    !isFilePath;
  return {
    id: column?.field_name,
    header: column?.field_name,
    ...(isDefault && {
      accessorKey: column?.field_name,
    }),
    ...(isDateTime && {
      accessorFn: (row) => new Date(row[column.field_name] ?? ""),
      Cell: ({ row }) => (
        <DateTime
          value={row.original[column.field_name]}
          displayFormat={column.display_format ?? "yyyy-MM-dd"}
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
          value={row.original[column.field_name]}
          displayFormat={column.display_format ?? ""}
        />
      ),
    }),
    ...(isExternalLink && {
      Cell: ({ row }) => (
        <ExternalLink
          value={row.original[column.field_name]}
          displayFormat={column.display_format ?? ""}
          displayComponentContent={column.display_component_content}
        />
      ),
    }),
    ...(isPrimaryKey && {
      Cell: ({ row }) => (
        <PrimaryKey
          value={row.original[column.field_name]}
          record={row.original}
          displayComponentContent={column.display_component_content ?? null}
        />
      ),
    }),
    ...(isFilePath && {
      Cell: ({ row }) => (
        <FilePath
          value={row.original[column.field_name]}
          record={row.original}
          displayComponentContent={column.display_component_content ?? null}
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
    ...(column?.filter_variant && {
      filterVariant: column.filter_variant,
      filterFn: column.filter_fn,
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
        id: `${tableId}-${column.field_name}-${index}`, // Adjusting the ID to include the tableId
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
  fieldConfigurations: FieldConfiguration[]
): Record<string, any> {
  const result: Record<string, any> = {};

  fieldConfigurations.forEach(({ field_name }) => {
    // If the dataObject has the key specified in the field configuration, add it to the result
    if (dataObject.hasOwnProperty(field_name)) {
      result[field_name] = dataObject[field_name];
    }
  });

  return result;
}

export const componentMapping = {
  TextInput: TextInput,
  Textarea: Textarea,
  DateInput: DateInput,
  MultiSelect: MultiSelect,
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
