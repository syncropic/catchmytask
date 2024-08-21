import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  IconClockCog,
  IconLivePhoto,
  IconSend,
  IconSql,
  IconStar,
} from "@tabler/icons-react";
import {
  IconScribble,
  IconFiles,
  IconPaperclip,
  IconMicrophone,
  IconVideo,
  IconCamera,
  IconLibrary,
  IconBaseline,
  IconClearFormatting,
  IconCode,
} from "@tabler/icons-react";
import Reveal from "@components/Reveal";
import ResourceView from "@components/ResourceView";
import ExcalidrawEditor from "@components/ExcalidrawEditor";
import MonacoEditor from "@components/MonacoEditor";
import { debounce } from "lodash";
import { ActionIcon, FileInput, Tooltip, Text, Button } from "@mantine/core";
import { useEffect } from "react";
import Highlight from "@tiptap/extension-highlight";
import TemplatesViewWrapper from "@components/TemplatesView";
import FileBrowserWrapper from "@components/FileBrowser";

// const content = "";
// const content = "<p>Hello World!</p>";
interface NaturalLanguageEditorProps {
  value: any;
  // language?: string;
  // setFieldValue?: (field: string, value: any) => void;
  setValue?: (value: any) => void;
  form?: any;
  isLoading?: boolean;
  // setValues?: (values: any) => void;
  // handleSubmit?: (e: any) => void;

  // height?: string;
}
interface ContentNode {
  type: string;
  text?: string;
  content?: ContentNode[];
}

function extractTextFromContent(content: ContentNode[]): string {
  let textContent = "";

  content.forEach((node) => {
    if (node.text) {
      textContent += node.text;
    }

    if (node.content) {
      textContent += extractTextFromContent(node.content);
    }
  });

  return textContent;
}

// const debouncedSetFormValues = debounce((values: any) => {
//   if (setValues) {
//     setValues(values);
//   }
// }, 300); // 300ms debounce delay

const NaturalLanguageEditor: React.FC<NaturalLanguageEditorProps> = ({
  value,
  setValue = () => {},
  form,
  isLoading = false,
  // setValues,
  // handleSubmit,
  // language = "json",
  // height = "30vh",
}) => {
  // const debouncedSetFieldValue = debounce((field: string, value: any) => {
  //   if (setFieldValue) {
  //     setFieldValue(field, value);
  //   }
  // }, 300); // 300ms debounce delay
  // const debouncedSetValues = debounce((values: any) => {
  //   if (setValues) {
  //     setValues(values);
  //   }
  // }, 300); // 300ms debounce delay
  // const debouncedSetFormValues = debounce((values: any) => {
  //   if (setValues) {
  //     setValues(values);
  //   }
  // }, 300); // 300ms debounce delay

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Underline,
      Link,
      // Superscript,
      // SubScript,
      Highlight,
      // TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "What would you like to do?" }),
    ],
    content: value || "",
    // triggered on every change
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      let content_text = extractTextFromContent(content?.content) || "";
      const updatedValues = {
        content_text: content_text,
        content_json: content || "",
        // You can add more fields if needed
      };
      // debouncedSetFormValues(updatedValues);
      // console.log("editor content_text", content_text);
      setValue(content_text);
      // if (setValue) {
      //   // setFieldValue("language", "natural_language");
      //   // debouncedSetFieldValue("type", "json");
      //   // debouncedSetFieldValue("content_json", content || "");
      //   // debouncedSetFieldValue(
      //   //   "content_text",
      //   //   extractTextFromContent(content?.content) || ""
      //   // );
      //   // debouncedSetFieldValue("content_json", content || "");
      //   // const updatedValues = {
      //   //   content_text: extractTextFromContent(content?.content) || "",
      //   //   content_json: content || "",
      //   //   // You can add more fields if needed
      //   // };
      //   // debouncedSetFormValues(updatedValues);

      //   // debouncedSetValues({
      //   //   content_json: content || "",
      //   //   // content_text: extractTextFromContent(content?.content) || "",
      //   // });
      // }
      // console.log(json);
      // send the content to an API here
    },
  });
  // useEffect(() => {
  //   return () => {
  //     debouncedSetFieldValue.cancel(); // cancel any pending debounced calls on unmount
  //   };
  // }, [debouncedSetFieldValue]);
  // useEffect(() => {
  //   return () => {
  //     debouncedSetFormValues.cancel(); // cancel any pending debounced calls on unmount
  //   };
  // }, [debouncedSetFormValues]);
  let actions = [
    {
      label: "Templates",
      name: "select_template",
      icon: "IconLibrary",
      // disabled: true,
    },
    {
      label: "Local Files",
      name: "select_local_files",
      icon: "IconPaperclip",
      disabled: false,
    },
    {
      label: "Remote Files",
      name: "select_remote_files",
      icon: "IconFiles",
      disabled: false,
    },
    {
      label: "Illustrate",
      name: "select_illustration",
      icon: "IconScribble",
      disabled: false,
    },
    // {
    //   label: "Code",
    //   name: "select_code",
    //   icon: "IconCode",
    //   disabled: false,
    // },
    {
      label: "Voice",
      name: "select_template",
      icon: "IconMicrophone",
      disabled: true,
    },
    // {
    //   label: "Camera",
    //   name: "select_template",
    //   icon: "IconCamera",
    //   disabled: true,
    // },
  ];

  let bottom_actions = [
    {
      label: "Camera",
      name: "select_template",
      icon: "IconCamera",
      disabled: true,
    },
  ];

  const iconMapping: { [key: string]: JSX.Element } = {
    IconScribble: <IconScribble stroke={1.5} size="1rem" />,
    IconFiles: <IconFiles stroke={1.5} size="1rem" />,
    IconPaperclip: <IconPaperclip stroke={1.5} size="1rem" />,
    IconMicrophone: <IconMicrophone stroke={1.5} size="1rem" />,
    IconVideo: <IconVideo stroke={1.5} size="1rem" />,
    IconCamera: <IconCamera stroke={1.5} size="1rem" />,
    IconLibrary: <IconLibrary stroke={1.5} size="1rem" />,
    IconBaseline: <IconBaseline stroke={1.5} size="1rem" />,
    IconClearFormatting: <IconClearFormatting stroke={1.5} size="1rem" />,
    IconCode: <IconCode stroke={1.5} size="1rem" />,
  };

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          {/* <RichTextEditor.Bold /> */}
          <RichTextEditor.Strikethrough />
          {/* <RichTextEditor.ClearFormatting /> */}
          <RichTextEditor.Highlight />
        </RichTextEditor.ControlsGroup>

        {/* <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
        </RichTextEditor.ControlsGroup> */}

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      {editor && (
        <BubbleMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </BubbleMenu>
      )}

      <RichTextEditor.Content />
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          {actions.map((action, index) => (
            <Reveal
              target={
                <Tooltip label={action.label}>
                  <RichTextEditor.Control
                    // onClick={() => editor?.commands.insertContent("⭐")}
                    // aria-label="Insert star emoji"
                    // title="Insert star emoji"
                    aria-label={action.label}
                    disabled={action.disabled}
                  >
                    {iconMapping[action?.icon]}
                  </RichTextEditor.Control>
                </Tooltip>
              }
              trigger="click"
            >
              {action.name === "select_template" && (
                <TemplatesViewWrapper
                  query_name="action_steps_templates"
                  entity="action_steps_templates"
                ></TemplatesViewWrapper>
              )}
              {action.name === "select_local_files" && (
                <FileInput
                  label="Local Files"
                  description="Click to select and insert local files"
                  placeholder="Click to select and insert local files"
                />
              )}
              {action.name === "select_illustration" && (
                <ExcalidrawEditor></ExcalidrawEditor>
              )}
              {action.name === "select_remote_files" && (
                <FileBrowserWrapper
                  query_name="remote_files"
                  entity="file_definitions"
                ></FileBrowserWrapper>
              )}
              {action.name === "select_code" && (
                <MonacoEditor value="" language="python"></MonacoEditor>
              )}
            </Reveal>
          ))}
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <Tooltip label="Live Updates">
            <RichTextEditor.Control
              // onClick={handleSubmit}
              aria-label="Live Updates"
              // title="Run"
            >
              <IconLivePhoto stroke={1.5} size="1rem" />
            </RichTextEditor.Control>
          </Tooltip>
          <Tooltip label="Run">
            <RichTextEditor.Control
              // onClick={() => form?.handleSubmit()}
              aria-label="Run"
              // title="Run"
              // disabled={form?.Subscribe}
            >
              {/* <IconSend stroke={1.5} size="1rem" /> */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  // <button type="submit" disabled={!canSubmit}>
                  //   {isSubmitting ? '...' : 'Submit'}
                  // </button>
                  <Button
                    size="xs"
                    type="submit"
                    loading={isLoading || isSubmitting}
                    disabled={!canSubmit}
                  >
                    Act
                  </Button>
                )}
              />
            </RichTextEditor.Control>
          </Tooltip>

          {/* <Tooltip label="Automate/Schedule">
            <RichTextEditor.Control
              aria-label="Automate/Schedule"
            >
              <IconClockCog stroke={1.5} size="1rem" />
            </RichTextEditor.Control>
          </Tooltip> */}
          {/* <Tooltip label="Generate Structured Query">
            <RichTextEditor.Control
              aria-label="Generate Query"
            >
              <IconSql stroke={1.5} size="1rem" />
            </RichTextEditor.Control>
          </Tooltip> */}
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
    </RichTextEditor>
  );
};
export default NaturalLanguageEditor;

export const NaturalLanguageEditorFormInput = ({ ...props }: any) => {
  // console.log("monaco editor form input props", props);
  // const setValue = (value: any) => {
  //   props?.setFieldValue(
  //     props?.schema.title.toLowerCase().replace(/ /g, "_"),
  //     value
  //   );
  // };
  return (
    <>
      {props?.schema?.title && (
        <Text fw={500} size="sm">
          {props?.schema?.title}
        </Text>
      )}
      {/* <div>{JSON.stringify(props?.value)}</div> */}
      <NaturalLanguageEditor
        // {...props?.schema}
        value={props?.value}
        setValue={props?.onChange}
        form={props?.form}
        isLoading={props?.isLoading}
        // field={props?.schema.title.toLowerCase().replace(/ /g, "_")}
        // {...props}
      />
    </>
    // <div>monaco editor form input</div>
  );
};
