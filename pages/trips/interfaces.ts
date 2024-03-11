export interface ITrip {
  departure_location: string;
  arrival_location: string;
  departure_datetime: Date | string;
  return_datetime: Date | string;
  is_roundtrip: boolean;
  flight_segments: string;
  hotel_segments: string;
  payment_methods: string;
  trip_passengers: string;
  trip_author: string;
  trip_id: string;
  trip_created_date: Date | string;
  trip_updated_date: Date | string;
}

// export a simple react component
const ItripComponent = () => {
  return "hello world!";
};

export default ItripComponent;
