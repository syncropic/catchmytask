import React, { useRef, useEffect } from "react";

// The AudioPlayer component
const AudioPlayer = ({ url }: { url: string }) => {
  // Create a ref for the audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // useEffect hook to set the volume after the component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1; // Set volume to 20%
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <audio controls ref={audioRef}>
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;

// import React from "react";

// // The AudioPlayer component
// const AudioPlayer = ({ url }: { url: string }) => {
//   return (
//     <div>
//       <audio controls>
//         <source src={url} type="audio/mpeg" />
//         Your browser does not support the audio element.
//       </audio>
//     </div>
//   );
// };

// export default AudioPlayer;
