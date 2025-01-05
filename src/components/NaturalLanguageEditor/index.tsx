import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import styles from "./NaturalLanguageEditor.module.css";
import suggestion from "./suggestion";
import { useAppStore } from "src/store";
import { useParsed } from "@refinedev/core";

interface NaturalLanguageEditorProps {
  value: any;
  setValue?: (value: any) => void;
  form?: any;
  isLoading?: boolean;
  action_input_form_values_key?: string;
  record?: any;
  height?: string;
}

const NaturalLanguageEditor: React.FC<NaturalLanguageEditorProps> = ({
  value,
  setValue = () => {},
  record,
  height = "65vh",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Highlight,
      Placeholder.configure({ placeholder: "What would you like to do?" }),
      Mention.configure({
        HTMLAttributes: {
          class: styles.mention,
        },
        suggestion,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm w-full",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      setValue(content);
    },
  });

  const { activeTask, focused_entities } = useAppStore();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { params } = useParsed();

  return (
    <div style={{ height, display: "flex", flexDirection: "column" }}>
      <RichTextEditor
        editor={editor}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <RichTextEditor.Toolbar sticky>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Strikethrough />
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

        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            background: "white",
            padding: "1rem",
          }}
        >
          <RichTextEditor.Content />
        </div>

        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup></RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup></RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      </RichTextEditor>
    </div>
  );
};

export default NaturalLanguageEditor;

export const NaturalLanguageEditorFormInput = ({ ...props }: any) => {
  return (
    <NaturalLanguageEditor
      value={props?.value}
      setValue={props?.onChange}
      record={props?.record}
      height={props?.height}
    />
  );
};
