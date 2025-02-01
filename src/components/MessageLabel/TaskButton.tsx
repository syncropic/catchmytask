import React from "react";
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconLoader,
} from "@tabler/icons-react";

const TaskButton = ({
  state,
  onClick,
  disabled,
}: {
  state: string;
  onClick: any;
  disabled: boolean;
}) => {
  const getButtonStyles = () => {
    if (disabled) {
      return `
        bg-gray-200
        text-gray-400
        border border-gray-300
        shadow-sm
      `;
    }
    if (state === "running") {
      return `
        bg-white
        hover:bg-red-50
        text-blue-600
        hover:text-red-500
        border border-blue-400
        hover:border-red-400
        shadow-md
      `;
    }
    return `
      bg-white
      hover:bg-blue-50
      text-gray-700
      hover:text-blue-600
      border border-gray-300
      hover:border-blue-400
      shadow-sm hover:shadow-md
    `;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes smooth-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .smooth-spin {
          animation: smooth-spin 2s linear infinite;
          transform-origin: center;
          display: inline-flex;
        }
      `}</style>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative flex items-center justify-center
          h-8 px-3 rounded-md
          transition-all duration-300
          ${getButtonStyles()}
          text-xs font-semibold
          ${!disabled && "cursor-pointer"}
        `}
      >
        <div className="relative flex items-center gap-1.5">
          <span className="min-w-[2.5rem]">
            {state === "running" ? "Stop" : "Start"}
          </span>
          <div className="flex items-center justify-center">
            {state === "running" ? (
              <IconLoader
                size={14}
                className={disabled ? "" : "smooth-spin"}
                style={{ strokeWidth: 2.5 }}
              />
            ) : (
              <IconPlayerPlay size={14} style={{ strokeWidth: 2.5 }} />
            )}
          </div>
        </div>

        {state === "running" && !disabled && (
          <div
            className={`
              absolute inset-0 rounded-md
              flex items-center justify-center gap-1.5
              opacity-0 hover:opacity-100
              transition-all duration-300
              bg-red-50
              border border-red-400
              cursor-pointer
            `}
          >
            <span className="text-red-500 text-xs font-semibold min-w-[2.5rem]">
              Stop
            </span>
            <IconPlayerStop
              size={14}
              className="text-red-500"
              style={{ strokeWidth: 2.5 }}
            />
          </div>
        )}
      </button>
    </>
  );
};

export default TaskButton;
