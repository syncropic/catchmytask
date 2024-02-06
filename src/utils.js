import { format, parseISO, set } from "date-fns";

export function removeSeparator(id) {
  const separator = ":";
  const separatorIndex = id.indexOf(separator);

  if (separatorIndex !== -1) {
    return id.slice(0, separatorIndex) + id.slice(separatorIndex + 1);
  }

  // Return original ID if separator is not found
  return id;
}

export function addSeparator(id, prefix) {
  const separator = ":";

  if (id?.startsWith(prefix)) {
    return id.slice(0, prefix.length) + separator + id.slice(prefix.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function removePrefix(id, prefix) {
  const separator = ":";
  const prefixWithSeparator = `${prefix}${separator}`;

  if (id?.startsWith(prefixWithSeparator)) {
    return id?.substring(prefixWithSeparator.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function addPrefix(id, prefix) {
  const separator = ":";
  return `${prefix}${separator}${id}`;
}

export function formatDateTimeAsDate(date) {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    // Handle as string
    return format(parseISO(date), "yyyy-MM-dd");
  } else {
    // Handle as Date object
    return format(date, "yyyy-MM-dd");
  }
}

export function formatDateTimeAsDateTime(date) {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    // Handle as string
    return format(parseISO(date), "yyyy-MM-dd hh:mm a");
  } else {
    // Handle as Date object
    return format(date, "yyyy-MM-dd hh:mm a");
  }
}

// HANDLE EXECUTE/RUN
export const handleRun = ({
  task,
  action_step,
  record,
  resource,
  mutate,
  identity,
  invalidateCallback,
}) => {
  let request_data = {
    ...task,
    task_input: {
      ...task?.task_input,
      get_collection_info_1: {
        ...task?.task_input?.get_collection_info_1,
        end_date: formatDateTimeAsDateTime(new Date()),
        start_date: formatDateTimeAsDateTime(new Date()),
      },
      create_email_message_1: {
        email_type: record?.email_type,
        personal_message: record?.custom_message,
        internal_message: record?.custom_message,
        custom_message: record?.custom_message,
      },
      send_email_message_1: {
        mail_list: record?.mail_list,
      },
      generate_sql_query_1: {
        text_query: task?.task_input?.generate_sql_query_1?.text_query
          ?.replace("${start_date}", record?.start_date)
          .replace("${end_date}", record?.end_date),
      },
      generate_sql_query_2: {
        text_query: task?.task_input?.generate_sql_query_2?.text_query
          ?.replace("${start_date}", record?.start_date)
          .replace("${end_date}", record?.end_date),
      },
    },
    task: {
      ...task?.task,
      id: action_step?.in,
    },
    destination: {
      ...task?.destination,
      record: addSeparator(record?.id, resource),
    },
  };

  // Conditionally adding execution_orders_range
  if (action_step) {
    request_data.options = {
      ...task?.options,
      execution_orders_range: [
        action_step.execution_order,
        action_step.execution_order,
      ],
    };
    request_data.values = {
      action_step_id: addSeparator(action_step?.id, "execute"),
      task_id: action_step?.in,
      resource: resource,
      author: identity?.email,
      record: addSeparator(record?.id, resource),
    };
    request_data.task = {
      ...task?.task,
      id: action_step?.in, // this is already known if running an action_step on an existing task
    };
  } else {
    request_data.options = {
      ...task?.options,
    };
    request_data.values = {
      // action_step_id: addSeparator(action_step?.id, "execute"),
      // task_id: action_step?.in,
      resource: resource,
      author: identity?.email,
      record: addSeparator(record?.id, resource),
    };
    request_data.task = {
      ...task?.task,
      // id: will fill in when task is generated
    };
  }
  console.log(request_data);
  // mutate({
  //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
  //   method: "post",
  //   values: request_data,
  //   successNotification: (data, values) => {
  //     invalidateCallback();
  //     return {
  //       message: `successfully executed.`,
  //       description: "Success with no errors",
  //       type: "success",
  //     };
  //   },
  //   errorNotification: (data, values) => {
  //     return {
  //       message: `Something went wrong when executing`,
  //       description: "Error",
  //       type: "error",
  //     };
  //   },
  // });
};

// Example options for the select, replace with actual data source
export const dateTypeOptions = [
  {
    value: "reporting_date",
    label: "reporting_date",
  },
  {
    value: "booking_date",
    label: "booking_date",
  },
  {
    value: "travelling_date",
    label: "travelling_date",
  },
];

export const emailTypeOptions = [
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
