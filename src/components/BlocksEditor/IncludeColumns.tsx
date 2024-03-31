import React from "react";
import { createRoot } from "react-dom/client";
import { MultiSelect } from "@mantine/core";
import { useAppStore } from "src/store"; // Note: This import seems unused
import { FieldConfiguration } from "@components/interfaces";

interface MultiSelectWrapperProps {
  data: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectWrapper: React.FC<MultiSelectWrapperProps> = ({
  data,
  onChange,
}) => {
  const { activeViewItem } = useAppStore();
  return (
    <MultiSelect
      data={activeViewItem?.fields_configuration.map(
        (item: FieldConfiguration) => item?.field_name
      )}
      value={data}
      onChange={onChange}
      placeholder="Select items"
      searchable
      nothingFound="Nothing found"
    />
  );
};

interface ColumnsData {
  selectedItems: string[];
}

class Columns {
  private data: ColumnsData;
  private container: HTMLElement | null;
  private root: ReturnType<typeof createRoot> | null;
  private onChange: (selectedItems: string[]) => void;

  static get toolbox() {
    return {
      title: "Include Columns",
      icon: "<svg>...</svg>", // Replace with your SVG icon
    };
  }

  constructor({ data }: { data: ColumnsData }) {
    this.data = {
      selectedItems: data.selectedItems || [],
    };

    this.container = null;
    this.root = null;

    this.onChange = (selectedItems: string[]) => {
      this.data.selectedItems = selectedItems;
      console.log(this.data.selectedItems);

      if (this.root) {
        this.root.render(
          <MultiSelectWrapper
            data={this.data.selectedItems}
            onChange={this.onChange}
          />
        );
      }
    };
  }

  render() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.classList.add("tables-tool");
    }

    // Uncomment if needed
    // this.container.addEventListener(
    //   "mousedown",
    //   (event) => {
    //     event.stopPropagation();
    //   },
    //   true
    // );

    if (!this.root) {
      this.root = createRoot(this.container);
    }

    this.root.render(
      <MultiSelectWrapper
        data={this.data.selectedItems}
        onChange={this.onChange}
      />
    );

    return this.container;
  }

  save() {
    return {
      selectedItems: this.data.selectedItems,
    };
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

export default Columns;
