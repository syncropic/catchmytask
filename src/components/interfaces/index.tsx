import { ColumnDef } from "@tanstack/react-table";
import { MRT_TableInstance } from "mantine-react-table";
import { Table as TanStackTable } from "@tanstack/react-table";

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
  | "JsonEditor"
  // | "LocalAudioPlayer"
  | "FileInput"
  | "FileHandler"
  | "ExcalidrawEditor"
  | "hero"
  | "frequently_asked_questions"
  | "benefits"
  | "get_started"
  | "integrations"
  | "social_proof"
  | "showcase"
  | "email_list_signup"
  // | "MediaPlayerController"
  // | "MediaPlayerTimeline"
  | "MonacoEditor"
  | "MonacoEditorFormInput"
  | "NaturalLanguageEditorFormInput"
  | "DateTimePicker"
  | "Switch"
  | "Checkbox"
  | "SearchInput"
  | "ListEditorFormInput";

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
  detail_panel_configuration: any;
  display_components: string[] | null;
  display_name: string | null;
  name: string;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  field_configurations: FieldConfiguration[];
  id: string;
  resource: string;
  order: number;
  create: any;
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

// export interface TableViewComponentProps<T extends Record<string, any>> {
//   // data_columns: any[]; // Define more specific type if possible
//   resource: string;
//   data_columns: T[];
//   activeQueryResults: any;
//   // data_items: T[];
//   // isLoadingDataItems: boolean;
//   // view?: IView;
//   // // initialStateColumnPinningLeft: string[];
//   // customTableConfig?: any;
//   // updateTableVisibility: (
//   //   tableInstance: MRT_TableInstance<T>,
//   //   columnsConfig: ColumnConfig[] | null
//   // ) => void;
// }

export interface ActionStepsActionInputFormProps {
  action_steps?: any;
  name?: string;
  success_message_code?: string;
  children?: any;
  nested_component?: any;
  action_icon?: any;
  exclude_components?: string[];
}

export interface ActionInputWrapperProps {
  query_name?: string;
  name?: string;
  execution_record?: any;
  action?: any;
  action_type?: string;
  entity?: string;
  record?: any;
  record_query?: any;
  exclude_components?: string[];
  children?: any;
  nested_component?: any;
  include_form_components?: string[];
  setExpandedRecordIds?: (ids: string[]) => void;
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  description?: any;
  update_action_input_form_values_on_submit_success?: boolean;
  endpoint?: string;
  action_label?: string;
  records?: any;
  focused_item?: string;
  read_record_mode?: string;
}

export interface PlanWrapperProps {
  query_name?: string;
  name?: string;
  execution_record?: any;
  action?: any;
  action_type?: string;
  entity?: string;
  record?: any;
  record_query?: any;
  exclude_components?: string[];
  children?: any;
  nested_component?: any;
  include_form_components?: string[];
  setExpandedRecordIds?: (ids: string[]) => void;
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  description?: any;
  update_action_input_form_values_on_submit_success?: boolean;
  endpoint?: string;
  action_label?: string;
  records?: any;
  focused_item?: string;
  read_record_mode?: string;
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

interface ResultsViewProps<T extends object> {
  tableInstance: TanStackTable<T>;
  data_items: T[];
  data_columns: T[];
}

export interface TableViewComponentProps<T extends Record<string, any>> {
  // data_columns: T[]; // Define more specific type if possible
  // item: IView;
  // resource: string;
  data_items: T[];

  // isLoadingDataItems: boolean;
  // session?: ISession;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
}

export interface SpreadsheetViewComponentProps<T extends Record<string, any>> {
  // data_columns: any[]; // Define more specific type if possible
  // item: IView;
  // resource: string;
  data_items: T[];
  isLoadingDataItems: boolean;
  data_columns: ColumnDef<RowData>[];
  tableInstance?: TanStackTable<T>;
  results?: any;
  resource_group: string;
  view_data: any;
  // session?: ISession;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
}

// export interface DataItem {
//   reporting_date: string;
//   payment_status: string;
//   payment_amount_captured_total: number;
//   related_record: string;
// }
export interface ResultsComponentProps<T extends Record<string, any>> {
  // data_columns: any[]; // Define more specific type if possible
  // item: IView;
  // resource: string;
  // results?: any;
  data_columns?: ColumnDef<RowData>[];
  isLoadingDataItems?: boolean;
  read_write_mode?: string;
  ui?: Record<string, any>;
  // data_columns: ColumnDef<RowData>[];
  name?: string;
  tableInstance?: TanStackTable<T>;
  data_items?: [];
  nested_data_items?: T[];
  record?: any;
  resource_group: string;
  execlude_components?: string[];
  // view_data: any;
  // data_columns: T[];
  data_fields: T[];
  invalidate_queries_on_submit_success?: string[];
  // session?: ISession;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
}

export interface DataDisplayComponentProps<T extends Record<string, any>> {
  // data_columns: any[]; // Define more specific type if possible
  // item: IView;
  // resource: string;
  // results?: any;
  display_mode?: any;
  record?: any;
  entity_type?: string;
  // data_columns?: ColumnDef<RowData>[];
  isLoadingDataItems?: boolean;
  // read_write_mode?: string;
  ui?: Record<string, any>;
  // data_columns: ColumnDef<RowData>[];
  // name?: string;
  // tableInstance?: TanStackTable<T>;
  data_items: [];
  // record?: any;
  // resource_group: string;
  // execlude_components?: string[];
  // view_data: any;
  // data_columns: T[];
  data_fields: T[];
  action?: any;
  // invalidate_queries_on_submit_success?: string[];
  // session?: ISession;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
}

export interface WebBrowserViewComponentProps<T extends Record<string, any>> {
  // data_columns: any[]; // Define more specific type if possible
  // item: IView;
  url: string;
  // data_items: T[];
  // isLoadingDataItems: boolean;
  // session?: ISession;
  // // initialStateColumnPinningLeft: string[];
  // customTableConfig?: any;
  // updateTableVisibility: (
  //   tableInstance: MRT_TableInstance<T>,
  //   columnsConfig: ColumnConfig[] | null
  // ) => void;
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
  // activeActionView: IViewItem;
  // activeSession: ISession;
  // activeAction: IAction;
  // activeRecords: any[];
  // actionFormFieldValues: any;
  data_model: any;
  // actionFieldConfigurations: FieldConfiguration[];
  // activeActionOption: any;
  // inputFields: FieldConfiguration[];
  // setActiveActionOption: (item: any) => void;
  // data_table: MRT_TableInstance<T>;
}

export interface IAnalyticsComponentProps<T extends Record<string, any>> {
  table: MRT_TableInstance<T>;
}

export interface QueryControlComponentProps<T extends Record<string, any>> {
  // setActionType: (type: string) => void;
  // action_options: Array<{ value: string; label: string; [key: string]: any }>;
  // data_items: any[];
  // identity: any;
  // open: () => void;
  // close: () => void;
  // opened: boolean;
  // action_step: any;
  // variant?: "inline" | "default";
  // activeSession: ISession;
  queryAction: IAction;
  activeRecords: any[];
  // actionFormFieldValues: any;
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

export interface SelectSessionComponentProps<T extends Record<string, any>> {
  sessions_list?: any;
  record?: any;
  view_item?: IViewItem | null;
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
  name: string;
  visible_on_create?: boolean;
  placeholder?: string;
  field_name?: string;
  display_format?: string;
  display_component?: string;
  default_value?: any;
  searchable?: boolean;
  display_name?: string;
  on_change?: any;
  on_focus?: any;
  data_prop_query?: any;
  display_component_content?: any;
  conditional_formatting?: IConditionalFormatting;
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
  // // filter_fn?: (rowValue: any, filterValue: any) => boolean;
  filter_fn?: any;
  sorting_fn?: any;
  pin?: "left" | "right";
  filter_mode?: string;
  accessor_fn?: any;
  accessor_key?: string;
  visible: boolean;
  props?: any;
  max_size?: number;
  min_size?: number;
  size?: number;
  on_click?: any;
  enable_column_filter_modes?: boolean;
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

export interface IChannel {
  id: string;
  tracks: ITrack[];
}

export interface ITrack {
  id: string;
  name: string;
  artists: string[];
  created_at: Date | string;
  added_at: Date | string;
  updated_at: Date | string;
  popularity: number;
  danceability: number;
  energy: number;
  key: number;
  speechiness: number;
  instrumentalness: number;
  loudness: number;
  genre: string;
  explicit: boolean;
  description: string;
  acousticness: number;
  goes_well_with: string;
  time_signature: number;
  tempo: number;
  valence: number;
  author: string;
  spotify_track_id: string;
  spotify_uri: string;
  spotify_album_image_url: string;
  spotify_duration: number;
  spotify_external_url: string;
  spotify_href: string;
  spotify_key: number;
  spotify_preview_url: string;
  audio_url: string;
  file_id: string;
}

export interface ITrackLocation {
  id: string;
  track_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  path: string;
  type: string;
  author: string;
}

export interface ITrackAnalysisEmbeddings {
  id: string;
  track_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  description_embedding: string;
}

export interface IArtist {
  id: string;
  name: string;
  added_at: Date | string;
  updated_at: Date | string;
}

export interface IArtistSpotifyInfo {
  id: string;
  artist_id: string;
  added_at: Date | string;
  updated_at: Date | string;
  spotify_artist_id: string;
}

// export a simple react component
const Interfaces = () => {
  return "hello interfaces!";
};

export default Interfaces;

export interface IAirline {
  airline_carrier_type: string;
  airline_code: string;
  airline_customer_support_url: string;
  airline_find_my_trip_section_label: string;
  airline_name: string;
  airline_trip_page_url: string;
  created_at: string;
  id: string;
  updated_at: string;
}

// Define the type of your query data
export interface QueryDataType {
  data: any; // Adjust the type according to your actual data structure
  error: any;
  isLoading: boolean;
}

export interface DataItem {
  find(arg0: (item: any) => boolean): unknown;
  id: number;
  name: string;
}

// export interface FieldData {
//   data?: DataItem[];
// }

export interface FieldData {
  data?: Array<{
    find: (callback: (item: any) => boolean) => any;
  }>;
}

// export interface FieldData {
//   data: {
//     message: string;
//     results: { result: { id: string; name: string }[] }[];
//   }[];
// }

export interface HeroItem {
  heading: string;
  subheading: string;
  hero_image_url: string;
  CTAComponent?: React.ReactNode;
  key_features?: { name: string; description: string }[];
}

export interface ContentBlockProps {
  // CTAComponent: any;
  entity_type: string;
  title: {
    name: string;
    description: string;
    type: string;
    metadata: {
      [key: string]: any;
    };
    image_url?: string;
  };
  items: {
    name: string;
    description: string;
    metadata: {
      [key: string]: any;
    };
  }[];
}

// Define the type for the option object
export interface SearchItemOption {
  value: string;
  entity_type: string;
  label: string;
  description: string;
  author_id: string;
}

// Define the type for the filter item
export interface FilterItem {
  id: number;
  name: string;
  description: string;
  entity_type: string;
  is_selected: boolean;
}

export interface SearchInputComponentProps<T extends Record<string, any>> {
  success_message_code?: string;
  activeFilters?: FilterItem[];
  placeholder?: string;
  label?: string;
  description?: string;
  handleOptionSubmit?: (value: any | null) => void;
  onChange?: (value: any | null) => void;
  value?: string;
  disabled?: boolean;
  include_action_icons?: string[];
  schema?: any;
}

export interface GlobalSearchInputComponentProps<
  T extends Record<string, any>
> {
  success_message_code?: string;
  activeFilters?: FilterItem[];
  placeholder?: string;
  label?: string;
  description?: string;
  handleOptionSubmit?: (value: any | null) => void;
  onChange?: (value: any | null) => void;
  value?: string;
  disabled?: boolean;
  include_action_icons?: string[];
  schema?: any;
}

export interface DataModel {
  data_model: {
    author_id: string;
    created_datetime: string;
    description: string;
    entity_type: string;
    id: string;
    name: string;
    schema: {
      properties: Record<
        string,
        {
          group: string;
          component: string;
          description: string;
          placeholder?: string;
          size?: string;
          title: string;
          type: string;
          readOnly?: boolean;
          format?: string;
          id: string;
          // Allow any additional properties
          [key: string]: any;
        }
      >;
      required: string[];
      title: string;
      type: string;
    };
    updated_datetime: string;
  };
}

export interface DynamicFormProps {
  data_model: DataModel["data_model"] | null;
  record?: any;
  action_steps?: any;
  execlude_components?: string[];
  name?: string;
  action?: any;
  children?: any;
  nested_component?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
  invalidate_queries_on_submit_success?: string[];
  update_action_input_form_values_on_submit_success?: boolean;
  success_message_code?: string;
  endpoint?: string;
  action_label?: string;
  records?: any;
  include_action_icons?: string[];
  include_form_components?: string[];
  focused_item?: string;
}
