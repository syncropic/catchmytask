import React from "react";
import { createRoot } from "react-dom/client";
import { DateInput } from "@mantine/dates";
import { MultiSelect } from "@mantine/core";
import { TextInput } from "@mantine/core";
import { useAppStore } from "src/store"; // Import your Zustand store

interface ColumnOption {
  type: "date" | "multioptions" | "textinput";
  // Add additional properties as needed for each type
}

interface DataState {
  selectedDate: Date;
  selectedOptions: string[];
  selectedText: string;
}

// Define a simple mapping for component types
const componentMapping = {
  date: DateInput,
  multioptions: MultiSelect,
  textinput: TextInput,
};

const defaultValues = {
  date: new Date(),
  multioptions: [],
  textinput: "",
};

const multiSelectOptions = ["Option 1", "Option 2", "Option 3"]; // Replace with actual options

class ColumnOptionsTool {
  private data: DataState;
  private container: HTMLElement | null;
  private root: ReturnType<typeof createRoot> | null;

  static get toolbox() {
    return {
      title: "ColumnOptions",
      icon: "<svg>...</svg>", // Replace with your SVG icon
    };
  }

  constructor() {
    this.data = {
      selectedDate: new Date(),
      selectedOptions: [],
      selectedText: "",
    };
    this.container = null;
    this.root = null;
  }

  render() {
    if (!this.container) {
      this.container = document.createElement("div");
    }

    // Note: Directly using Zustand store's state here might not trigger re-renders
    // Consider using a function component to handle this logic with hooks
    const selectedColumnType = "date"; // Placeholder, replace with actual logic

    const Component = componentMapping[selectedColumnType];

    const componentProps = {
      date: {
        value: this.data.selectedDate,
        onChange: (date: Date) => {
          this.data.selectedDate = date;
          this.render();
        },
      },
      multioptions: {
        data: multiSelectOptions,
        value: this.data.selectedOptions,
        onChange: (options: string[]) => {
          this.data.selectedOptions = options;
          this.render();
        },
      },
      textinput: {
        value: this.data.selectedText,
        onChange: (text: string) => {
          this.data.selectedText = text;
          this.render();
        },
      },
    }[selectedColumnType];

    if (!this.root) {
      this.root = createRoot(this.container);
    }

    this.root.render(<Component {...componentProps} />);

    return this.container;
  }

  save() {
    // Implement save logic based on the component and its state
    return this.data;
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

export default ColumnOptionsTool;
