import React from "react";
import { Highlight } from "@mantine/core";

export const PageList: React.FC = () => {
  return (
    <div>
      {" "}
      <div
        className="flex flex-col h-screen items-center justify-center p-4"
        style={{
          height: "calc(100vh - 100px)",
        }}
      >
        <p className="text-sm text-gray-600 text-center max-w-sm">
          <Highlight color="lime" highlight="task">
            Create or select a task to continue.
          </Highlight>
        </p>
      </div>
    </div>
  );
};
export default PageList;
// import {
//   HttpError,
//   IResourceComponentsProps,
//   useCreate,
//   useDelete,
//   useGetIdentity,
//   useGo,
//   useInvalidate,
//   useList,
// } from "@refinedev/core";
// import React, { useMemo } from "react";

// import {
//   Anchor,
//   Flex,
//   Group,
//   HoverCard,
//   MantineProvider,
//   Text,
// } from "@mantine/core";
// import { CreateButton } from "@refinedev/mantine";
// import {
//   MantineReactTable,
//   useMantineReactTable,
//   type MRT_ColumnDef,
// } from "mantine-react-table";
// import { useAppStore } from "src/store";
// // import QueryCreate from "../query/create";
// import { IIdentity, ISession } from "@components/interfaces";

// export const PageList: React.FC<IResourceComponentsProps> = () => {
//   const go = useGo();
//   const { mutate: deleteMutate } = useDelete();
//   const { mutate: mutateCreate } = useCreate();
//   const { data: identity } = useGetIdentity<IIdentity>();
//   const invalidate = useInvalidate();
//   const {
//     actionType,
//     setActionType,
//     activeSession,
//     activeApplication,
//     setActiveSession,
//     opened,
//     setOpened,
//   } = useAppStore();

//   const columns = useMemo<MRT_ColumnDef<ISession>[]>(
//     () => [
//       {
//         accessorKey: "name",
//         header: "session",
//         Cell: ({ row }) => (
//           <>
//             <Group>
//               <HoverCard
//                 width={280}
//                 shadow="md"
//                 withinPortal={true}
//                 openDelay={1000}
//               >
//                 <HoverCard.Target>
//                   <Anchor>
//                     <Text
//                       size="sm"
//                       onClick={() => {
//                         // setActionType("setActiveSession");
//                         // setActiveSession(row.original); // do not set here unless you retrieve with the correct query
//                         go({
//                           to: {
//                             resource: "sessions",
//                             action: "show",
//                             id: row.original.id,
//                             meta: {
//                               applicationId: row.original.application,
//                             },
//                           },
//                           type: "push",
//                         });
//                       }}
//                     >
//                       {row.original.name}
//                     </Text>
//                   </Anchor>
//                 </HoverCard.Target>
//                 <HoverCard.Dropdown>
//                   <Anchor>
//                     <Text
//                       size="sm"
//                       onClick={() => {
//                         setActionType("add_to_shortcuts");
//                         mutateCreate(
//                           {
//                             resource: "shortcuts",
//                             values: {
//                               name: row.original.name,
//                               author: identity?.email,
//                               record_name: "sessions",
//                               record_id: row.original.id,
//                             },
//                           },
//                           {
//                             onError: (error, variables, context) => {
//                               // An error occurred!
//                               console.log("error", error);
//                             },
//                             onSuccess: (data, variables, context) => {
//                               // Let's celebrate!
//                               // i don't need to the useCreate hook already does that
//                               // invalidate({
//                               //   resource: "shortcuts",
//                               //   invalidates: ["list"],
//                               // });
//                             },
//                           }
//                         );
//                       }}
//                     >
//                       (+) Add to shortcuts - {row.original.name}
//                     </Text>
//                   </Anchor>
//                 </HoverCard.Dropdown>
//               </HoverCard>
//             </Group>
//           </>
//         ),
//       },
//       {
//         accessorKey: "author",
//         header: "author",
//       },
//     ],
//     [identity]
//   );

//   const {
//     data,
//     isLoading: isLoadingReports,
//     isError: isErrorReports,
//   } = useList<ISession, HttpError>({
//     resource: "sessions",
//     filters: [
//       {
//         field: "session_status",
//         operator: "eq",
//         value: "published",
//       },
//       {
//         field: "application",
//         operator: "eq",
//         value: activeApplication?.id,
//       },
//     ],
//   });

//   const data_items = data?.data ?? [];

//   // useMantineReactTable hook
//   const table = useMantineReactTable({
//     columns,
//     data: data_items,
//     enableColumnResizing: true,

//     enableColumnFilters: true,
//     enableStickyHeader: true,

//     initialState: {
//       density: "xs",
//       // showGlobalFilter: true,
//       showColumnFilters: true,
//       pagination: { pageSize: 7, pageIndex: 0 },
//     },
//     enablePagination: false,
//     enableBottomToolbar: false, //hide the bottom toolbar as well if you want
//     // paginationDisplayMode: "pages",
//     // positionToolbarAlertBanner: "bottom",
//     mantinePaginationProps: {
//       // radius: "xl",
//       size: "xs",
//     },
//     // mantineSearchTextInputProps: {
//     //   placeholder: "Search sessions",
//     // },
//     mantineTableContainerProps: { sx: { maxHeight: "350px" } },

//     renderTopToolbar: ({ table }) => {
//       const handleDelete = () => {
//         table.getSelectedRowModel().flatRows.map((row) => {
//           console.log("deleting " + row.original.id);
//           deleteMutate({
//             resource: "execute",
//             id: row.original.id,
//           });
//         });
//       };

//       const handleActivate = () => {
//         table.getSelectedRowModel().flatRows.map((row) => {
//           alert("activating " + row.getValue("name"));
//         });
//       };

//       const handleContact = () => {
//         table.getSelectedRowModel().flatRows.map((row) => {
//           alert("contact " + row.getValue("name"));
//         });
//       };

//       return (
//         <Flex p="md" justify="space-between">
//           <Flex gap="xs">
//             {/* import MRT sub-components */}
//             {/* <MRT_GlobalFilterTextInput table={table} />
//             <MRT_ToggleFiltersButton table={table} /> */}
//             <CreateButton
//               size="xs"
//               resource="sessions"
//               meta={{ applicationId: activeApplication?.id }}
//             >
//               Create Session
//             </CreateButton>
//           </Flex>
//           <Flex sx={{ gap: "8px" }}></Flex>
//         </Flex>
//       );
//     },
//   });
//   return (
//     <MantineProvider
//       theme={{
//         colorScheme: "light",
//         primaryColor: "blue",
//       }}
//     >
//       <MantineReactTable table={table} />
//     </MantineProvider>
//   );
// };
// export default PageList;
