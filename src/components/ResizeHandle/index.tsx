import React from "react";

const ResizeHandle = () => {
  return (
    <div className="relative w-1 bg-gray-200/20 hover:bg-gray-300/80 transition-colors duration-300 cursor-ew-resize shadow-sm hover:shadow-md">
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fas fa-arrows-alt-h text-gray-500"></i>
      </div>
    </div>
  );
};

export default ResizeHandle;
