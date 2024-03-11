// Define the data structure
export interface IAutomation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  author: string;
  automation_status: string;
  automation_types: AutomationTypeOption[];
  frequency_input_type: FrequencyInputType;
  frequency: string;
  start_datetime: Date | string;
  end_datetime: Date | string;
  request_data: any;
}

export type AutomationTypeOption = "webhook" | "scheduled" | "event-triggered";
export type FrequencyInputType =
  | "option"
  | "natural_language"
  | "cron_expression";

export type FrequencyOptions =
  | "every-1-minute"
  | "every-5-minutes"
  | "every-10-minutes"
  | "every-15-minutes"
  | "every-30-minutes"
  | "every-1-hour"
  | "every-2-hours"
  | "every-3-hours"
  | "every-4-hours"
  | "every-6-hours"
  | "every-8-hours"
  | "every-12-hours"
  | "every-1-day"
  | "every-2-days"
  | "every-3-days"
  | "every-1-week"
  | "every-2-weeks"
  | "every-1-month"
  | "every-2-months"
  | "every-3-months"
  | "every-6-months"
  | "every-1-year";

// export a simple react component
const Automation = () => {
  return "hello world!";
};

export default Automation;
