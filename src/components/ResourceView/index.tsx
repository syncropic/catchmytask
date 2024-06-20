import Results from "@components/Results";
import RetriveView from "@components/RetrieveView";
import {
  useFetchExecutionTraceBySessionId,
  useFetchResourceByField,
  useFetchViewByName,
} from "@components/Utils";
import { Accordion } from "@mantine/core";
import { useAppStore } from "src/store";

interface ViewComponentProps {
  resource: string;
  field: string;
  value: string | number | boolean | undefined | null;
  operator: string;
  // language?: string;
  // setFieldValue?: (field: string, value: any) => void;
  // height?: string;
}

const ResourceView: React.FC<ViewComponentProps> = ({
  resource,
  field,
  value,
  operator,
}) => {
  const {
    data: resourceData,
    isLoading: resourceIsLoading,
    error: resourceError,
  } = useFetchResourceByField({
    resource,
    field,
    value,
    operator,
  });

  const view_definition = {
    view: resource,
    result_section: resource,
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
      {/* <div>{JSON.stringify(view_definition)}</div> */}
      {resourceData?.data && (
        <Accordion defaultValue={resource}>
          <RetriveView
            view_definition={view_definition}
            data={resourceData}
          ></RetriveView>
        </Accordion>
      )}
    </>
  );
};

export default ResourceView;
