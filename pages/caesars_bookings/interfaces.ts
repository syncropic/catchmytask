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
  flight_change_remarks: string;
  flight_change_message: string;
  flight_change_message_url: string;
  flight_change_assigned_agent: string;
  flight_change_status: string;
  flight_change_type: string;
  flight_confirmation_message: string;
  flight_confirmation_message_url: string;
  booking_type: string;
  sst_itinerary_page_url: string;
  hotel_pnr: string;
  carrier_type: string;
}

// export a simple react component
const OnewurldBookings = () => {
  return "hello world!";
};

export default OnewurldBookings;
