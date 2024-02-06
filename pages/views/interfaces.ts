export interface IView {
  id: string;
  name: string;
  resource: string;
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
