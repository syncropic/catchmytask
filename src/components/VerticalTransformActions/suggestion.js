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
                placeholder="elements"
                description={undefined}
                // handleOptionSubmit={(item) => console.log(item)}
                handleOptionSubmit={(selectedItem) => {
                  // Handle the item selection
                  props.command(selectedItem);
                  // props.editor.commands.insertContent(`${selectedItem?.label}`);
                  // popup[0]?.destroy(); // Close the popup after insertion
                }}
                // value={[]}
                value={props.query} // Pass the current query to the SearchInput
                withinPortal={true}
                // ref={ref}
                // include_action_icons={[
                //   "edit",
                //   "add_new",
                //   "record_info",
                // ]}
                // handleEdit={handleEdit}
                record={{}}
                query_name="fetch elements"
                // navigateOnSelect={{ resource: "views" }}
                // navigateOnClear={{ resource: "home" }}
                // data_items={[
                //   {
                //     name: "fetch spotify audio analysis",
                //     id: "action_steps:1pehwbyh70qsh63coc4e",
                //     author_id: "dpwanjala@gmail.com",
                //     description: "fetch spotify audio analysis",
                //   },
                //   {
                //     name: "fetch or create catchmyvibe audio analysis",
                //     id: "action_steps:95blh99lo9tgd7mbzvzi",
                //     author_id: "dpwanjala@gmail.com",
                //     description: "fetch or create catchmyvibe audio analysis",
                //   },
                // ]}
                // activeFilters={[
                //   {
                //     id: 1,
                //     name: "executable_steps",
                //     description: "executable_steps",
                //     entity_type: "executable_steps",
                //     // is_selected: true,
                //   },
                // ]}
              ></SearchInput>
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
