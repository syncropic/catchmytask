export interface ITrip {
  related_record: string;
  flight_id: string;
  flight_departure_airport: string;
  flight_arrival_airport: string;
  flight_departure_datetime: Date | string;
  flight_arrival_datetime: Date | string;
  flight_author: string;
  flight_booking_class: string;
  flight_cabin_option: string;
  flight_type: string;
  flight_direction: string;
  trip_id: string;
}

// export a simple react component
const ItripComponent = () => {
  return "hello world!";
};

export default ItripComponent;
