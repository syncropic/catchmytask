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
import ExternalSubmitButton from "@components/SubmitButton";

interface NaturalLanguageEditorProps {
  value: any;
  setValue?: (value: any) => void;
  form?: any;
  isLoading?: boolean;
  action_input_form_values_key?: string;
  record?: any;
  height: string;
}

const NaturalLanguageEditor: React.FC<NaturalLanguageEditorProps> = ({
  value,
  setValue = () => {},
  record,
  height = "50vh",
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

  return (
    <div style={{ height, display: "flex", flexDirection: "column" }}>
      <RichTextEditor
        editor={editor}
        style={{
          display: "flex",
          flexDirection: "column",
          // height: "50%",
          height: "100%",
          // height: { height },
        }}
      >
        <RichTextEditor.Toolbar sticky>
          {/* <RichTextEditor.ControlsGroup>
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
          </RichTextEditor.ControlsGroup> */}

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              {/* <RichTextEditor.Italic />
              <RichTextEditor.Link /> */}
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

export const StorageAttachmentActionsFormInput = ({ ...props }: any) => {
  const { params } = useParsed();

  return (
    <>
      {/* {JSON.stringify(props.height)} */}
      {/* {props?.title && <div>{props?.title}</div>} */}
      <div className="flex gap-10 justify-center">
        <ExternalSubmitButton
          record={{}}
          entity_type="memory"
          action_form_key={`form_${params?.id}_memory`}
          action="upload"
          icon={"IconUpload"}
        />
        <ExternalSubmitButton
          record={{}}
          entity_type="memory"
          action_form_key={`form_${params?.id}_memory`}
          action="google drive"
          icon={"IconBrandGoogleDrive"}
        />
        <ExternalSubmitButton
          record={{}}
          entity_type="memory"
          action_form_key={`form_${params?.id}_memory`}
          action="onedrive"
          icon={"IconBrandOnedrive"}
        />
        <ExternalSubmitButton
          record={{}}
          entity_type="memory"
          action_form_key={`form_${params?.id}_memory`}
          action="system files"
          icon={"IconFiles"}
        />
      </div>

      {/* <NaturalLanguageEditor
        value={props?.value}
        setValue={props?.onChange}
        record={props?.record}
        height={props?.height}
      /> */}
    </>
  );
};
