// src/components/NaturalLanguageEditor/index.tsx
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { EmbeddedComponent } from "./EmbeddedComponent"; // Import the new extension
import styles from "./NaturalLanguageEditor.module.css";
import suggestion from "./suggestion";
import { useAppStore } from "src/store";
import { useParsed } from "@refinedev/core";
import { useEffect } from "react";

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
  const { action_input_form_values, setActionInputFormValues } = useAppStore();

  // Update these functions in your NaturalLanguageEditor component

  // Helper function to safely process embedded components when saving content
  const processContentForSave = (content: any) => {
    if (!content || !content.content) return content;

    // Deep clone to avoid mutating original
    const processedContent = JSON.parse(JSON.stringify(content));

    const processNode = (node: any) => {
      if (node.type === "embeddedComponent" && node.attrs) {
        // Ensure we save the form key for later rehydration
        if (node.attrs.id && !node.attrs.formKey) {
          node.attrs.formKey = `embedded-component-${node.attrs.id}`;
        }

        // Special handling for date values
        if (
          node.attrs.props &&
          node.attrs.type === "DateInput" &&
          node.attrs.props.value
        ) {
          const value = node.attrs.props.value;

          // If it's a Date object, convert to ISO string
          if (value instanceof Date && !isNaN(value.getTime())) {
            node.attrs.props.value = value.toISOString();
          }
          // If it's already a string, make sure it's in a valid format
          else if (
            typeof value === "string" &&
            value.match(/^\d{4}-\d{2}-\d{2}/)
          ) {
            // It's already a valid date string, keep as is
          }
          // For any other format, set to null
          else {
            node.attrs.props.value = null;
          }
        }
      }

      // Process children recursively
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(processNode);
      }
    };

    if (Array.isArray(processedContent.content)) {
      processedContent.content.forEach(processNode);
    }

    return processedContent;
  };

  // Helper function to safely rehydrate components when loading content
  const rehydrateContent = (content: any) => {
    if (!content || !content.content) return content;

    // Deep clone to avoid mutating original
    const processedContent = JSON.parse(JSON.stringify(content));

    const processNode = (node: any) => {
      if (node.type === "embeddedComponent" && node.attrs) {
        const formKey =
          node.attrs.formKey ||
          (node.attrs.id ? `embedded-component-${node.attrs.id}` : null);

        if (formKey && action_input_form_values[formKey]) {
          // Rehydrate with stored values
          node.attrs.props = {
            ...node.attrs.props,
            value:
              action_input_form_values[formKey].value || node.attrs.props.value,
          };
        }

        // Special handling for DateInput components
        if (
          node.attrs.type === "DateInput" &&
          node.attrs.props &&
          node.attrs.props.value
        ) {
          const value = node.attrs.props.value;

          // If it's a string that looks like a date, convert to Date object
          if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
              // Don't set the value directly to avoid errors - use null as fallback
              const date = new Date(value);
              node.attrs.props.value = !isNaN(date.getTime()) ? date : null;
            } catch (e) {
              // If parsing fails, set to null
              node.attrs.props.value = null;
            }
          }
          // If it's not a valid date string, set to null
          else if (!(value instanceof Date) || isNaN(value.getTime())) {
            node.attrs.props.value = null;
          }
        }
      }

      // Process children recursively
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(processNode);
      }
    };

    if (Array.isArray(processedContent.content)) {
      processedContent.content.forEach(processNode);
    }

    return processedContent;
  };

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
      // Add the new EmbeddedComponent extension
      EmbeddedComponent.configure({
        HTMLAttributes: {
          class: styles.embeddedComponent,
        },
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
      // Process content to handle embedded components properly
      const processedContent = processContentForSave(content);
      setValue(processedContent);
    },
  });

  // Rehydrate content when loading
  useEffect(() => {
    if (editor && value) {
      const rehydratedContent = rehydrateContent(value);

      // Only update if content has changed to avoid loops
      const currentContent = editor.getJSON();
      if (
        JSON.stringify(currentContent) !== JSON.stringify(rehydratedContent)
      ) {
        editor.commands.setContent(rehydratedContent);
      }
    }
  }, [editor, value]);

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
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
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
    <>
      {props?.title && <div>{props?.title}</div>}

      <NaturalLanguageEditor
        value={props?.value}
        setValue={props?.onChange}
        record={props?.record}
        height={props?.height}
      />
    </>
  );
};
