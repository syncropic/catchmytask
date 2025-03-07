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
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setEmbeddedComponent:
        (options) =>
        ({ commands }) => {
          // Generate a unique ID if one wasn't provided
          const id =
            options.id ||
            `embedded-component-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;

          return commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              id,
              formKey: `embedded-component-${id}`,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbeddedComponentView);
  },
});
