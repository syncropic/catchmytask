export const views = [
  {
    value: "table",
    label: "Table",
  },
  {
    value: "json",
    label: "Json",
  },
  {
    value: "spreadsheet",
    label: "Spreadsheet",
  },
  // {
  //   value: "list",
  //   label: "List",
  // },
  // {
  //   value: "grid",
  //   label: "Grid",
  // },
  // {
  //   value: "text_editor",
  //   label: "Text Editor",
  // },
  // {
  //   value: "code_editor",
  //   label: "Code Editor",
  // },
  // {
  //   value: "conversation",
  //   label: "Conversation",
  // },
  // {
  //   value: "image_editor",
  //   label: "Image Editor",
  // },
  // {
  //   value: "audio_editor",
  //   label: "audio Editor",
  // },
  // {
  //   value: "video_editor",
  //   label: "video Editor",
  // },
  // {
  //   value: "application_embeds",
  //   label: "Application Embeds",
  // },
];

export const inputs = [
  {
    value: "form",
    label: "Form",
  },
  {
    value: "json",
    label: "Json",
  },
  // {
  //   value: "natural_language",
  //   label: "Natural Language",
  // },
  // {
  //   value: "structured_query",
  //   label: "Structured Query",
  // },
];

export const aggregate_views = [
  {
    value: "main_results",
    label: "Main Results",
    visible: true,
  },
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
    label: "Descriptive Statistics",
    visible: false,
  },
  {
    value: "charts",
    label: "Charts",
    visible: false,
  },
];
// data query mapping
export const public_data_mapping: public_data_mapping = {
  service: "SELECT * FROM services",
  service_id: "SELECT * FROM services",
};

// type public_data_mapping  a key with a value of a string
export type public_data_mapping = {
  [key: string]: string;
};

export const commonFieldConfigurations = [
  {
    data_type: "string",
    input_component: "Select",
    field_name: "service",
    visible: true,
    searchable: true,
  },
  {
    data_type: "string",
    input_component: "Select",
    field_name: "service_id",
    visible: true,
    searchable: true,
  },
  {
    data_type: "string",
    field_name: "id",
    input_component: "TextInput",
    visible: false,
    searchable: true,
  },
];

export const commonFieldConfigurationsDraft = [
  {
    data_type: "string",
    display_component: "Select",
    field_name: "service",
    visible: true,
  },
  {
    data_type: "string",
    enable_column_filter_modes: true,
    field_name: "id",
    visible: false,
  },
  {
    data_type: "varchar",
    enable_column_filter_modes: true,
    field_name: "queue_item_status",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    data_type: "datetime",
    display_component: "DateTime",
    display_format: "yyyy-MM-dd",
    field_name: "reporting_date",
    filter_fn: "betweenInclusive",
    filter_variant: "date-range",
    pin: "left",
    sorting_fn: "datetime",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "sst_booking_number",
    pin: "left",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "sst_passenger_name",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "sst_supplier_name",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "sst_booking_type",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "sst_status",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    conditional_formatting: {
      field_name: "payment_status_comparison",
      rules: [
        {
          class: "bg-green-500",
          value: "match",
        },
        {
          class: "bg-red-500",
          value: "mismatch",
        },
        {
          class: "bg-gray-500",
          value: "check_manually",
        },
      ],
    },
    data_type: "nvarchar",
    field_name: "payment_status",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    data_type: "varchar",
    enable_column_filter_modes: true,
    field_name: "payment_status_comparison",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    data_type: "int",
    field_name: "payment_succeeded_count",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "payment_ids",
    visible: true,
  },
  {
    data_type: "numeric",
    field_name: "payment_amount_captured_total",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "varchar",
    field_name: "payment_currencies",
    visible: true,
  },
  {
    data_type: "numeric",
    field_name: "payment_amount_to_usd_rate",
    visible: true,
  },
  {
    conditional_formatting: {
      field_name: "payment_amount_usd_comparison",
      rules: [
        {
          class: "bg-red-500",
          value: "high_positive_difference",
        },
        {
          class: "bg-red-500",
          value: "high_negative_difference",
        },
        {
          class: "bg-orange-500",
          value: "medium_negative_difference",
        },
        {
          class: "bg-orange-500",
          value: "low_negative_difference",
        },
        {
          class: "bg-green-500",
          value: "match",
        },
        {
          class: "bg-green-500",
          value: "low_positive_difference",
        },
        {
          class: "bg-green-500",
          value: "medium_positive_difference",
        },
        {
          class: "bg-green-500",
          value: "low_negative_difference",
        },
        {
          class: "bg-red-500",
          value: "high_negative_difference",
        },
      ],
    },
    data_type: "numeric",
    field_name: "payment_amount_captured_usd_total",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "decimal",
    field_name: "sst_final_selling_price_usd",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "numeric",
    field_name: "payment_amount_usd_difference",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "varchar",
    enable_column_filter_modes: true,
    field_name: "payment_amount_usd_comparison",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
  {
    conditional_formatting: {
      field_name: "individual_costs_and_final_usd_comparison",
      rules: [
        {
          class: "bg-orange-500",
          value: "high_positive_difference",
        },
        {
          class: "bg-red-500",
          value: "high_negative_difference",
        },
        {
          class: "bg-green-500",
          value: "match",
        },
        {
          class: "bg-green-500",
          value: "low_positive_difference",
        },
        {
          class: "bg-green-500",
          value: "low_negative_difference",
        },
      ],
    },
    data_type: "numeric",
    field_name: "individual_costs_sum_usd",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "numeric",
    field_name: "individual_costs_and_final_usd_difference",
    filter_fn: "betweenInclusive",
    filter_variant: "range-slider",
    visible: true,
  },
  {
    data_type: "varchar",
    enable_column_filter_modes: true,
    field_name: "individual_costs_and_final_usd_comparison",
    filter_fn: "arrIncludesSome",
    filter_variant: "multi-select",
    visible: true,
  },
];
