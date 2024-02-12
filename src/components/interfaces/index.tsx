export type IIdentity = {
  [key: string]: any;
};

export interface CompleteActionComponentProps {
  setActionType: (type: string) => void;
  action_options: Array<{ value: string; label: string; [key: string]: any }>;
  data_items: any[];
  identity: any;
  open: () => void;
  close: () => void;
  opened: boolean;
  record: any;
  action_step: any;
  variant?: "inline" | "default";
  activeActionOption: any;
  setActiveActionOption: (item: any) => void;
}

export interface SelectActionOptionComponentProps {
  setActionType: (type: string) => void;
  action_options: Array<{ value: string; label: string; [key: string]: any }>;
  data_items: any[];
  identity: any;
  record: any;
  action_step: any;
  variant?: "inline" | "default";
  activeActionOption: any;
  setActiveActionOption: (item: any) => void;
}

export interface IView {
  id: string;
  name: string;
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

// export a simple react component
const Interfaces = () => {
  return "hello interfaces!";
};

export default Interfaces;
