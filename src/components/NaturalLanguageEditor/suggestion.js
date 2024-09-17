// suggestion.js
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SearchInput from "src/components/SearchInput";

export default {
  items: ({ query }) => {
    // No need for the filtering logic here as we'll be using SearchInput to handle search/filter
    return [];
  },

  render: () => {
    let component;
    let popup;

    return {
      onStart: (props) => {
        component = new ReactRenderer(
          (props) => {
            // Render the SearchInput component
            return (
              <SearchInput
                value={props.query} // Pass the current query to the SearchInput
                // onChange={(newValue) => {
                //   // Update the query as the user types in the SearchInput
                //   props.editor.commands.insertContent(`${newValue}`);
                //   popup[0]?.destroy(); // Close the popup once an item is selected
                // }}
                handleOptionSubmit={(selectedItem) => {
                  // Handle the item selection
                  props.command(selectedItem);
                  //   props.editor.commands.insertContent(`${selectedItem.label}`);
                  popup[0]?.destroy(); // Close the popup after insertion
                }}
              />
            );
          },
          { props, editor: props.editor }
        );

        if (!props.clientRect) {
          return;
        }

        // Display the search popup with tippy.js
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
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown?.(props);
      },

      onExit() {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  },
};
