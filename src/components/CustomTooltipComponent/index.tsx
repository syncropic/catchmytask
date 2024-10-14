import React from "react";
import { Tooltip, Text } from "@mantine/core";

interface CustomTooltipComponentProps {
  item: {
    entity_type?: string;
    title?: string;
    name?: string;
    id?: string;
  };
  children?: React.ReactNode;
}

// const CustomTooltipComponent: React.FC<CustomTooltipComponentProps> = ({
//   item,
//   children,
// }) => {

//   return (
//     <Tooltip
//       multiline
//       w={220}
//       withArrow
//       transitionProps={{ duration: 200 }}
//       label={`Click to see ${item?.entity_type ? item.entity_type : ""}${
//         item?.entity_type && (item?.title || item?.name || item?.id)
//           ? " : "
//           : ""
//       }${
//         item?.title ||
//         item?.name ||
//         item?.id ||
//         (!item?.entity_type ? "item" : "")
//       } details or expand to update`}
//     >
//       <Text size="sm" className="text-blue-500 whitespace-normal">
//         {item.title}
//       </Text>
//     </Tooltip>
//   );
// };

// export default CustomTooltipComponent;

interface CustomTooltipComponentProps {
  item: {
    entity_type?: string;
    title?: string;
    name?: string;
    id?: string;
  };
  children?: React.ReactNode;
  disableTooltip?: boolean; // New prop to disable tooltip
}

const CustomTooltipComponent: React.FC<CustomTooltipComponentProps> = ({
  item,
  children,
  disableTooltip = false, // Default to false
}) => {
  const label = `Click to see ${item?.entity_type ? item.entity_type : ""}${
    item?.entity_type && (item?.title || item?.name || item?.id) ? " : " : ""
  }${
    item?.title || item?.name || item?.id || (!item?.entity_type ? "item" : "")
  } details or expand to update`;

  // If tooltip is disabled, render only the children without the Tooltip wrapper
  return disableTooltip ? (
    <>{children}</>
  ) : (
    <Tooltip
      multiline
      w={220}
      withArrow
      transitionProps={{ duration: 200 }}
      label={label}
    >
      <Text size="sm" className="text-blue-500 whitespace-normal">
        {children}
      </Text>
    </Tooltip>
  );
};

export default CustomTooltipComponent;
