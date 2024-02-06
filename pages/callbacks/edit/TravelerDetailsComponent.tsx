import React from "react";
import { useListState } from "@mantine/hooks";
import { Button, TextInput, NumberInput, Select, Group } from "@mantine/core";

interface TravelerDetail {
  date_of_birth_day: string;
  date_of_birth_month: string;
  date_of_birth_year: string;
  email_address: string;
  first_name: string;
  frequent_flyer_number: string;
  last_name: string;
  passport_number: string;
  phone_number: string;
  phone_number_country: string;
  room_number: number;
  title: string;
  traveler_number: number;
  tsa_precheck: string;
}

type TravelerDetailsComponentProps = {
  travelerDetails: TravelerDetail[];
  setTravelerDetails: (details: TravelerDetail[]) => void;
};

const TravelerDetailsComponent: React.FC<TravelerDetailsComponentProps> = ({
  travelerDetails,
  setTravelerDetails,
}) => {
  const [details, detailsHandlers] = useListState(travelerDetails);

  const handleAddDetail = () => {
    detailsHandlers.append({
      // Initial values for a new traveler detail
      date_of_birth_day: "",
      date_of_birth_month: "",
      date_of_birth_year: "",
      email_address: "",
      first_name: "",
      frequent_flyer_number: "",
      last_name: "",
      passport_number: "",
      phone_number: "",
      phone_number_country: "",
      room_number: details.length + 1,
      title: "",
      traveler_number: details.length + 1,
      tsa_precheck: "",
    });
  };

  const handleRemoveDetail = (index: any) => {
    detailsHandlers.remove(index);
  };

  const handleChange = (index: any, field: string, value: any) => {
    detailsHandlers.setItem(index, { ...details[index], [field]: value });
    setTravelerDetails(details);
  };

  return (
    <div className="space-y-4">
      {details.map((detail, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
          {/* Room Allocation Group */}
          <div className="flex flex-wrap gap-4 mb-4">
            <NumberInput
              className="flex-grow"
              label="Room Number"
              min={1}
              value={detail.room_number}
              onChange={(value) => handleChange(index, "room_number", value)}
            />
            <NumberInput
              className="flex-grow"
              label="Traveler Number"
              min={1}
              value={detail.traveler_number}
              onChange={(value) =>
                handleChange(index, "traveler_number", value)
              }
            />
          </div>
          {/* Tile and Name Group */}
          <div className="flex flex-wrap gap-4 mb-4">
            <TextInput
              className="flex-grow"
              label="Title"
              value={detail.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
            />
            <TextInput
              className="flex-grow"
              label="First Name"
              value={detail.first_name}
              onChange={(e) =>
                handleChange(index, "first_name", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="Last Name"
              value={detail.last_name}
              onChange={(e) => handleChange(index, "last_name", e.target.value)}
            />
          </div>
          {/* Email Address Group */}
          <div className="flex flex-wrap gap-4 mb-4">
            <TextInput
              className="flex-grow"
              label="Email Address"
              value={detail.email_address}
              onChange={(e) =>
                handleChange(index, "email_address", e.target.value)
              }
            />
          </div>
          {/* Phone Number Group */}

          <div className="flex flex-wrap gap-4 mb-4">
            <TextInput
              className="flex-grow"
              label="Phone Number Country"
              value={detail.phone_number_country}
              onChange={(e) =>
                handleChange(index, "phone_number_country", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="Phone Number"
              value={detail.phone_number}
              onChange={(e) =>
                handleChange(index, "phone_number", e.target.value)
              }
            />
          </div>
          {/* Date of Birth Group */}
          <div className="flex flex-wrap gap-4 mb-4">
            <TextInput
              className="flex-grow"
              label="Date of Birth Day"
              value={detail.date_of_birth_day}
              onChange={(e) =>
                handleChange(index, "date_of_birth_day", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="Date of Birth Month"
              value={detail.date_of_birth_month}
              onChange={(e) =>
                handleChange(index, "date_of_birth_month", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="Date of Birth Year"
              value={detail.date_of_birth_year}
              onChange={(e) =>
                handleChange(index, "date_of_birth_year", e.target.value)
              }
            />
          </div>

          {/* Passport, Frequent Flyer Number and TSA Precheck Group */}
          <div className="flex flex-wrap gap-4 mb-4">
            <TextInput
              className="flex-grow"
              label="Passport Number"
              value={detail.passport_number}
              onChange={(e) =>
                handleChange(index, "passport_number", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="Frequent Flyer Number"
              value={detail.frequent_flyer_number}
              onChange={(e) =>
                handleChange(index, "frequent_flyer_number", e.target.value)
              }
            />
            <TextInput
              className="flex-grow"
              label="TSA Precheck"
              value={detail.tsa_precheck}
              onChange={(e) =>
                handleChange(index, "tsa_precheck", e.target.value)
              }
            />
          </div>

          <div className="flex justify-end mt-2">
            {index > 0 && (
              <Button color="red" onClick={() => handleRemoveDetail(index)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button onClick={handleAddDetail}>Add Traveler Detail</Button>
    </div>
  );
};

export default TravelerDetailsComponent;
