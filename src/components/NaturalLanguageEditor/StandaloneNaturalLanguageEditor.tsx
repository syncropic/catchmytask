// StandaloneNaturalLanguageEditor.tsx
import React, { useState, useEffect, useRef } from "react";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

/**
 * A completely standalone Natural Language Editor with embedded filter triplet components
 * that will reliably persist through state updates and rehydrations.
 */

// We're creating direct implementations of the required components to avoid dependencies

// 1. Storage Extension - This is a key part of our solution
// It permanently stores components in the editor's storage and survives rehydration
const StoragePersistenceExtension = Node.create({
  name: "storagePersistence",

  // This extension doesn't render anything directly
  group: "block",
  selectable: false,
  draggable: false,

  addStorage() {
    return {
      // Component registry that persists through editor lifecycle
      componentRegistry: new Map(),
      // Function to register components
      registerComponent(id, data) {
        this.componentRegistry.set(id, data);
        console.log(`Component registered in storage: ${id}`);
        console.log(`Registry size: ${this.componentRegistry.size}`);
      },
      // Function to check if component exists
      hasComponent(id) {
        return this.componentRegistry.has(id);
      },
      // Function to get component data
      getComponent(id) {
        return this.componentRegistry.get(id);
      },
    };
  },
});

// 2. Basic implementation of an embedded component View
const EmbeddedComponentView = (props) => {
  const { node, editor } = props;
  const { id, type, componentData } = node.attrs;

  // On mount, register this component in the persistence storage
  useEffect(() => {
    if (editor && editor.storage.storagePersistence) {
      editor.storage.storagePersistence.registerComponent(id, componentData);
      console.log(`EmbeddedComponentView mounted: ${id}`);
    }

    return () => {
      console.log(`EmbeddedComponentView unmounted: ${id}`);
    };
  }, []);

  // Simple renderer for our demo
  return (
    <div className="embedded-component" data-component-id={id}>
      <div
        style={{
          background: "#e9f5ff",
          padding: "6px 10px",
          borderRadius: "4px",
          border: "1px solid #cce4ff",
          display: "inline-block",
          margin: "0 3px",
        }}
      >
        {type === "FilterInputTriplet" ? (
          <div>
            <strong>{componentData.label}:</strong>{" "}
            <span style={{ fontFamily: "monospace" }}>
              {componentData.value || "[None]"}
            </span>
          </div>
        ) : (
          <div>{type} Component</div>
        )}
      </div>
    </div>
  );
};

// 3. Embedded Component Extension
const EmbeddedComponentExtension = Node.create({
  name: "embeddedComponent",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      type: { default: null },
      componentData: { default: {} },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-embedded-component]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-embedded-component": "" }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      insertEmbeddedComponent:
        (attrs) =>
        ({ commands, editor }) => {
          // Generate ID if not provided
          const id = attrs.id || `component-${Date.now()}`;

          // Register component in storage first
          if (editor.storage.storagePersistence) {
            editor.storage.storagePersistence.registerComponent(
              id,
              attrs.componentData
            );
          }

          // Then insert the component node
          return commands.insertContent({
            type: this.name,
            attrs: {
              id,
              type: attrs.type,
              componentData: attrs.componentData,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbeddedComponentView);
  },
});

// 4. The main editor component
const StandaloneNaturalLanguageEditor = ({
  initialValue = "",
  onChange = () => {},
  height = "200px",
}) => {
  const [editorReady, setEditorReady] = useState(false);

  // Create the editor with our extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Highlight,
      Placeholder.configure({ placeholder: "Type @ to insert a component..." }),
      // Our custom extensions for component persistence
      StoragePersistenceExtension,
      EmbeddedComponentExtension,
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onTransaction: () => {
      // This helps catch when the editor's content changes
      // We can use this to debug component persistence
      if (editor && editor.storage.storagePersistence) {
        const registry = editor.storage.storagePersistence.componentRegistry;
        if (registry.size > 0) {
          console.log(
            `Transaction - Component registry has ${registry.size} items`
          );
        }
      }
    },
  });

  // Set editor as ready after initialization
  useEffect(() => {
    if (editor) {
      setEditorReady(true);
    }
  }, [editor]);

  // Function to insert a filter triplet component
  const insertFilterTriplet = () => {
    if (!editor) return;

    // Insert a sample filter triplet
    editor.commands.insertEmbeddedComponent({
      type: "FilterInputTriplet",
      componentData: {
        label: "Date Filter",
        field: "date",
        operator: "equals",
        value: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={insertFilterTriplet}
          style={{
            padding: "8px 12px",
            background: "#1c7ed6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Insert Date Filter
        </button>
      </div>

      {editor && (
        <RichTextEditor
          editor={editor}
          style={{
            display: "flex",
            flexDirection: "column",
            height,
          }}
        >
          <RichTextEditor.Toolbar sticky>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

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
        </RichTextEditor>
      )}
    </div>
  );
};

export default StandaloneNaturalLanguageEditor;
