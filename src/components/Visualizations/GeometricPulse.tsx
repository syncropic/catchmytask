import React from "react";

const GeometricPulse = () => {
  return (
    <div
      style={{
        aspectRatio: "16/4.2",
        width: "100vw",
        marginLeft: "50%",
        transform: "translateX(-50%)",
      }}
      className="relative"
    >
      <svg viewBox="0 0 800 220" className="w-full h-full">
        {/* The rest of the SVG content stays exactly the same */}
        <defs>
          <linearGradient id="geo-bg" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#000428" }} />
            <stop offset="100%" style={{ stopColor: "#004e92" }} />
          </linearGradient>

          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="220" fill="url(#geo-bg)" />

        {/* Left Pulse */}
        <g transform="translate(250, 110)">
          <path
            d="M0,-39 L34,-20 L34,20 L0,39 L-34,20 L-34,-20 Z"
            fill="none"
            stroke="#00fff9"
            strokeWidth="2"
            filter="url(#neon-glow)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>

          <g>
            <path
              d="M0,-29 L25,-15 L0,0 Z"
              fill="#ff0099"
              opacity="0.5"
              filter="url(#neon-glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M0,0 L25,15 L0,29 Z"
              fill="#00fff9"
              opacity="0.5"
              filter="url(#neon-glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          <circle r="4" fill="#ff0099">
            <animateMotion
              path="M0,0 A49,49 0 1,1 0,-0.01"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Right Pulse */}
        <g transform="translate(550, 110)">
          <path
            d="M0,-39 L34,-20 L34,20 L0,39 L-34,20 L-34,-20 Z"
            fill="none"
            stroke="#ff0099"
            strokeWidth="2"
            filter="url(#neon-glow)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>

          <g>
            <path
              d="M0,-29 L25,-15 L0,0 Z"
              fill="#00fff9"
              opacity="0.5"
              filter="url(#neon-glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M0,0 L25,15 L0,29 Z"
              fill="#ff0099"
              opacity="0.5"
              filter="url(#neon-glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          <circle r="4" fill="#00fff9">
            <animateMotion
              path="M0,0 A49,49 0 1,0 0,-0.01"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Center connecting element */}
        <path
          d="M 250,110 Q 400,75 550,110"
          fill="none"
          stroke="#ff0099"
          strokeWidth="1"
          opacity="0.3"
          filter="url(#neon-glow)"
        >
          <animate
            attributeName="d"
            values="M 250,110 Q 400,75 550,110;M 250,110 Q 400,145 550,110;M 250,110 Q 400,75 550,110"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* Floating particles */}
        <g>
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              cx={300 + i * 50}
              cy={110}
              r="1.5"
              fill="#00fff9"
              opacity="0.6"
            >
              <animate
                attributeName="cy"
                values={`${110};${103 + i * 2.5};${110}`}
                dur={`${2 + i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur={`${2 + i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default GeometricPulse;
