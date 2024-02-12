export interface IBooking {
  related_record: string;
  flight_pnr: string;
  flight_airline_reference_code: string;
  contact_email: string;
  contact_name: string;
  sst_booking_full_name: string;
  sst_internal_id: string;
  sst_created_date_pst: Date | string;
  sst_departure_date_pst: Date | string;
  flight_change_pnr_old_text: string;
  flight_change_pnr_new_text: string;
  flight_confirmation_message: string;
  flight_confirmation_message_url: string;
}

export interface IOnewurldBookingFilteredFields {
  sst_booking_number: string;
  sst_passenger_name: string;
  sst_status: string;
  analysis_supplier_status: string;
  sst_supplier_cost_usd: number;
  analysis_supplier_cost_usd: number;
  analysis_supplier_currency: string;
  supplier_currency: string;
  sst_booking_type: string;
  sst_final_selling_price_usd: number;
  sst_payment_form: string;
  sst_status_and_supplier_status_comparison: string;
  sst_supplier_name: string;
  sst_distributor_name: string;
  related_record: string;
  reporting_date: Date;
  issues: string;
  has_unresolved_supplier_issues: string;
  has_unresolved_finance_issues: string;
  number_of_unresolved_issues: number;
  sst_sales_date: Date;
  sst_payment_date: Date;
  sst_cancel_date: Date;
  sst_pay_later_deadline: Date;
  sst_distributor_id: string;
  sst_ccard_margin: number;
  sst_sst_margin: number;
  sst_distributor_margin: number;
  sst_super_distributor_margin: number;
  sst_forex_margin: number;
  sst_agent_markup: number;
  sst_marketing_fee: number;
  sst_redeemed_voucher_amount_usd: number;
  sst_prepaid_postpaid: string;
  sst_is_test_booking: string;
  sst_is_rebooked: string;
  sst_is_paylater: string;
  sst_supplier_id: string;
  sst_transaction_number: string;
  sst_supplier_cost: number;
  analysis_supplier_cost_to_usd_rate: number;
  analysis_supplier_created_date: Date;
  analysis_supplier_updated_date: Date;
  supplier_cost_difference: number;
  supplier_cost_comparison: string;
  analysis_payment_succeeded_count: number;
  analysis_payment_amount_captured_usd_sum: number;
  analysis_payment_status: string;
  analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_difference: number;
  analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_comparison: string;
}

export interface IView {
  id: string;
  name: string;
}

export type IIdentity = {
  [key: string]: any;
};

// Assuming some type definitions (adjust according to your actual types)
export interface ColumnConfig {
  field_name: string;
  visible?: boolean;
  pin?: "left" | "right";
}

export interface Column {
  id: string;
  // ... other properties
}

// export a simple react component
const OnewurldBookings = () => {
  return "hello world!";
};

export default OnewurldBookings;
