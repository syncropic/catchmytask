import React, { useState } from "react";
import Deck from "./Deck"; // Import your Deck component
import { useAppStore } from "src/store";

// // Assuming Track type is defined elsewhere
// interface Track {
//   id: string;
//   name: string;
//   artist: string;
//   duration: number;
//   // ... other properties
// }

// // Placeholder function to simulate fetching track data
// const fetchTrackDetails = async (trackId: string): Promise<Track> => {
//   // Replace this with actual API call or data fetching logic
//   // Example response structure
//   return {
//     id: trackId,
//     name: "Sample Track",
//     artist: "Sample Artist",
//     duration: 240, // Example duration in seconds
//     // Add more properties as needed
//   };
// };

const ParentComponent: React.FC = () => {
  // State for the current track
  //   const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const deck1Track = useAppStore((state) => state.deck1Track);
  const deck2Track = useAppStore((state) => state.deck2Track);

  // Function to load a track
  //   const loadTrack = async (trackId: string) => {
  //     // Fetch track details (implement this logic)
  //     const trackDetails = await fetchTrackDetails(trackId);
  //     setCurrentTrack(trackDetails); // Update the current track
  //   };

  return (
    <div>
      {/* Pass loadTrack and setCurrentTrack to Deck */}
      {/* <Deck
        loadTrack={(trackId) => loadTrack("123")}
        currentTrack={currentTrack}
      />
      <div> */}
      <Deck currentTrack={deck1Track} />
      <Deck currentTrack={deck2Track} />
    </div>
  );
};

export default ParentComponent;
