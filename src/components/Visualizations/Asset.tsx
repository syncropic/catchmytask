import React from "react";
import GeometricPulse from "./GeometricPulse";

export type AssetType = "geometric-pulse" | "image" | "embed" | "svg";

interface AssetProps {
  type: AssetType;
  src?: string;
  content?: string;
  className?: string;
}

const Asset: React.FC<AssetProps> = ({
  type,
  src,
  content,
  className = "",
}) => {
  const baseClassName = "w-full overflow-hidden " + className;

  switch (type) {
    case "geometric-pulse":
      return (
        <div className={baseClassName}>
          <GeometricPulse />
        </div>
      );

    case "image":
      return (
        <div className={baseClassName}>
          <img src={src} alt="Asset" className="w-full h-auto object-cover" />
        </div>
      );

    case "embed":
      return (
        <div className={baseClassName}>
          <div dangerouslySetInnerHTML={{ __html: content || "" }} />
        </div>
      );

    case "svg":
      return (
        <div className={baseClassName}>
          <div dangerouslySetInnerHTML={{ __html: content || "" }} />
        </div>
      );

    default:
      return null;
  }
};

export default Asset;
