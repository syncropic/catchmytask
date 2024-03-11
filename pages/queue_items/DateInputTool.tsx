import React from "react";
import { createRoot } from "react-dom/client";
import { DateInput } from "@mantine/dates";

interface DateInputWrapperProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
}

const DateInputWrapper: React.FC<DateInputWrapperProps> = ({
  date,
  onChange,
}) => {
  return (
    <DateInput
      value={date}
      onChange={onChange}
      placeholder="Pick date"
      // You can add more props here as per your requirement
    />
  );
};

interface DateInputToolData {
  selectedDate: Date | null;
}

class DateInputTool {
  private data: DateInputToolData;
  private container: HTMLElement | null;
  private root: ReturnType<typeof createRoot> | null;
  private onChange: (selectedDate: Date | null) => void;

  static get toolbox() {
    return {
      title: "DateInput",
      icon: "<svg>...</svg>", // Replace with your SVG icon
    };
  }

  constructor({ data }: { data: DateInputToolData }) {
    this.data = {
      selectedDate: data.selectedDate || null,
    };

    this.container = null; // Initialize container
    this.root = null; // Initialize root

    this.onChange = (selectedDate: Date | null) => {
      this.data.selectedDate = selectedDate;
      console.log(this.data.selectedDate);
      this.root?.render(
        <DateInputWrapper
          date={this.data.selectedDate}
          onChange={this.onChange}
        />
      );
    };
  }

  render() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.classList.add("date-picker-tool");
    }

    if (!this.root) {
      this.root = createRoot(this.container);
    }

    this.root.render(
      <DateInputWrapper
        date={this.data.selectedDate}
        onChange={this.onChange}
      />
    );

    return this.container;
  }

  save() {
    return {
      selectedDate: this.data.selectedDate,
    };
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

export default DateInputTool;
