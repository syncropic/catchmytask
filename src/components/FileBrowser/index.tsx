import RetrieveAndRenderResults from "@components/RetrieveAndRenderResults";

// define your extension array
// const extensions = [StarterKit];

// const content = "<p>Hello World!</p>";
interface IEditor {
  // value: any;
  // language?: string;
  // setFieldValue?: (field: string, value: any) => void;
  // height?: string;
}

const FileBrowser: React.FC<IEditor> = (
  {
    // value,
    // setFieldValue = () => {},
    // language = "json",
    // height = "30vh",
  }
) => {
  // const {
  //   // setActiveStructuredQuery,
  //   // activeStructuredQuery,
  //   // setActiveQueryGraph,
  //   activeSession,
  // } = useAppStore();
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
      <RetrieveAndRenderResults></RetrieveAndRenderResults>
      {/* <EditorContent editor={editor} /> */}
      {/* <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
      ></EditorProvider> */}
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </>
  );
};

export default FileBrowser;
