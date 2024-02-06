export interface IActionStep {
  name: string;
  execution_order: number;
  status: string;
  callback: boolean;
  async: boolean;
  context: string;
  dependencies: string[];
  kind: string;
  record: string;
  input: string;
  individual_fields: string[];
  combined_fields: string[];
  out: string;
  in: string;
}

export type IIdentity = {
  [key: string]: any;
};

// export a simple react component
const View = () => {
  return "hello world!";
};

export default View;
