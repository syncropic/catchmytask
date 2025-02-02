import React from "react";
import { Text, Box, LoadingOverlay } from "@mantine/core";
import {
  IconClock,
  IconCircleX,
  IconCircleCheck,
  IconCircle,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Icon } from "@tabler/icons-react";

type StatusType = "empty" | "pending" | "running" | "failed" | "passed";

interface StatusConfig {
  icon: Icon;
  color: string;
  bgColor: string;
}

interface RecordItem {
  action_status: StatusType;
  start_datetime: string;
  end_datetime: string;
  execution_order: number;
  message?: {
    details?: string;
  };
}

type StatusConfigs = {
  [K in StatusType]: StatusConfig;
};

interface ProcessedItem extends RecordItem {
  name: string;
  duration: string;
  endTime: string;
}

interface ExecutionStatusProps {
  record: {
    [key: string]: RecordItem;
  };
}

const getStatusConfig = (status: StatusType): StatusConfig => {
  const configs: StatusConfigs = {
    empty: {
      icon: IconCircle,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
    },
    pending: {
      icon: IconClock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    running: {
      icon: IconClock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    failed: {
      icon: IconCircleX,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    passed: {
      icon: IconCircleCheck,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  };

  return configs[status] || configs.empty;
};

const formatDateTime = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "hh:mm a");
  } catch (error) {
    return "";
  }
};

const calculateDuration = (start: string, end: string): string => {
  try {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    return `${(durationMs / 1000).toFixed(2)}s`;
  } catch (error) {
    return "";
  }
};

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  const sortedItems: ProcessedItem[] = Object.entries(record)
    .map(([key, value]) => ({
      name: key,
      ...value,
      duration: calculateDuration(value.start_datetime, value.end_datetime),
      endTime: formatDateTime(value.end_datetime),
    }))
    .sort((a, b) => a.execution_order - b.execution_order);

  return (
    <Box className="w-full max-w-4xl">
      <div className="space-y-2">
        {sortedItems.map((item) => {
          const config = getStatusConfig(item.action_status);
          const StatusIcon = config.icon;

          return (
            <div
              key={item.name}
              className="p-2 rounded-md border bg-white hover:bg-gray-50 transition-colors"
            >
              {/* First Row */}
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2">
                  {item.action_status === "running" ? (
                    <Box pos="relative" className="w-6 h-6">
                      <LoadingOverlay
                        visible={true}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }}
                        loaderProps={{
                          color: "blue",
                          size: "xs",
                          type: "dots",
                        }}
                      />
                    </Box>
                  ) : (
                    <div className={`p-1 rounded-full ${config.bgColor}`}>
                      <StatusIcon
                        className={`w-4 h-4 ${config.color}`}
                        stroke={2}
                      />
                    </div>
                  )}
                  <Text className="text-xs font-medium">
                    #{item.execution_order}
                  </Text>
                </div>

                <Text
                  className="font-medium text-sm truncate flex-1"
                  title={item.name}
                >
                  {item.name}
                </Text>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconClock className="w-3 h-3" stroke={1.5} />
                    <span>{item.duration}</span>
                  </div>
                  <Text size="xs" className="text-gray-500">
                    {item.endTime}
                  </Text>
                </div>
              </div>

              {/* Second Row */}
              <Text size="xs" className="text-gray-500 pl-6">
                {item?.message?.details}
              </Text>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default ExecutionStatus;

// import React from "react";
// import { Text, Box, LoadingOverlay } from "@mantine/core";
// import {
//   IconClock,
//   IconCircleX,
//   IconCircleCheck,
//   IconCircle,
// } from "@tabler/icons-react";
// import { format, parseISO } from "date-fns";

// const getStatusConfig = (status) => {
//   const configs = {
//     empty: {
//       icon: IconCircle,
//       color: "text-gray-400",
//       bgColor: "bg-gray-50",
//     },
//     pending: {
//       icon: IconClock,
//       color: "text-orange-500",
//       bgColor: "bg-orange-50",
//     },
//     running: {
//       icon: IconClock,
//       color: "text-blue-500",
//       bgColor: "bg-blue-50",
//     },
//     failed: {
//       icon: IconCircleX,
//       color: "text-red-500",
//       bgColor: "bg-red-50",
//     },
//     passed: {
//       icon: IconCircleCheck,
//       color: "text-green-500",
//       bgColor: "bg-green-50",
//     },
//   };

//   return configs[status] || configs.empty;
// };

// const formatDateTime = (dateStr) => {
//   try {
//     return format(parseISO(dateStr), "hh:mm a");
//   } catch (error) {
//     return "";
//   }
// };

// const calculateDuration = (start, end) => {
//   try {
//     const startTime = new Date(start);
//     const endTime = new Date(end);
//     const durationMs = endTime - startTime;
//     return `${(durationMs / 1000).toFixed(2)}s`;
//   } catch (error) {
//     return "";
//   }
// };

// const ExecutionStatus = ({ record }) => {
//   const sortedItems = Object.entries(record)
//     .map(([key, value]) => ({
//       name: key,
//       ...value,
//       duration: calculateDuration(value.start_datetime, value.end_datetime),
//       endTime: formatDateTime(value.end_datetime),
//     }))
//     .sort((a, b) => a.execution_order - b.execution_order);

//   return (
//     <Box className="w-full max-w-4xl">
//       <div className="space-y-2">
//         {sortedItems.map((item) => {
//           const config = getStatusConfig(item.action_status);
//           const StatusIcon = config.icon;

//           return (
//             <div
//               key={item.name}
//               className="p-2 rounded-md border bg-white hover:bg-gray-50 transition-colors"
//             >
//               {/* First Row */}
//               <div className="flex items-center gap-3 mb-1">
//                 <div className="flex items-center gap-2">
//                   {item.action_status === "running" ? (
//                     <Box pos="relative" className="w-6 h-6">
//                       <LoadingOverlay
//                         visible={true}
//                         zIndex={1000}
//                         overlayProps={{ radius: "sm", blur: 2 }}
//                         loaderProps={{
//                           color: "blue",
//                           size: "xs",
//                           type: "dots",
//                         }}
//                       />
//                     </Box>
//                   ) : (
//                     <div className={`p-1 rounded-full ${config.bgColor}`}>
//                       <StatusIcon
//                         className={`w-4 h-4 ${config.color}`}
//                         stroke={2}
//                       />
//                     </div>
//                   )}
//                   <Text className="text-xs font-medium">
//                     #{item.execution_order}
//                   </Text>
//                 </div>

//                 <Text
//                   className="font-medium text-sm truncate flex-1"
//                   title={item.name}
//                 >
//                   {item.name}
//                 </Text>

//                 <div className="flex items-center gap-3 text-xs text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <IconClock className="w-3 h-3" stroke={1.5} />
//                     <span>{item?.duration}</span>
//                   </div>
//                   <Text size="xs" className="text-gray-500">
//                     {item?.endTime}
//                   </Text>
//                 </div>
//               </div>

//               {/* Second Row */}
//               <Text size="xs" className="text-gray-500 pl-6">
//                 {item?.message?.details}
//               </Text>
//             </div>
//           );
//         })}
//       </div>
//     </Box>
//   );
// };

// export default ExecutionStatus;
