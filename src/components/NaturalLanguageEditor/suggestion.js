// src/components/NaturalLanguageEditor/suggestion.js - Enhanced version
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SearchInput from "src/components/SearchInput";
import variablesService from "src/services/variablesService";
import { isEqual, cloneDeep } from "lodash";
import { getAllComponents } from "./componentRegistry";

// Sample fallback variables if service fails
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
  // Modified to return filtered components based on the query
  items: ({ query }) => {
    // This will be replaced by the actual items from the SearchInput
    // We return empty here because our SearchInput component
    // will handle the filtering and display of items
    return [];
  },

  render: () => {
    let component;
    let popup;
    let preventReopeningFlag = false;
    let insertionInProgressFlag = false;
    let editorIdRef = null; // Store editor ID for persistence

    return {
      onStart: async (props) => {
        console.log("Mention suggestion started", props.query);

        // Clean up the query by removing the leading '/' character
        const cleanQuery = props.query.startsWith("/")
          ? props.query.substring(1)
          : props.query;

        // Try to get editor ID for persistence
        if (
          props.editor &&
          props.editor.options &&
          props.editor.options.element
        ) {
          const editorElement = props.editor.options.element;
          editorIdRef = editorElement.dataset.editorId || null;
        }

        // Prevent reopening if we're inserting a component
        if (preventReopeningFlag) {
          console.log("Preventing reopening due to recent component insertion");
          preventReopeningFlag = false;
          return;
        }

        // Get variables from service or use defaults
        let variables = [];
        try {
          variables = await variablesService.getFilterVariables();
          if (!variables || variables.length === 0) {
            console.log("No variables found, using defaults");
            variables = DEFAULT_VARIABLES;
          } else {
            console.log("Loaded variables:", variables.length);
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
                placeholder="search elements"
                description=""
                handleOptionSubmit={(selectedItem) => {
                  if (!selectedItem) {
                    console.log("No item selected, closing popup");
                    popup[0]?.hide();
                    return;
                  }

                  // Flag to prevent immediate reopening
                  preventReopeningFlag = true;
                  insertionInProgressFlag = true;

                  // Close popup first to avoid multiple instances
                  if (popup && popup[0]) {
                    // Use hide instead of destroy to allow smoother transitions
                    popup[0].hide();
                  }

                  console.log("Component selected:", selectedItem);

                  // Set global flags before insertion
                  window.blockEditorUpdates = true;

                  // Simple timeout to allow UI to update
                  setTimeout(() => {
                    try {
                      // Handle different types of selections
                      if (selectedItem.resultType === "component") {
                        console.log(
                          "Inserting component:",
                          selectedItem.componentType
                        );

                        // Create a unique ID for this component
                        const isFilterTriplet =
                          selectedItem.componentType === "FilterInputTriplet";
                        const timestamp = Date.now();
                        const componentId = isFilterTriplet
                          ? `filter-${selectedItem.componentProps.variable.value}-${timestamp}`
                          : `component-${timestamp}`;

                        // Log before insertion state
                        console.log(
                          "Editor content BEFORE insertion:",
                          props.editor.getJSON()
                        );

                        // Get current selection position for better component placement
                        const { from } = props.editor.state.selection;

                        // ENHANCED: Prepare values if it's a filter triplet
                        let enhancedProps = { ...selectedItem.componentProps };

                        if (isFilterTriplet) {
                          // Add enhanced initialization for filter triplet
                          enhancedProps = {
                            ...enhancedProps,
                            values: {
                              field: selectedItem.componentProps.variable.value,
                              operator: "equals",
                              value: null,
                              value2: null,
                              _metadata: {
                                createdAt: new Date().toISOString(),
                                componentId: componentId,
                              },
                            },
                          };
                        }

                        // CRITICAL: Register component in storage persistence BEFORE inserting
                        // This ensures it will be preserved even if it gets lost in rehydration
                        if (window.registerComponentInStorage) {
                          if (isFilterTriplet) {
                            window.registerComponentInStorage(
                              componentId,
                              "FilterInputTriplet",
                              enhancedProps
                            );
                          } else {
                            window.registerComponentInStorage(
                              componentId,
                              selectedItem.componentType,
                              selectedItem.componentProps || {}
                            );
                          }
                          console.log(
                            `Component ${componentId} registered in editor storage`
                          );
                        } else {
                          console.error(
                            "registerComponentInStorage not available!"
                          );
                          // Try to register directly if possible
                          if (props.editor.storage.storagePersistence) {
                            props.editor.storage.storagePersistence.registerComponent(
                              componentId,
                              isFilterTriplet
                                ? "FilterInputTriplet"
                                : selectedItem.componentType,
                              isFilterTriplet
                                ? enhancedProps
                                : selectedItem.componentProps || {}
                            );
                            console.log(
                              `Direct registration for ${componentId} successful`
                            );
                          }
                        }

                        // ENHANCED: Pre-register values in action_input_form_values
                        if (
                          isFilterTriplet &&
                          window.__ZUSTAND_STORE__ &&
                          enhancedProps.variable &&
                          enhancedProps.variable.value
                        ) {
                          try {
                            const store = window.__ZUSTAND_STORE__;
                            const state = store.getState();
                            const setActionInputFormValues =
                              state.setActionInputFormValues;

                            if (setActionInputFormValues) {
                              // The key format must match what FilterInputTriplet uses
                              const formKey = `embedded-component-${componentId}`;
                              const tripletFormKey = `${formKey}_${enhancedProps.variable.value}`;

                              // Initialize with empty values
                              setActionInputFormValues((prev) => ({
                                ...prev,
                                [tripletFormKey]: {
                                  field: enhancedProps.variable.value,
                                  operator: "equals",
                                  value: null,
                                  value2: null,
                                  _metadata: {
                                    createdAt: new Date().toISOString(),
                                    componentId: componentId,
                                  },
                                },
                              }));

                              console.log(
                                `Pre-registered values for ${componentId} in action_input_form_values`
                              );
                            }
                          } catch (e) {
                            console.error("Error pre-registering values:", e);
                          }
                        }

                        // Also register in Zustand for cross-refresh persistence
                        if (
                          window.registerEditorComponentPersistence &&
                          editorIdRef
                        ) {
                          if (isFilterTriplet) {
                            window.registerEditorComponentPersistence(
                              editorIdRef,
                              componentId,
                              "FilterInputTriplet",
                              enhancedProps
                            );
                          } else {
                            window.registerEditorComponentPersistence(
                              editorIdRef,
                              componentId,
                              selectedItem.componentType,
                              selectedItem.componentProps || {}
                            );
                          }
                          console.log(
                            `Component ${componentId} registered in Zustand for persistence`
                          );
                        }

                        // IMPORTANT: First delete the trigger character from the document
                        // This ensures the "/" is removed before component insertion
                        if (from > 0) {
                          props.editor
                            .chain()
                            .focus()
                            .deleteRange({ from: from - 1, to: from })
                            .run();
                        }

                        // ENHANCED: Insert component with proper form key
                        if (isFilterTriplet) {
                          // Insert filter triplet with formKey
                          props.editor.commands.setEmbeddedComponent({
                            type: "FilterInputTriplet",
                            props: enhancedProps,
                            id: componentId,
                            formKey: `embedded-component-${componentId}`,
                          });
                        } else {
                          // Insert regular component
                          props.editor.commands.setEmbeddedComponent({
                            type: selectedItem.componentType,
                            props: selectedItem.componentProps || {},
                            id: componentId,
                            formKey: `embedded-component-${componentId}`,
                          });
                        }

                        // Log after insertion state
                        setTimeout(() => {
                          console.log(
                            "Editor content AFTER insertion:",
                            props.editor.getJSON()
                          );

                          // Check if component exists
                          const afterContent = props.editor.getJSON();
                          const contentStr = JSON.stringify(afterContent);
                          const componentExists =
                            contentStr.includes(componentId);
                          console.log(
                            `Component ${componentId} exists after insertion: ${componentExists}`
                          );

                          // Auto-focus the inserted component
                          // Auto-focus the inserted component
                          try {
                            // Find the newly inserted component in the DOM
                            const componentElement = document.querySelector(
                              `[data-component-id="${componentId}"]`
                            );

                            if (componentElement) {
                              // TARGET VALUE INPUT SPECIFICALLY - try different selectors in this order:

                              // 1. Try to find an input with a data attribute related to value field
                              let valueInput = componentElement.querySelector(
                                '[data-field="value"]'
                              );

                              // 2. If not found, try to find input inside the value field container
                              if (!valueInput) {
                                const valueFieldContainer =
                                  componentElement.querySelector(
                                    ".form-field-value"
                                  );
                                if (valueFieldContainer) {
                                  valueInput =
                                    valueFieldContainer.querySelector(
                                      "input, textarea"
                                    );
                                }
                              }

                              // 3. If still not found, try more generic selectors based on structure
                              if (!valueInput) {
                                // Try getting the second input element (assumes operator is first, value is second)
                                const inputs =
                                  componentElement.querySelectorAll(
                                    'input, textarea, [contenteditable="true"]'
                                  );
                                if (inputs.length >= 2) {
                                  valueInput = inputs[1]; // Second input is likely the value input
                                }
                              }

                              // 4. If all else fails, find a textbox-like input as they're usually the value inputs
                              if (!valueInput) {
                                valueInput = componentElement.querySelector(
                                  'input[type="text"], input:not([type="checkbox"]), textarea'
                                );
                              }

                              if (valueInput) {
                                // Focus and click the value input element
                                setTimeout(() => {
                                  valueInput.focus();
                                  valueInput.click();
                                }, 100); // Slightly longer timeout to ensure component is fully rendered
                              }
                            }
                          } catch (e) {
                            console.warn(
                              "Error auto-focusing component value field:",
                              e
                            );
                          }

                          // Keep block in place longer for filter triplets
                          const blockDuration = isFilterTriplet ? 1000 : 500;

                          // Remove insertion flag
                          insertionInProgressFlag = false;

                          // Remove block after a delay
                          setTimeout(() => {
                            window.blockEditorUpdates = false;
                            console.log("Removed block on editor updates");

                            // ENHANCED: Verify component persistence after unblocking
                            setTimeout(() => {
                              // 1. Check if component exists in document
                              const finalContent = props.editor.getJSON();
                              const finalContentStr =
                                JSON.stringify(finalContent);
                              const stillExists =
                                finalContentStr.includes(componentId);

                              // 2. Check if it's in storage persistence
                              const inStorage =
                                props.editor.storage?.storagePersistence?.hasComponent(
                                  componentId
                                );

                              // 3. Check if values exist in Zustand
                              let valuesExist = false;
                              if (isFilterTriplet && window.__ZUSTAND_STORE__) {
                                const store = window.__ZUSTAND_STORE__;
                                const state = store.getState();
                                const tripletFormKey = `embedded-component-${componentId}_${enhancedProps.variable.value}`;
                                valuesExist =
                                  !!state.action_input_form_values?.[
                                    tripletFormKey
                                  ];
                              }

                              console.log(`Final component check:`, {
                                componentId,
                                inDocument: stillExists,
                                inStorage: inStorage,
                                valuesExist: valuesExist,
                              });

                              // If component was lost but is in storage, trigger re-registration
                              if (!stillExists && inStorage) {
                                console.log(
                                  `Component ${componentId} lost from document but present in storage, will be restored on next reload`
                                );

                                // Optionally try to re-insert immediately
                                try {
                                  if (
                                    props.editor &&
                                    props.editor.commands &&
                                    props.editor.storage?.storagePersistence
                                  ) {
                                    const component =
                                      props.editor.storage.storagePersistence.getComponent(
                                        componentId
                                      );
                                    if (component) {
                                      props.editor.commands.setEmbeddedComponent(
                                        {
                                          type: component.type,
                                          props: component.props,
                                          id: componentId,
                                          formKey: `embedded-component-${componentId}`,
                                        }
                                      );
                                      console.log(
                                        `Attempted immediate re-insertion of component ${componentId}`
                                      );
                                    }
                                  }
                                } catch (e) {
                                  console.error(
                                    `Error attempting to re-insert component ${componentId}:`,
                                    e
                                  );
                                }
                              }
                            }, 100);
                          }, blockDuration);
                        }, 100);
                      } else {
                        // For regular mentions, we still need to remove the trigger character
                        if (from > 0) {
                          props.editor
                            .chain()
                            .focus()
                            .deleteRange({ from: from - 1, to: from })
                            .run();
                        }

                        // Then insert the selection
                        props.command(selectedItem);
                        insertionInProgressFlag = false;
                      }
                    } catch (error) {
                      console.error("Error inserting component:", error);
                      insertionInProgressFlag = false;
                      window.blockEditorUpdates = false;
                    }
                  }, 100);
                }}
                value={cleanQuery || ""}
                withinPortal={true}
                includeComponents={true} // IMPORTANT: Enable components in search results
                record={{
                  variables_options: variables,
                }}
                query_name="fetch elements"
                data_items={[]}
                autoFocus={true} // Auto-focus the search input when dropdown opens
                compact={true} // Use compact view for dropdown items
              />
            );
          },
          { props, editor: props.editor }
        );

        if (!props.clientRect) {
          console.log("No client rect available, aborting popup");
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
          zIndex: 9999, // Ensure the popup is above other elements
          onHide() {
            console.log("Tippy popup hidden");
          },
        });

        // Explicitly focus the search input after popup is shown
        setTimeout(() => {
          try {
            // Find the search input in the popup
            const searchInput = popup[0]?.popper?.querySelector("input");
            if (searchInput) {
              searchInput.focus();
            }
          } catch (e) {
            console.warn("Error focusing search input:", e);
          }
        }, 50);
      },

      onUpdate(props) {
        // Don't update if insertion is in progress
        if (preventReopeningFlag || insertionInProgressFlag) {
          console.log("Skipping update due to ongoing insertion");
          return;
        }

        if (component && component.updateProps) {
          component.updateProps(props);
        }

        if (!props.clientRect || !popup || !popup[0]) {
          console.log("Cannot update popup: missing clientRect or popup");
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });

        // Re-focus the search input on every update
        setTimeout(() => {
          try {
            const searchInput = popup[0]?.popper?.querySelector("input");
            if (searchInput) {
              searchInput.focus();
            }
          } catch (e) {
            console.warn("Error re-focusing search input:", e);
          }
        }, 10);
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          console.log("Escape key pressed, hiding popup");
          if (popup && popup[0]) {
            popup[0].hide();
          }
          return true;
        }

        return component?.ref?.onKeyDown?.(props) || false;
      },

      onExit() {
        // Don't exit if insertion is in progress
        if (preventReopeningFlag || insertionInProgressFlag) {
          console.log("Skipping exit due to ongoing insertion");
          return;
        }

        console.log("Exiting suggestion UI");
        if (popup && popup[0]) {
          popup[0].hide();
        }

        if (component && component.destroy) {
          component.destroy();
        }
      },
    };
  },
};
