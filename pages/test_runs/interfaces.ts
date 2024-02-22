export interface ITestRun {
  test_id: string;
  test_name: string;
  test_result_url: string;
  test_intermediate_result_url: string;
  test_start_datetime: Date | string;
  test_end_datetime: Date | string;
  test_duration_seconds: number;
  test_parameters_id: string;
  test_item_id: string;
  test_result: string;
  test_environment: string;
}

// export a simple react component
const ItripComponent = () => {
  return "hello world!";
};

export default ItripComponent;
