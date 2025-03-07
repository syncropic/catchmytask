import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SearchInput from "src/components/SearchInput";
import variablesService from "src/services/variablesService";

// Sample fallback variables
const DEFAULT_VARIABLES = [
  {
    label: "Date",
    type: "date",
    value: "date",
  },
  {
    label: "Amount",
    type: "number",
    value: "amount",
  },
];

export default {
  items: ({ query }) => {
    return [];
  },

  render: () => {
    let component;
    let popup;
    let preventReopeningFlag = false;

    return {
      onStart: async (props) => {
        // Prevent reopening if we're inserting a component
        if (preventReopeningFlag) {
          preventReopeningFlag = false;
          return;
        }

        // Get variables from service or use defaults
        let variables = [];
        try {
          variables = await variablesService.getFilterVariables();
          if (!variables || variables.length === 0) {
            variables = DEFAULT_VARIABLES;
          }
        } catch (error) {
          console.error("Error loading variables:", error);
          variables = DEFAULT_VARIABLES;
        }

        // Store variables in editor storage for later use
        if (props.editor && props.editor.storage) {
          props.editor.storage.mentionSuggestion = {
            variables,
          };
        }

        component = new ReactRenderer(
          (props) => {
            return (
              <SearchInput
                placeholder="Search filters or elements"
                description="Insert filter fields or other components"
                handleOptionSubmit={(selectedItem) => {
                  if (!selectedItem) {
                    popup[0]?.destroy();
                    return;
                  }

                  // Set flag to prevent immediate reopening
                  preventReopeningFlag = true;

                  // Close popup before inserting to prevent reopening issues
                  if (popup && popup[0]) {
                    popup[0].destroy();
                  }

                  // Important: Use a longer delay before inserting the component for filter triplets
                  setTimeout(() => {
                    // Handle different types of selections
                    if (selectedItem.resultType === "component") {
                      if (selectedItem.componentType === "FilterInputTriplet") {
                        // Use a longer timeout for filter triplets
                        props.editor.commands.setEmbeddedComponent({
                          type: "FilterInputTriplet",
                          props: {
                            variable: selectedItem.componentProps.variable,
                            compact: true,
                          },
                        });
                      } else {
                        // Insert as a regular embedded component
                        props.editor.commands.setEmbeddedComponent({
                          type: selectedItem.componentType,
                          props: selectedItem.componentProps || {},
                        });
                      }
                    } else {
                      // Handle as a regular mention
                      props.command(selectedItem);
                    }
                  }, 50); // Increase timeout slightly
                }}
                value={props.query || ""}
                withinPortal={true}
                record={{
                  variables_options: variables,
                }}
                query_name="fetch elements"
                data_items={[]}
                includeComponents={true}
              />
            );
          },
          { props, editor: props.editor }
        );

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props) {
        // Don't update if we're preventing reopening
        if (preventReopeningFlag) return;

        if (component && component.updateProps) {
          component.updateProps(props);
        }

        if (!props.clientRect || !popup || !popup[0]) return;

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          if (popup && popup[0]) {
            popup[0].hide();
          }
          return true;
        }

        return component?.ref?.onKeyDown?.(props) || false;
      },

      onExit() {
        // Don't exit if we're preventing reopening
        if (preventReopeningFlag) return;

        if (popup && popup[0]) {
          popup[0].destroy();
        }

        if (component && component.destroy) {
          component.destroy();
        }
      },
    };
  },
};
