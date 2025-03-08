// src/components/NaturalLanguageEditor/EmbeddedComponent.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbeddedComponentView } from "./EmbeddedComponentView";

export interface EmbeddedComponentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embeddedComponent: {
      setEmbeddedComponent: (options: {
        type: string;
        props: any;
        id?: string;
        formKey?: string;
      }) => ReturnType;
    };
  }
}

export const EmbeddedComponent = Node.create<EmbeddedComponentOptions>({
  name: "embeddedComponent",

  group: "inline",

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      type: {
        default: null,
      },
      props: {
        default: {},
      },
      id: {
        default: null,
      },
      formKey: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-embedded-component]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-embedded-component": "",
        "data-component-type": HTMLAttributes.type || "",
        "data-component-id": HTMLAttributes.id || "",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setEmbeddedComponent:
        (options) =>
        ({ commands, editor }) => {
          console.log("Setting embedded component:", options);

          // Generate a unique ID if one wasn't provided
          const id = options.id || `component-${Date.now()}`;

          // Create unique formKey based on component type and ID if not provided
          const formKey = options.formKey || `embedded-component-${id}`;

          // Register the component in storage persistence if available
          if (editor.storage.storagePersistence) {
            editor.storage.storagePersistence.registerComponent(
              id,
              options.type,
              options.props || {}
            );
            console.log(
              `Component ${id} registered in storage during creation`
            );
          }

          // Also register in global persistence if available
          if (
            typeof window !== "undefined" &&
            window.registerEditorComponentPersistence &&
            editor.options.element?.dataset?.editorId
          ) {
            const editorId = editor.options.element.dataset.editorId;
            window.registerEditorComponentPersistence(
              editorId,
              id,
              options.type,
              options.props || {}
            );
            console.log(`Component ${id} registered in global persistence`);
          }

          // Special handling for FilterInputTriplet components with variable values
          if (
            options.type === "FilterInputTriplet" &&
            options.props?.variable?.value &&
            typeof window !== "undefined" &&
            window.__ZUSTAND_STORE__
          ) {
            try {
              const store = window.__ZUSTAND_STORE__;
              const state = store.getState();
              const setActionInputFormValues = state.setActionInputFormValues;

              if (typeof setActionInputFormValues === "function") {
                const tripletFormKey = `${formKey}_${options.props.variable.value}`;

                // Create default values or use provided values
                const values = options.props.values || {
                  field: options.props.variable.value,
                  operator: "equals",
                  value: null,
                  value2: null,
                  _metadata: {
                    createdAt: new Date().toISOString(),
                    componentId: id,
                    source: "component_creation",
                  },
                };

                // Initialize the form values in Zustand
                setActionInputFormValues((prev) => ({
                  ...prev,
                  [tripletFormKey]: values,
                }));

                console.log(
                  `Initialized form values for ${id} in Zustand store`
                );
              }
            } catch (error) {
              console.error("Error initializing filter triplet values:", error);
            }
          }

          // Add the component to the document
          return commands.insertContent({
            type: this.name,
            attrs: {
              type: options.type,
              props: options.props || {},
              id,
              formKey,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbeddedComponentView);
  },
});
