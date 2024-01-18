import React, { useState, useEffect } from "react";
import { useAppStore } from "src/store";

interface DeckProps {
  //   loadTrack: (trackId: string) => void; // Function to load a track
  currentTrack: Track | null; // Current track information
  // Additional props can be added as needed
}

// Define a type for track information, adjust according to your data structure
interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number; // Duration in seconds
  // Add more track properties as needed
}

const Deck: React.FC<DeckProps> = ({ currentTrack }) => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  //   const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [tempo, setTempo] = useState(1);

  useEffect(() => {
    // Initialize audio objects and any other setup logic
  }, []);

  // Function to toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Logic to control audio playback
  };

  //   // Function to handle track loading
  //   const onTrackLoad = (trackId: string) => {
  //     loadTrack(trackId);
  //     // Update currentTrack and prepare audio for playback
  //   };

  // Function to change volume
  const onVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Logic to adjust audio output volume
  };

  // Function to change tempo
  const onTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    // Logic to adjust playback rate
  };

  // Function to simulate track progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTrackProgress((prevProgress) => prevProgress + 1); // Increase progress every second
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  // Render the Deck component
  return (
    <div className="deck">
      <div className="controls">
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        />
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={tempo}
          onChange={(e) => onTempoChange(parseFloat(e.target.value))}
        />
        {/* Additional controls like cue, loop, etc. */}
      </div>
      <div className="track-info">
        {currentTrack && (
          <div>
            <div>{currentTrack.name}</div>
            <div>{currentTrack.artist}</div>
            {/* Display track info like duration, BPM, etc. */}
          </div>
        )}
      </div>
      <div className="waveform">{/* Waveform visualization component */}</div>
      <div className="progress">
        <input
          type="range"
          min="0"
          max={currentTrack ? currentTrack.duration : 0}
          value={trackProgress}
          onChange={(e) => setTrackProgress(parseFloat(e.target.value))}
        />
        <span>
          {trackProgress} / {currentTrack ? currentTrack.duration : 0}
        </span>
      </div>
      {/* <button onClick={() => onTrackLoad("trackId")}>Load Track</button> */}
    </div>
  );
};

export default Deck;
