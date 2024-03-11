// tools/Tables.ts
import React from "react";
import { createRoot } from "react-dom/client";
import { DatePicker } from "@mantine/dates";

interface DatePickerWrapperProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
}

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  date,
  onChange,
}) => {
  return (
    <DatePicker value={date} onChange={onChange} placeholder="Pick date" />
  );
};

class DatePickerTool {
  private data: { selectedDate: Date | null };
  private container: HTMLElement = document.createElement("div");
  private root: ReturnType<typeof createRoot> | null;
  private onChange: (selectedDate: Date | null) => void;

  static get toolbox() {
    return {
      title: "DatePicker",
      icon: "<svg>...</svg>", // Replace with your SVG icon
    };
  }

  constructor({ data }: { data: any }) {
    this.data = {
      selectedDate: data.selectedDate || null,
    };

    this.onChange = (selectedDate: Date | null) => {
      this.data.selectedDate = selectedDate;
      console.log(this.data.selectedDate);
      this.root?.render(
        <DatePickerWrapper
          date={this.data.selectedDate}
          onChange={this.onChange}
        />
      );
    };

    this.root = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.classList.add("date-picker-tool");

    if (!this.root) {
      this.root = createRoot(this.container);
    }

    this.root.render(
      <DatePickerWrapper
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

export default DatePickerTool;
