import { MRT_TableInstance } from "mantine-react-table";

export interface IApplication {
  id: string;
  name: string;
  heading: string;
  subheading: string;
  description: string;
}
export interface IBooking {
  [key: string]: any;
}

export interface IFile {
  [key: string]: any;
}

export interface IPayment {
  [key: string]: any;
}

export interface ITask {
  [key: string]: any;
}

export interface ITestRun {
  [key: string]: any;
}

export interface ITrip {
  [key: string]: any;
}

export type IIdentity = {
  [key: string]: any;
};

export type IActionsList = {
  name: string;
  id: string;
};

// Define a type for the keys in componentMapping
export type ComponentKey =
  | "TextInput"
  | "Textarea"
  | "DateInput"
  | "MultiSelect"
  | "Select"
  | "NumberInput"
  | "trips"
  | "bookings"
  | "payments"
  | "test_runs"
  | "files"
  | "applications"
  | "tasks"
  | "viewJson"
  | "supplier_issues"
  | "JsonEditor";

// export type IView = {
//   resource_type: ComponentKey;
//   name: string;
//   order: number;
// };

export interface IViewItem {
  actions: IActionsList[];
  active_query: {
    credentials: string;
    query: string;
    query_language: string;
  };
  display_options: any;
  display_components: string[] | null;
  display_name: string | null;
  name: string;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  resource: string;
  order: number;
  data_field: string | null;
  resource_type: ComponentKey;
  render_detail_panel:
    | "SummaryJson"
    | "DetailJson"
    | "SummaryTable"
    | "DetailTable";
}

export interface IView extends IViewItem {
  view: IViewItem[];
}

export interface TableViewComponentProps<T extends Record<string, any>> {
  // data_columns: any[]; // Define more specific type if possible
  resource: string;
  data_columns: T[];
  activeQueryResults: any;
  // data_items: T[];
  // isLoadingDataItems: boolean;
  // view?: IView;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
}

export interface TabularViewComponentProps<T extends Record<string, any>> {
  data_columns: any[]; // Define more specific type if possible
  item: IView;
  resource: string;
  data_items: T[];
  isLoadingDataItems: boolean;
  session?: ISession;
  // initialStateColumnPinningLeft: string[];
  customTableConfig?: any;
  updateTableVisibility: (
    tableInstance: MRT_TableInstance<T>,
    columnsConfig: ColumnConfig[] | null
  ) => void;
}

export interface AutomationActionConfigurationProps<
  T extends Record<string, any>
> {
  automation_values: any;
  // setActionType: (type: string) => void;
  // action_options: Array<{ value: string; label: string; [key: string]: any }>;
  // data_items: any[];
  // identity: any;
  // open: () => void;
  // close: () => void;
  // opened: boolean;
  // record: any;
  // action_step: any;
  // variant?: "inline" | "default";
  // activeActionOption: any;
  // setActiveActionOption: (item: any) => void;
  // data_table: MRT_TableInstance<T>;
}

export interface IExecute {
  id: string;
  in: any;
  out: any;
  execution_order: number;
  kind: string;
  name: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  results: any;
  individual_fields: any[];
  dependencies: any[];
  combined_fields: any[];
  author: string;
  async: boolean;
  callback: boolean;
  context: any;
}

export interface CompleteActionComponentProps<T extends Record<string, any>> {
  // setActionType: (type: string) => void;
  // action_options: Array<{ value: string; label: string; [key: string]: any }>;
  // data_items: any[];
  // identity: any;
  // open: () => void;
  // close: () => void;
  // opened: boolean;
  // action_step: any;
  // variant?: "inline" | "default";
  activeSession: ISession;
  activeAction: IAction;
  activeRecords: any[];
  actionFormFieldValues: any;
  // activeActionOption: any;
  // inputFields: FieldConfiguration[];
  // setActiveActionOption: (item: any) => void;
  // data_table: MRT_TableInstance<T>;
}

export interface ISession {
  active_query: ActiveQuery;
  author: string;
  conditional_formatting: any[];
  created_datetime: Date | string;
  data_models: string[];
  description: string;
  id: string;
  list: ListItem[];
  name: string;
  resource: string;
  session_status: "published" | "draft" | "review";
  updated_datetime: Date | string;
  application: string;
}

export interface ActiveQuery {
  credentials: string;
  query: string;
  query_language: string;
}

export interface ListItem {
  active_query: ActiveQuery;
  display_components: string[];
  display_name: string;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  name: string;
  order: number;
  resource: string;
  resource_type: string;
}

export interface SelectActionComponentProps<T extends Record<string, any>> {
  actions_list: any;
  record: any;
  view_item: IViewItem | null;
}

export interface SelectActionOptionComponentProps<
  T extends Record<string, any>
> {
  action_options: IAction[];
  data_items: any[];
  record: any;
  action_step: any;
  variant?: "inline" | "default";
  data_table: MRT_TableInstance<T>;
  view_item: IViewItem;
}

// export type AggregationFn<TData extends AnyData> = (
//   getLeafRows: () => Row<TData>[],
//   getChildRows: () => Row<TData>[]
// ) => any

export interface IConditionalFormatting {
  field_name: string;
  rules: any[];
}

export interface FieldConfiguration {
  field_name: string;
  display_format: string;
  display_component: string;
  display_name: string;
  display_component_content: any;
  conditional_formatting: IConditionalFormatting;
  data_type?: string;
  filter_variant?:
    | "select"
    | "text"
    | "checkbox"
    | "date"
    | "autocomplete"
    | "date-range"
    | "multi-select"
    | "range"
    | "range-slider";
  filter_fn?: (rowValue: any, filterValue: any) => boolean;
  filter_mode?: string;
  visible: boolean;
  props: any;
  max_size?: number;
  min_size?: number;
  size?: number;
  aggregation_fn?:
    | "sum"
    | "mean"
    | "count"
    | "min"
    | "max"
    | "median"
    | "unique"
    | "uniqueCount";
}

// Extends FieldConfiguration and add the value field
export interface IFieldConfigurationWithValue extends FieldConfiguration {
  value: any;
  record: any;
}

// export interface Column {
//   field_name: string;
//   display_format: string;
//   display_component: string;
//   display_component_content: any;
//   data_type?: string;
//   filter_variant?:
//     | "select"
//     | "text"
//     | "checkbox"
//     | "date"
//     | "autocomplete"
//     | "date-range"
//     | "multi-select"
//     | "range"
//     | "range-slider";
//   filter_fn?: (rowValue: any, filterValue: any) => boolean;
//   filter_mode?: string;
//   visible: boolean;
// }

// export interface InputField {
//   field_name: string;
//   display_format: string;
//   display_component: string;
//   display_component_content: any;
//   data_type?: string;
//   filter_variant?:
//     | "select"
//     | "text"
//     | "checkbox"
//     | "date"
//     | "autocomplete"
//     | "date-range"
//     | "multi-select"
//     | "range"
//     | "range-slider";
//   filter_fn?: (rowValue: any, filterValue: any) => boolean;
//   filter_mode?: string;
//   visible: boolean;
// }

export interface RowData {
  [key: string]: any;
}

// // Assuming some type definitions (adjust according to your actual types)
// export interface IActionOption {
//   id: string;
//   name: string;
//   created_at: Date | string;
//   updated_at: Date | string;
//   source: any;
//   destination: any;
//   display_name: string;
//   field_configurations: FieldConfiguration[];
// }

// Assuming some type definitions (adjust according to your actual types)
export interface ColumnConfig {
  field_name: string;
  visible?: boolean;
  pin?: "left" | "right";
}

export interface Column {
  id: string;
  // ... other properties
}

export interface ISubscription {
  id: string;
  created_datetime: Date | string;
  updated_datetime: Date | string;
  type: string;
  source: {
    id: string;
    type: string;
  };
  destination: {
    id: string;
    type: string;
  };
}

export interface IDataset {
  id: string;
  created_datetime: Date | string;
  updated_datetime: Date | string;
  type: string;
  author: string;
  description: string;
  heading: string;
  subheading: string;
  name: string;
  fields: FieldConfiguration[];
  list: any[];
  show: any[];
  edit: any[];
  create: any[];
}

export interface IShowItem {
  active_query: {
    credentials: string;
    query: string;
    query_language: string;
  };
  display_options: any;
  display_components: string[] | null;
  display_name: string | null;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  resource: string;
  show_order: number;
  order: number;
  name: string;
  resource_type: string;
}

export interface IListItem {
  actions: IActionsList[];
  active_query: {
    credentials: string;
    query: string;
    query_language: string;
  };
  display_options: any;
  display_components: string[] | null;
  display_name: string | null;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  resource: string;
  order: number;
  data_field: string | null;
  render_detail_panel: "SummaryComponents" | "JSON" | "Table";
}

export interface IViewItem {
  actions: IActionsList[];
  active_query: {
    credentials: string;
    query: string;
    query_language: string;
  };
  display_options: any;
  display_components: string[] | null;
  display_name: string | null;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  resource: string;
  order: number;
  data_field: string | null;
  // render_detail_panel: "SummaryComponents" | "JSON" | "Table";
}

// FILTERING WITH VIEWS
export interface FilterCondition {
  field_name: string; // Correct placement
  type: "exclude" | "include" | "not_equals" | "range";
  values?: string[]; // Assuming values are strings; adjust as necessary
  range_start?: string;
  range_end?: string;
}

export interface ConditionGroup {
  group_operator?: "AND" | "OR";
  conditions: FilterCondition[];
}

export interface ActiveView {
  filters_configuration: ConditionGroup[];
}

export interface FormComponentProps<T extends Record<string, any>> {
  activeActionOption: any;
  activeRecord: any;
  extractedFields: any;
  resource: string;
}

export interface IShortcut {
  created_datetime: Date | string;
  updated_datetime: Date | string;
  id: string;
  name: string;
  author: string;
  record_id: string;
  record_name: string;
}

export interface IAction {
  created_at: Date | string;
  updated_at: Date | string;
  show: IView[];
  destination: {
    id: string;
    location: string;
    record: string;
  };
  display_name: string;
  field_configurations: FieldConfiguration[];
  id: string;
  metadata: {
    display_component: string;
    icon: string;
    resources: string[];
    type: string;
    use_open: boolean;
  };
  name: string;
  options: {
    create_database_record: boolean;
    delete_source_from_destination: boolean;
    execute_by: string;
    execution_orders_range: number[];
    execution_type: string;
    plan_with_llm: boolean;
    record_task_field_name: string;
    rerun_execution_orders: number[];
    sync_from_source_to_destination: boolean;
    update_record: boolean;
    user_feedback: string;
  };
  source: {
    id: string;
    location: string;
  };
  task: {
    author: string;
    description: string;
    id: string;
    name: string;
    status: string;
  };
  task_input: {
    [key: string]: {
      [prop: string]: any;
    };
  };
}

export interface IAutomation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  author: string;
  automation_status: string;
  automation_types: AutomationTypeOption[];
  frequency_input_type: FrequencyInputType;
  frequency: string;
  start_datetime: Date | string;
  end_datetime: Date | string;
  request_data: any;
}

export type AutomationTypeOption = "webhook" | "scheduled" | "event-triggered";
export type FrequencyInputType =
  | "option"
  | "natural_language"
  | "cron_expression";

export type FrequencyOptions =
  | "every-1-minute"
  | "every-5-minutes"
  | "every-10-minutes"
  | "every-15-minutes"
  | "every-30-minutes"
  | "every-1-hour"
  | "every-2-hours"
  | "every-3-hours"
  | "every-4-hours"
  | "every-6-hours"
  | "every-8-hours"
  | "every-12-hours"
  | "every-1-day"
  | "every-2-days"
  | "every-3-days"
  | "every-1-week"
  | "every-2-weeks"
  | "every-1-month"
  | "every-2-months"
  | "every-3-months"
  | "every-6-months"
  | "every-1-year";

// export a simple react component
const Interfaces = () => {
  return "hello interfaces!";
};

export default Interfaces;
