export interface ITool {
  id: string;
  created_at: Date | string;
  name: string;
  docs_url: string;
  homepage_url: string;
  description: string;
  type: string;
}

// export a simple react component
const Example = () => {
  return "hello world!";
};

export default Example;
