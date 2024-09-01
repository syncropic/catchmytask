import { DataProvider } from "@refinedev/core";
import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { axiosInstance, generateFilter, generateSort } from "./utils";
import { addSeparator, formatIdWithPrefix } from "src/utils";
import { useSession } from "next-auth/react";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

// // Function to get the stored token
// const getToken = () => {
//   const { data: session, status } = useSession();
//   return session?.token?.account?.access_token;
//   // let auth_token = localStorage.getItem("cmt_auth_token");
//   // return auth_token ? JSON.parse(auth_token).access_token : "";
// };

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
  | "and"
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
  operator: Exclude<Operator, "or" | "and" | "null" | "nnull">;
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

// Interface for 'and' conditions allowing nested filters
interface AndFilter {
  operator: "and";
  value: Filter[];
}

type Filter = BaseFilter | OrFilter | NullFilter | AndFilter;

// Function to generate a WHERE clause from an array of filters
function generateWhereClause(filters: Filter[]): string {
  const processValue = (value: any, operator: Operator): string => {
    switch (operator) {
      case "in":
      case "nin":
        return `(${value.map((val: any) => `'${val}'`).join(", ")})`;
      case "between":
      case "nbetween":
        return `${value[0]} AND ${value[1]}`;
      default:
        return typeof value === "string" ? `'${value}'` : value.toString();
    }
  };

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
      case "containss":
      case "startswith":
      case "startswiths":
      case "endswith":
      case "endswiths":
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

  const processFilter = (filter: Filter): string => {
    if ("value" in filter) {
      let operator = translateOperator(filter.operator);
      if (filter.operator === "or" || filter.operator === "and") {
        const conjunction = filter.operator.toUpperCase();
        const conditions = filter.value
          .map((subFilter) => `(${processFilter(subFilter)})`)
          .join(` ${conjunction} `);
        return `(${conditions})`;
      } else {
        const value = processValue(filter.value, filter.operator);
        return `${filter.field} ${operator} ${value}`;
      }
    } else {
      // Handles NullFilter
      let operator = translateOperator(filter.operator);
      return `${filter.field} ${operator}`;
    }
  };

  const conditions = filters
    .map((filter) => processFilter(filter))
    .join(" AND ");
  return conditions ? `WHERE ${conditions}` : "";
}

export const dataProvider = (
  apiUrl: string,
  getToken: () => string,
  getStateIds: () => any,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    // const url = `${apiUrl}/${resource}`;
    const url = `${apiUrl}/read`;

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
      ...getStateIds(),
      ...headersFromMeta,
    };
    // Generate the WHERE clause
    const whereClause = filters ? generateWhereClause(filters) : "";

    // Example usage in a SurrealDBQL query
    const formatted_query = `SELECT * FROM ${resource} ${whereClause};`;

    // console.log(formatted_query);

    // let payload = {
    //   global_variables: {},
    //   include_action_steps: [1],
    //   action_steps: [
    //     {
    //       id: "1",
    //       execution_order: 1,
    //       tool: "retrieve",
    //       tool_arguments: {
    //         queries: [
    //           {
    //             query: formatted_query,
    //             credential: meta?.credentials ?? "surrealdb_catchmytask",
    //             params: {},
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // };
    let payload = {
      task_variables: {},
      global_variables: {},
      include_action_steps: [1],
      action_steps: [
        {
          id: "1",
          execution_order: 1,
          description: "Retrieve data",
          name: "retrieve_data",
          job: "retrieve data",
          action_step_query: formatted_query,
          method: "get",
          type: "main",
          credential: meta?.credentials || "surrealdb catchmytask dev",
          select: {
            query: formatted_query,
            credential: meta?.credentials ?? "surrealdb catchmytask dev",
          },
        },
      ],
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
      ...getStateIds(),
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
    const url = `${apiUrl}/read`;
    const { headers: headersFromMeta, method } = meta ?? {};

    // const { headers, method } = meta ?? {};
    // const requestMethod = (method as MethodTypes) ?? "get";

    //  // Generate the WHERE clause
    //  const whereClause = generateWhereClause(filters);
    // add Authorization header
    const headers_with_Authorization = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...getStateIds(),
      ...headersFromMeta,
    };

    const idWithSeparator = formatIdWithPrefix(id, resource);
    // console.log("idWithSeparator", idWithSeparator);

    // Example usage in a SurrealDBQL query
    const formatted_query = `SELECT * FROM ${idWithSeparator};`;

    // console.log(formatted_query);

    // let payload = {
    //   global_variables: {},
    //   include_execution_orders: [1],
    //   action_steps: [
    //     {
    //       id: "1",
    //       execution_order: 1,
    //       tool: "retrieve",
    //       tool_arguments: {
    //         queries: [
    //           {
    //             query: formatted_query,
    //             credential: meta?.credentials ?? "surrealdb_catchmytask",
    //             params: {},
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // };
    let payload = {
      task_variables: {},
      global_variables: {},
      include_action_steps: [1],
      action_steps: [
        {
          id: "1",
          execution_order: 1,
          description: "Retrieve data",
          name: "retrieve_data",
          job: "retrieve data",
          action_step_query: formatted_query,
          method: "get",
          type: "main",
          credential: meta?.credentials || "surrealdb catchmytask dev",
          select: {
            query: formatted_query,
            credential: meta?.credentials ?? "surrealdb catchmytask dev",
          },
        },
      ],
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
      ...getStateIds(),
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
