export interface IOnewurldBooking {
  id: string;
  sst_booking_number: string;
  sst_passenger_name: string;
  sst_status: string;
  analysis_supplier_status: string;
  sst_supplier_cost_usd: number; // Changed from string to number (decimal)
  analysis_supplier_cost_usd: number; // Changed from string to numeric
  analysis_supplier_currency: string;
  supplier_currency: string;
  sst_booking_type: string;
  sst_final_selling_price_usd: number; // Changed from string to decimal
  sst_payment_form: string;
  sst_status_and_supplier_status_comparison: string;
  sst_supplier_name: string;
  sst_distributor_name: string;
  related_record: string;
  reporting_date: Date; // Changed from string to datetime
  issues: string;
  has_unresolved_supplier_issue: string;
  has_unresolved_finance_issue: string;
  reporting_date_id: string;
  sst_sales_date: Date;
  sst_payment_date: Date;
  sst_cancel_date: Date;
  sst_pay_later_deadline: Date;
  sst_distributor_id: string;
  sst_ccard_margin: number; // decimal
  sst_sst_margin: number; // decimal
  sst_distributor_margin: number; // decimal
  sst_super_distributor_margin: number; // decimal
  sst_forex_margin: number; // decimal
  sst_agent_markup: number; // decimal
  sst_marketing_fee: number; // decimal
  sst_redeemed_voucher_amount_usd: number; // decimal
  sst_prepaid_postpaid: string;
  sst_is_test_booking: string;
  sst_is_rebooked: string;
  sst_is_paylater: string;
  sst_supplier_id: string;
  sst_transaction_number: string;
  sst_supplier_cost: number; // decimal
  has_unresolved_supplier_issues: string;
  has_unresolved_finance_issues: string;
  analysis_supplier_cost_to_usd_rate: number; // numeric
  analysis_supplier_created_date: Date;
  analysis_supplier_updated_date: Date;
  supplier_cost_difference: number; // numeric
  supplier_cost_comparison: string;
  payment_succeeded_count: number; // int
  payment_amount_captured_usd_total: number; // numeric
  payment_status: string; // nvarchar changed to string for TypeScript compatibility
  sst_status_and_payment_status_comparison: string;
  paid_vs_selling_amount_usd_difference: number; // numeric
  paid_vs_selling_amount_usd_comparison: string;
  original_payment_currencies: string;
  payment_amount_to_usd_rate: number; // numeric
}

// export a simple react component
const OnewurldBookings = () => {
  return "hello world!";
};

export default OnewurldBookings;
