import React from "react";
import { useListState } from "@mantine/hooks";
import { Button, NumberInput, Group } from "@mantine/core";

interface Traveler {
  adults: number;
  children: number;
  room_number: number;
}

type TravelersComponentProps = {
  travelers: Traveler[];
  setTravelers: (travelers: Traveler[]) => void;
};

const TravelersComponent: React.FC<TravelersComponentProps> = ({
  travelers,
  setTravelers,
}) => {
  const [travelersList, travelersHandlers] = useListState(travelers);

  const handleAddTraveler = () => {
    travelersHandlers.append({
      adults: 0,
      children: 0,
      room_number: travelersList.length + 1,
    });
  };

  const handleRemoveTraveler = (index: any) => {
    travelersHandlers.remove(index);
  };

  const handleChange = (index: any, field: any, value: any) => {
    travelersHandlers.setItem(index, {
      ...travelersList[index],
      [field]: value,
    });
    setTravelers(travelersList); // Update the form state
  };

  return (
    <div className="flex flex-col space-y-4">
      {travelersList.map((traveler, index) => (
        <Group
          key={index}
          className="bg-gray-100 p-4 rounded-lg shadow-md items-end"
        >
          <div className="flex items-end space-x-4 w-full">
            <NumberInput
              className="flex-1"
              label="Adults"
              min={0}
              value={traveler.adults}
              onChange={(value) => handleChange(index, "adults", value)}
            />
            <NumberInput
              className="flex-1"
              label="Children"
              min={0}
              value={traveler.children}
              onChange={(value) => handleChange(index, "children", value)}
            />
            <NumberInput
              className="flex-1"
              label="Room Number"
              min={1}
              value={traveler.room_number}
              onChange={(value) => handleChange(index, "room_number", value)}
            />
            {index > 0 && (
              <Button
                color="red"
                onClick={() => handleRemoveTraveler(index)}
                className="ml-auto"
                size="xs"
              >
                Remove
              </Button>
            )}
          </div>
        </Group>
      ))}
      <Button onClick={handleAddTraveler}>Add Traveler</Button>
    </div>
  );
};

export default TravelersComponent;
