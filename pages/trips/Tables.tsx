import React from "react";
import { createRoot } from "react-dom/client";
import { MultiSelect } from "@mantine/core";

const options = [
  {
    value: "caesars bookings",
    label: "caesars bookings",
  },
  {
    value: "onewurld bookings",
    label: "onewurld bookings",
  },
  {
    value: "onewurld payments",
    label: "onewurld payments",
  },
  {
    value: "caesars payments",
    label: "caesars payments",
  },
];

interface MultiSelectWrapperProps {
  data: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectWrapper: React.FC<MultiSelectWrapperProps> = ({
  data,
  onChange,
}) => {
  return (
    <MultiSelect
      data={options}
      value={data}
      onChange={onChange}
      placeholder="Select items"
      searchable
      nothingFound="Nothing found"
    />
  );
};

interface TablesData {
  selectedItems: string[];
}

class Tables {
  private data: TablesData;
  private container: HTMLElement | null;
  private root: ReturnType<typeof createRoot> | null;
  private onChange: (selectedItems: string[]) => void;

  static get toolbox() {
    return {
      title: "Tables",
      icon: "<svg>...</svg>", // Replace with your SVG icon
    };
  }

  constructor({ data }: { data: TablesData }) {
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

export default Tables;
