import { MRT_TableInstance } from "mantine-react-table";
import { ISession } from "pages/sessions/interfaces";

export interface IApplication {
  id: string;
  name: string;
  heading: string;
  subheading: string;
  description: string;
}

export type IIdentity = {
  [key: string]: any;
};

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
  item: IListItem;
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
  activeSession: any;
  activeRecords: any[];
  activeActionOption: any;
  // inputFields: FieldConfiguration[];
  // setActiveActionOption: (item: any) => void;
  // data_table: MRT_TableInstance<T>;
}

export interface SelectActionOptionComponentProps<
  T extends Record<string, any>
> {
  setActionType: (type: string) => void;
  action_options: Array<{ value: string; label: string; [key: string]: any }>;
  data_items: any[];
  identity: any;
  record: any;
  action_step: any;
  variant?: "inline" | "default";
  activeActionOption: any;
  setActiveActionOption: (item: any) => void;
  data_table: MRT_TableInstance<T>;
}

// export type FieldConfiguration = {
//   component: string;
//   label: string;
//   name: string;
//   props: Record<string, any>;
// };

export interface FieldConfiguration {
  field_name: string;
  display_format: string;
  display_component: string;
  display_component_content: any;
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
}

export interface Column {
  field_name: string;
  display_format: string;
  display_component: string;
  display_component_content: any;
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
}

export interface Column {
  field_name: string;
  display_format: string;
  display_component: string;
  display_component_content: any;
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
}

export interface RowData {
  [key: string]: any;
}

// Assuming some type definitions (adjust according to your actual types)
export interface IActionOption {
  id: string;
  name: string;
  created_at: Date | string;
  updated_at: Date | string;
  source: any;
  destination: any;
  display_name: string;
  field_configurations: FieldConfiguration[];
}

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
  display_components: string[] | null;
  display_name: string | null;
  display_type: string;
  fields_configuration: FieldConfiguration[];
  id: string;
  resource: string;
  show_order: number;
}

export interface IListItem {
  active_query: {
    credentials: string;
    query: string;
    query_language: string;
  };
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

// export a simple react component
const Interfaces = () => {
  return "hello interfaces!";
};

export default Interfaces;
