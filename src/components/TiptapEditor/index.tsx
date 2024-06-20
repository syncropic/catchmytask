// src/Tiptap.jsx
// import "./styles.scss";
import { useCustomMutation } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
// import Document from "@tiptap/extension-document";
// import Paragraph from "@tiptap/extension-paragraph";
// import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useAppStore } from "src/store";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import { ActionIcon, Button, FileInput, Text, Tooltip } from "@mantine/core";
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

// define your extension array
// const extensions = [Document, Paragraph, Text, Heading];
const extensions = [StarterKit];

// const content = "<p>Hello World!</p>";
interface IEditor {
  value: any;
  // language?: string;
  setFieldValue?: (field: string, value: any) => void;
  // height?: string;
}

const Editor: React.FC<IEditor> = ({
  value,
  setFieldValue,
  // language = "json",
  // height = "30vh",
}) => {
  const {
    // setActiveStructuredQuery,
    // activeStructuredQuery,
    // setActiveQueryGraph,
    activeSession,
  } = useAppStore();
  // console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
  // const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
  //   useDisclosure(false);
  // const [openedChat, { open: openChat, close: closeChat }] =
  //   useDisclosure(false);
  // const { data: identity } = useGetIdentity<IIdentity>();
  const editor = useEditor({
    extensions,
    content: value,
    autofocus: true,
    editable: true,
    injectCSS: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
    // triggered on every change
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setFieldValue("language", "natural_language");
      setFieldValue("type", "json");
      setFieldValue("query", json || "");
      // console.log(json);
      // send the content to an API here
    },
  });

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
    {
      label: "Code",
      name: "select_code",
      icon: "IconCode",
      disabled: false,
    },
    {
      label: "Voice",
      name: "select_template",
      icon: "IconMicrophone",
      disabled: true,
    },
    {
      label: "Camera",
      name: "select_template",
      icon: "IconCamera",
      disabled: true,
    },
    // {
    //   label: "Video",
    //   icon: "IconVideo",
    // },
    {
      label: "Formatting",
      name: "select_template",
      icon: "IconClearFormatting",
      disabled: true,
    },
    // {
    //   label: "Table",
    //   name: "select_table",
    //   icon: "IconClearFormatting",
    //   disabled: true,
    // },
  ];

  const iconMapping = {
    IconScribble: <IconScribble size={12} />,
    IconFiles: <IconFiles size={12} />,
    IconPaperclip: <IconPaperclip size={12} />,
    IconMicrophone: <IconMicrophone size={12} />,
    IconVideo: <IconVideo size={12} />,
    IconCamera: <IconCamera size={12} />,
    IconLibrary: <IconLibrary size={12} />,
    IconBaseline: <IconBaseline size={12} />,
    IconClearFormatting: <IconClearFormatting size={12} />,
    IconCode: <IconCode size={12} />,
  };

  return (
    <>
      {/* {editor && <MenuBar editor={editor} />} */}
      {/* <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
        // className={editor.isActive("bold") ? "is-active" : ""}
      >
        Bold
      </button> */}

      <EditorContent editor={editor} />
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {actions.map((action, index) => (
          <Reveal
            target={
              <Tooltip label={action.label}>
                <ActionIcon
                  aria-label={action.label}
                  disabled={action.disabled}
                >
                  {iconMapping[action.icon]}
                </ActionIcon>
              </Tooltip>
            }
            trigger="click"
          >
            {action.name === "select_template" && (
              <ResourceView
                resource="templates"
                field="name"
                operator="!="
                value={"NONE"}
              ></ResourceView>
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
              <ResourceView
                resource="file_definitions"
                field="name"
                operator="!="
                value={"NONE"}
              ></ResourceView>
            )}
            {action.name === "select_code" && (
              <MonacoEditor value="" language="python"></MonacoEditor>
            )}
          </Reveal>
        ))}
      </div>
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

export default Editor;

const MenuBar = (editor: any) => {
  // const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          // disabled={!editor.can().chain().focus().toggleBold().run()}
          // className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
        {/* <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear marks
        </button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
        >
          Paragraph
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          H4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          H5
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          Blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>
          Hard break
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          Redo
        </button>
        <button
          onClick={() => editor.chain().focus().setColor("#958DF1").run()}
          className={
            editor.isActive("textStyle", { color: "#958DF1" })
              ? "is-active"
              : ""
          }
        >
          Purple
        </button> */}
      </div>
    </div>
  );
};

// const extensions = [
//   Color.configure({ types: [TextStyle.name, ListItem.name] }),
//   TextStyle.configure({ types: [ListItem.name] }),
//   StarterKit.configure({
//     bulletList: {
//       keepMarks: true,
//       keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
//     },
//     orderedList: {
//       keepMarks: true,
//       keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
//     },
//   }),
// ];

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;
