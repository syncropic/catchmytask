import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
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
  IconLoader,
} from "@tabler/icons-react";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import styles from "./NaturalLanguageEditor.module.css";
import suggestion from "./suggestion";
import SearchInput from "@components/SearchInput";
import { useEffect } from "react";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useAppStore } from "src/store";

// import "./styles.scss";

// const content = "";
// const content = "<p>Hello World!</p>";
interface NaturalLanguageEditorProps {
  value: any;
  // language?: string;
  // setFieldValue?: (field: string, value: any) => void;
  setValue?: (value: any) => void;
  form?: any;
  isLoading?: boolean;
  action_input_form_values_key?: string;
  // setValues?: (values: any) => void;
  // handleSubmit?: (e: any) => void;

  // height?: string;
}

// function extractTextFromContent(content: any): string {
//   let textContent = "";

//   content.forEach((node: any) => {
//     if (node.text) {
//       textContent += node.text;
//     }

//     if (node.content) {
//       textContent += extractTextFromContent(node.content);
//     }
//   });

//   return textContent;
// }

const NaturalLanguageEditor: React.FC<NaturalLanguageEditorProps> = ({
  value,
  setValue = () => {},
  form,
  isLoading = false,
  action_input_form_values_key = "",
  // setValues,
  // handleSubmit,
  // language = "json",
  // height = "30vh",
}) => {
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
      // TaskList.configure({
      //   HTMLAttributes: {
      //     class: "my-custom-class",
      //   },
      // }),
      Mention.configure({
        HTMLAttributes: {
          class: styles.mention, // Apply custom mention class
        },

        // renderText({ options, node }) {
        //   return `${options.suggestion.char}${
        //     node.attrs.label ?? node.attrs.id
        //   }`;
        // },
        // renderHTML({ options, node }) {
        //   return [
        //     "a",
        //     mergeAttributes({ href: "/profile/1" }, options.HTMLAttributes),
        //     `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
        //   ];
        // },
        suggestion,
      }),
    ],
    content: value || "",
    // triggered on every change
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      setValue(content);
      // let content_text = extractTextFromContent(content?.content || "");
      // const updatedValues = {
      //   content_text: content_text,
      //   content_json: content || "",
      //   // You can add more fields if needed
      // };
      // console.log("updatedValues", updatedValues);
      // debouncedSetFormValues(updatedValues);
      // console.log("editor content_text", content_text);
      // setValue(content_text);
    },
  });

  const { live_generate, setLiveGenerate } = useAppStore();

  // Add useEffect to update editor content when value prop changes
  useEffect(() => {
    if (editor && value) {
      // Update the editor content when the value prop changes
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // let actions = [
  //   {
  //     label: "Templates",
  //     name: "select_template",
  //     icon: "IconLibrary",
  //     disabled: false,
  //   },
  // ];

  // const iconMapping: { [key: string]: JSX.Element } = {
  //   IconScribble: <IconScribble stroke={1.5} size="1rem" />,
  //   IconFiles: <IconFiles stroke={1.5} size="1rem" />,
  //   IconPaperclip: <IconPaperclip stroke={1.5} size="1rem" />,
  //   IconMicrophone: <IconMicrophone stroke={1.5} size="1rem" />,
  //   IconVideo: <IconVideo stroke={1.5} size="1rem" />,
  //   IconCamera: <IconCamera stroke={1.5} size="1rem" />,
  //   IconLibrary: <IconLibrary stroke={1.5} size="1rem" />,
  //   IconBaseline: <IconBaseline stroke={1.5} size="1rem" />,
  //   IconClearFormatting: <IconClearFormatting stroke={1.5} size="1rem" />,
  //   IconCode: <IconCode stroke={1.5} size="1rem" />,
  // };

  // const canSubmit = form.useStore((state: any) => state.canSubmit);
  // const isSubmitting = form.useStore((state: any) => state.isSubmitting);

  const toggleLiveGenerate = (action_input_form_values_key: string) => {
    // Create a copy of the live_generate object
    let newLiveGenerate = { ...live_generate };

    // Ensure the key exists in newLiveGenerate, initialize it if not
    if (!newLiveGenerate[action_input_form_values_key]) {
      newLiveGenerate[action_input_form_values_key] = {
        is_live_generating: false,
      };
    }

    // Toggle the is_live_generating state
    newLiveGenerate[action_input_form_values_key].is_live_generating =
      !newLiveGenerate[action_input_form_values_key].is_live_generating;

    // Update global state
    setLiveGenerate(newLiveGenerate);
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
        {/* <RichTextEditor.ControlsGroup>
          <SearchInput
            placeholder="templates"
            // description="tasks"
            // handleOptionSubmit={setActiveTask}
            // value={activeTask?.name || ""}
            // include_action_icons={["remove_from_state"]}
            activeFilters={[
              {
                id: 1,
                name: "tasks",
                description: "tasks",
                entity_type: "tasks",
                is_selected: true,
              },
            ]}
          />
        </RichTextEditor.ControlsGroup> */}
        <RichTextEditor.ControlsGroup>
          <Tooltip
            multiline
            w={220}
            withArrow
            transitionProps={{ duration: 200 }}
            label="When activated, just describe or partially fill in this form and let the system automatically and in realtime generate other parts of the form, including queries and code that you can immediately edit to your liking before executing"
          >
            <RichTextEditor.Control aria-label="Live Generate">
              {live_generate[action_input_form_values_key]
                ?.is_live_generating ? (
                // Button with rightSection for loading state
                <Button
                  size="compact-xs"
                  // variant="filled"
                  variant="gradient"
                  gradient={{ from: "blue", to: "teal", deg: 72 }}
                  onClick={() =>
                    toggleLiveGenerate(action_input_form_values_key)
                  }
                  rightSection={
                    <ActionIcon loading>
                      <IconLoader size={18} />
                    </ActionIcon>
                  }
                >
                  Live Generating
                </Button>
              ) : (
                // Button for normal state
                <Button
                  size="compact-xs"
                  variant="outline"
                  onClick={() =>
                    toggleLiveGenerate(action_input_form_values_key)
                  }
                >
                  Live Generate
                </Button>
              )}
            </RichTextEditor.Control>
          </Tooltip>
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
      {/* {props?.schema?.title && (
        <Text fw={500} size="sm">
          {props?.schema?.title}
        </Text>
      )} */}
      {/* <div>{JSON.stringify(props?.action_input_form_values_key)}</div> */}
      {props?.value && (
        <NaturalLanguageEditor
          // {...props?.schema}
          // value={props?.value}
          action_input_form_values_key={props?.action_input_form_values_key}
          value={props?.value}
          setValue={props?.onChange}
          form={props?.form}
          isLoading={props?.isLoading}
          // field={props?.schema.title.toLowerCase().replace(/ /g, "_")}
          // {...props}
        />
      )}
    </>
    // <div>monaco editor form input</div>
  );
};
