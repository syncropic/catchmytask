export interface IPayment {
  related_record: string;
  payment_id: string;
  // payment_type: string;
  // payment_source: string;
  payment_status: string;
  // payment_issue: string;
  // payment_issue_description: string;
  payment_currency: string;
  // payment_internal_id: string;
  payment_created_date: Date | string; // Use `Date` for date objects or `string` for date in ISO format
  // payment_added_date: Date | string;
  // payment_details: string;
  payment_account_id: string;
  payment_amount: number;
  // payment_amount_captured: number;
  // payment_amount_refunded: number;
  // payment_amount_to_usd_rate: number;
  // payment_amount_captured_usd: number;
  payment_failure_code: string;
  payment_failure_message: string;
  payment_usage: string;
  payment_author: string;
  pnr: string;
}

// export a simple react component
const OnewurldBookings = () => {
  return "hello world!";
};

export default OnewurldBookings;
