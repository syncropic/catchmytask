import { DataProvider } from "@refinedev/core";
import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { axiosInstance, generateFilter, generateSort } from "./utils";
import { addSeparator, formatIdWithPrefix } from "src/utils";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

// Function to get the stored token
const getToken = () => {
  let auth_token = localStorage.getItem("cmt_auth_token");
  return auth_token ? JSON.parse(auth_token).access_token : "";
};

// Define supported operators
type Operator =
  | "eq"
  | "ne"
  | "lt"
  | "gt"
  | "lte"
  | "gte"
  | "in"
  | "nin"
  | "contains"
  | "ncontains"
  | "containss"
  | "ncontainss"
  | "between"
  | "nbetween"
  | "null"
  | "nnull"
  | "or"
  | "startswith"
  | "nstartswith"
  | "startswiths"
  | "nstartswiths"
  | "endswith"
  | "nendswith"
  | "endswiths"
  | "nendswiths";

// Base interface for filters excluding 'or', 'null', and 'nnull' which are handled separately
interface BaseFilter {
  field: string;
  operator: Exclude<Operator, "or" | "null" | "nnull">;
  value: any; // The type can be more specific based on your needs, such as string | number | string[] | number[]
}

// Filters for checking 'null' and 'nnull' conditions which don't require a 'value'
interface NullFilter {
  field: string;
  operator: "null" | "nnull";
}

// Interface for 'or' conditions allowing nested filters
interface OrFilter {
  operator: "or";
  value: Filter[];
}

// Union type representing any possible filter
type Filter = BaseFilter | OrFilter | NullFilter;

// Function to generate a WHERE clause from an array of filters
function generateWhereClause(filters: Filter[]): string {
  // Process a single value based on the operator to handle SQL syntax correctly
  const processValue = (value: any, operator: Operator): string => {
    // console.log("value", value); // Check the actual structure of value
    // const mappedValues = value.map((val: any) => `'${val}'`);
    // console.log("mappedValues", mappedValues); // Inspect the mapped (quoted) values
    // const result = `(${mappedValues.join(", ")})`;
    // console.log("result", result); // See the final result before return
    switch (operator) {
      case "in":
      case "nin":
        // Map each value to a single-quoted string and join with commas, enclosed in parentheses
        return `[${value.map((val: any) => `'${val}'`).join(", ")}]`;
      case "between":
      case "nbetween":
        // Handle two values for 'BETWEEN'
        return `${value[0]} AND ${value[1]}`;
      default:
        // Default handling, adds quotes if the value is a string
        return typeof value === "string" ? `'${value}'` : value.toString();
    }
  };

  // Translate our custom operators to SQL operators
  const translateOperator = (operator: Operator): string => {
    switch (operator) {
      case "eq":
        return "=";
      case "ne":
        return "!=";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "lte":
        return "<=";
      case "gte":
        return ">=";
      case "in":
        return "IN";
      case "nin":
        return "NOT IN";
      case "contains":
      case "containss": // Assuming SQL LIKE for simplicity; might need adjustment for case sensitivity
      case "startswith":
      case "startswiths": // Simplified to LIKE, specific handling for the value required
      case "endswith":
      case "endswiths": // Simplified to LIKE, specific handling for the value required
        return "LIKE";
      case "ncontains":
      case "ncontainss":
      case "nstartswith":
      case "nstartswiths":
      case "nendswith":
      case "nendswiths":
        return "NOT LIKE";
      case "between":
        return "BETWEEN";
      case "nbetween":
        return "NOT BETWEEN";
      case "null":
        return "IS NULL";
      case "nnull":
        return "IS NOT NULL";
      default:
        return operator;
    }
  };

  // Enhanced version of the processFilter function with type guards
  const processFilter = (filter: Filter): string => {
    if ("value" in filter) {
      // This block will now only process filters that have a 'value' property (i.e., BaseFilter and OrFilter)

      let operator = translateOperator(filter.operator);

      if (filter.operator === "or") {
        // Handle 'OR' conditions by recursively processing nested filters
        const orConditions = filter.value
          .map((subFilter) => `(${processFilter(subFilter)})`)
          .join(" OR ");
        return `(${orConditions})`;
      } else {
        // Process the value for all other conditions where 'value' is present
        const value = processValue(filter.value, filter.operator);
        return `${filter.field} ${operator} ${value}`;
      }
    } else {
      // This block will handle NullFilter, which does not have a 'value' property
      let operator = translateOperator(filter.operator);
      return `${filter.field} ${operator}`;
    }
  };

  // Join individual conditions with 'AND', forming the complete WHERE clause
  const conditions = filters
    .map((filter) => processFilter(filter))
    .join(" AND ");
  return conditions ? `WHERE ${conditions}` : "";
}

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    // const url = `${apiUrl}/${resource}`;
    const url = `${apiUrl}/query`;

    // const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    // const requestMethod = (method as MethodTypes) ?? "get";
    const requestMethod = (method as MethodTypes) ?? "post";

    // const queryFilters = generateFilter(filters);
    // console.log("filters", filters);

    const query: {
      _start?: number;
      _end?: number;
      _sort?: string;
      _order?: string;
    } = {};

    // if (mode === "server") {
    //   query._start = (current - 1) * pageSize;
    //   query._end = current * pageSize;
    // }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;
      query._sort = _sort.join(",");
      query._order = _order.join(",");
    }

    // add Authorization header
    const headers_with_Authorization = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...headersFromMeta,
    };
    // Generate the WHERE clause
    const whereClause = filters ? generateWhereClause(filters) : "";

    // Example usage in a SurrealDBQL query
    const formatted_query = `SELECT * FROM ${resource} ${whereClause};`;

    // console.log(formatted_query);

    let payload = {
      query: formatted_query,
      query_language: meta?.query_language ?? "surrealql",
      credentials: meta?.credentials ?? "surrealdb_catchmytask",
    };
    // console.log("payload", payload);

    // const { data, headers } = await httpClient[requestMethod](
    //   `${url}?${stringify(query)}&${stringify(queryFilters)}`,
    //   payload,
    //   {
    //     headers: headers_with_Authorization,
    //   }
    // );

    const { data, headers } = await httpClient.post(url, payload, {
      headers: headers_with_Authorization,
    });

    // console.log("data length", data?.length);
    // console.log("data", data);
    const total = +headers["x-total-count"];
    return {
      data,
      total: total || data.length,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](
      `${apiUrl}/${resource}?${stringify({ id: ids })}`,
      { headers }
    );
    // const data = await db.select("page");
    // console.log(resource);
    // const data: never[] = [];

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    // add Authorization header
    const headers_with_Authorization = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...headers,
    };
    console.log(headers_with_Authorization);
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers: headers_with_Authorization,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "patch";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });
    // console.log(variables);
    // const idWithSeparator = addSeparator(id, resource);
    // const [data] = await db.update(idWithSeparator, variables);
    // const [data]: never[] = [];
    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/query`;
    const { headers: headersFromMeta, method } = meta ?? {};

    // const { headers, method } = meta ?? {};
    // const requestMethod = (method as MethodTypes) ?? "get";

    //  // Generate the WHERE clause
    //  const whereClause = generateWhereClause(filters);
    // add Authorization header
    const headers_with_Authorization = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...headersFromMeta,
    };

    const idWithSeparator = formatIdWithPrefix(id, resource);
    // console.log("idWithSeparator", idWithSeparator);

    // Example usage in a SurrealDBQL query
    const formatted_query = `SELECT * FROM ${idWithSeparator};`;

    // console.log(formatted_query);

    let payload = {
      query: formatted_query,
      query_language: meta?.query_language ?? "surrealql",
      credentials: meta?.credentials ?? "surrealdb_catchmytask",
    };

    // const { data } = await httpClient[requestMethod](url, { headers });
    const { data, headers } = await httpClient.post(url, payload, {
      headers: headers_with_Authorization,
    });
    // const idWithSeparator = addSeparator(id, resource);
    // const [data] = await db.select(`${idWithSeparator}`);
    // const [data]: never[] = [];
    return {
      data: data[0],
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });
    // const [data] = await db.select("page:3u4ta9099ikeg0cgy4dm");
    // const [data]: never[] = [];

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
    let requestUrl = `${url}?`;

    // let requestMethod = method ?? "post";

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = {
          _sort: _sort.join(","),
          _order: _order.join(","),
        };
        requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${stringify(query)}`;
    }

    // add Authorization header
    const headers_with_Authorization = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...headers,
    };
    // console.log("headers_with_Authorization", headers_with_Authorization);
    // console.log("payload", payload);
    // console.log("method", method);

    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient.post(url, payload, {
          headers: headers_with_Authorization,
        });
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers: headers_with_Authorization,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers: headers_with_Authorization,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});

export default dataProvider;
