export interface IFieldConfiguration {
  data_type: "varchar" | "datetime"; // Adjust this union type based on all possible data types
  field_name: string;
  pin?: "left" | "right"; // Optional since not all fields have it, adjust based on possible values
  visible: boolean;
}

export interface ISession {
  created_datetime: string;
  updated_datetime: string;
  author: string;
  // data_models: string[];
  // description: string;
  // fields_configuration: IFieldConfiguration[];
  id: string;
  name: string;
  // resource: string;
  session_status: "published" | "draft" | "review";
}

export interface IFilter {
  column_name: string;
  include: string[];
  exclude: string[];
  range_start: string;
  range_end: string;
}

export interface IField {
  name: string;
  visible: boolean;
  pin: string;
}

export interface IDataModel {
  fields: IField[];
  filters: IFilter[];
  name: string;
}

export type IIdentity = {
  [key: string]: any;
};

// export a simple react component
const View = () => {
  return "hello world!";
};

export default View;
