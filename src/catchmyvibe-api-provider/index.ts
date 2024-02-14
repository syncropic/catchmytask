import { DataProvider } from "@refinedev/core";
import { axiosInstance, generateSort, generateFilter } from "./utils";
import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { getDb } from "./db";
import { removeSeparator, addSeparator } from "src/utils";
import { add } from "date-fns";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

export const dataProvider = (
  apiUrl: string,
  db: any = getDb(),
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    // console.log("resource", resource);
    // console.log("pagination", pagination);
    // console.log("filters", filters);
    // console.log("sorters", sorters);
    // console.log("meta", meta);

    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const queryFilters = generateFilter(filters);

    const query: {
      _start?: number;
      _end?: number;
      _sort?: string;
      _order?: string;
    } = {};

    if (mode === "server") {
      query._start = (current - 1) * pageSize;
      query._end = current * pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;
      query._sort = _sort.join(",");
      query._order = _order.join(",");
    }

    // const { data, headers } = await httpClient[requestMethod](
    //   `${url}?${stringify(query)}&${stringify(queryFilters)}`,
    //   {
    //     headers: headersFromMeta,
    //   }
    // );

    // const total = +headers["x-total-count"];

    // return {
    //   data,
    //   total: total || data.length,
    // };
    // console.log(queryFilters);
    // Select all records from a table
    // const data = await db.select(resource);
    const queryFiltersString = null;
    // let queryString = null;
    let fields = meta?.fields;
    // if fields is not null, then let us create a string of the fields
    let fieldsString = null;
    if (fields) {
      const quotedArray = fields.map((element) => `${element}`);
      fieldsString = quotedArray.join(", ");
    } else {
      fieldsString = "*";
    }

    // view
    // let view = meta?.view;
    // let viewId = addSeparator(view, "views");

    // Modular function to create a query string for filters
    function createFilterString(queryFilters: any): string {
      return Object.keys(queryFilters)
        .map((key) => `${key} = '${queryFilters[key]}'`)
        .join(" AND ");
    }

    // Function to create the query string based on conditions
    function createQueryString(
      fieldsString: string,
      resource: string,
      viewId: string | null,
      queryFilters: any
    ): string {
      if (Object.keys(queryFilters).length > 0) {
        const queryFiltersString = createFilterString(queryFilters);
        return `SELECT ${fieldsString} FROM ${resource} WHERE ${queryFiltersString}`;
      } else if (viewId) {
        return `
          RETURN {
            LET $${resource} = SELECT ->displays.out.* AS ${resource} FROM ${viewId};
            RETURN array::at($${resource}.${resource}, 0)
          }`;
      } else {
        return `SELECT ${fieldsString} FROM ${resource}`;
      }
    }

    let viewId = meta?.view ? addSeparator(meta.view, "views") : null;

    const queryString = createQueryString(
      fieldsString,
      resource,
      viewId,
      queryFilters
    );

    // // Check if the object has at least one key
    // if (Object.keys(queryFilters).length > 0) {
    //   // console.log(queryFilters);
    //   // create a string of the filters i.e key = value
    //   const queryFiltersString = Object.keys(queryFilters)
    //     .map((key) => `${key} = '${queryFilters[key]}'`)
    //     .join(" AND ");
    //   // console.log(queryFiltersString);
    //   queryString = `SELECT ${fieldsString} FROM ${resource} WHERE ${queryFiltersString}`;
    // } else {
    //   // queryString = `SELECT ${fieldsString} FROM ${resource}`;
    //   // queryString = `SELECT ->displays.out.name AS music FROM ${viewId}`;
    //   queryString = `
    //   RETURN {
    //     LET $music = SELECT ->displays.out.* AS music FROM ${viewId};
    //     RETURN array::at($music.music, 0)
    //   }`;
    // }

    const dataResult = await db.query(queryString);
    const data = dataResult[0];
    // remove prefix from the id of the record in data
    data.map((record: any) => {
      record.id = removeSeparator(record.id);
    });
    return {
      data: data,
      total: data.length,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    // const { data } = await httpClient[requestMethod](
    //   `${apiUrl}/${resource}?${stringify({ id: ids })}`,
    //   { headers }
    // );
    const data = await db.select("page");
    console.log(resource);

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    // const { data } = await httpClient[requestMethod](url, variables, {
    //   headers,
    // });
    const [data] = await db.select("page:3u4ta9099ikeg0cgy4dm");

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "patch";

    // const { data } = await httpClient[requestMethod](url, variables, {
    //   headers,
    // });
    // console.log(variables);
    const idWithSeparator = addSeparator(id, resource);
    const [data] = await db.update(idWithSeparator, variables);
    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    // const url = `${apiUrl}/${resource}/${id}`;

    // const { headers, method } = meta ?? {};
    // const requestMethod = (method as MethodTypes) ?? "get";

    // const { data } = await httpClient[requestMethod](url, { headers });
    const idWithSeparator = addSeparator(id, resource);
    const [data] = await db.select(`${idWithSeparator}`);

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    // const { data } = await httpClient[requestMethod](url, {
    //   data: variables,
    //   headers,
    // });
    const [data] = await db.select("page:3u4ta9099ikeg0cgy4dm");

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
    // let requestUrl = `${url}?`;

    // if (sorters) {
    //   const generatedSort = generateSort(sorters);
    //   if (generatedSort) {
    //     const { _sort, _order } = generatedSort;
    //     const sortQuery = {
    //       _sort: _sort.join(","),
    //       _order: _order.join(","),
    //     };
    //     requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
    //   }
    // }

    // if (filters) {
    //   const filterQuery = generateFilter(filters);
    //   requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
    // }

    // if (query) {
    //   requestUrl = `${requestUrl}&${stringify(query)}`;
    // }

    // let axiosResponse;
    // switch (method) {
    //   case "put":
    //   case "post":
    //   case "patch":
    //     axiosResponse = await httpClient[method](url, payload, {
    //       headers,
    //     });
    //     break;
    //   case "delete":
    //     axiosResponse = await httpClient.delete(url, {
    //       data: payload,
    //       headers: headers,
    //     });
    //     break;
    //   default:
    //     axiosResponse = await httpClient.get(requestUrl, {
    //       headers,
    //     });
    //     break;
    // }

    // const { data } = axiosResponse;

    // return Promise.resolve({ data });
    // const [data] = await db.query(query);
    // return Promise.resolve({ data });
    console.log(query);
    return await db.query(query);
  },
});

export default dataProvider;
