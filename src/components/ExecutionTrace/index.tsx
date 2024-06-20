import Results from "@components/Results";
import RetriveView from "@components/RetrieveView";
import {
  useFetchExecutionTraceBySessionId,
  useFetchViewByName,
} from "@components/Utils";
import { Accordion } from "@mantine/core";
import { useAppStore } from "src/store";

// const content = "<p>Hello World!</p>";
interface IExecutionTrace {
  // value: any;
  // language?: string;
  // setFieldValue?: (field: string, value: any) => void;
  // height?: string;
}

const ExecutionTrace: React.FC<IExecutionTrace> = (
  {
    // value,
    // setFieldValue = () => {},
    // language = "json",
    // height = "30vh",
  }
) => {
  const {
    // setActiveStructuredQuery,
    // activeStructuredQuery,
    // setActiveQueryGraph,
    activeSession,
  } = useAppStore();
  // get session from params
  const {
    data: executionTraceData,
    isLoading: executionTraceIsLoading,
    error: executionTraceError,
  } = useFetchExecutionTraceBySessionId(activeSession?.id);

  // const {
  //   data: viewData,
  //   error: viewError,
  //   isLoading: viewIsLoading,
  // } = useFetchViewByName("execution_trace");
  const view_definition = {
    view: "execution_traces",
    result_section: "execution_traces",
  };

  // console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
  // const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
  //   useDisclosure(false);
  // const [openedChat, { open: openChat, close: closeChat }] =
  //   useDisclosure(false);
  // const { data: identity } = useGetIdentity<IIdentity>();
  // const {
  //   mutate,
  //   isLoading: mutationIsLoading,
  //   isError: mutationIsError,
  //   error: mutationError,
  //   data: mutationData,
  // } = useCustomMutation();
  // // const queryClient = useQueryClient();
  // const actionFormFieldValues = {
  //   query: activeSession?.natural_language_query?.content,
  // };
  // const {
  //   getInputProps,
  //   saveButtonProps,
  //   setFieldValue,
  //   values,
  //   refineCore: { formLoading, onFinish },
  //   onSubmit,
  //   reset,
  //   isTouched,
  // } = useForm({
  //   initialValues: {
  //     ...actionFormFieldValues,
  //   },
  //   refineCoreProps: {},
  // });

  return (
    <>
      {/* <div>
        see live execution trace, status and artifacts, interrupt and provide
        feedback if needed.
      </div> */}
      {/* <div>{JSON.stringify(executionTraceData?.data)}</div> */}
      {/* <Accordion defaultValue="execution_trace">
        {data?.data[0]?.ctes["result_view_CTE"]?.["data"] &&
          data?.data[0]?.ctes["result_view_CTE"]?.["data"].map((item: any) => {
            return (
              <RetriveView view_definition={item} data={data}></RetriveView>
            );
          })}
      </Accordion> */}

      {executionTraceData?.data && (
        <Accordion defaultValue="execution_traces">
          <RetriveView
            view_definition={view_definition}
            data={executionTraceData}
          ></RetriveView>
        </Accordion>
      )}

      {/* <RetriveView
        view_definition={view_definition}
        data={executionTraceData?.data}
      ></RetriveView> */}
    </>
  );
};

export default ExecutionTrace;
