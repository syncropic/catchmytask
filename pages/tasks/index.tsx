import React from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { ScrollArea, Table, Pagination, Group } from "@mantine/core";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/mantine";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "author",
        accessorKey: "author",
        header: "Author",
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: "Created At",
        cell: function render({ getValue }) {
          return <DateField value={getValue<any>()} />;
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
      },
      {
        id: "id",
        accessorKey: "id",
        header: "Id",
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
      },
      // {
      //   id: "name",
      //   header: "Name",
      //   accessorKey: "name",
      //   cell: function render({ getValue, table }) {
      //     const meta = table.options.meta as {
      //       nameData: GetManyResponse;
      //     };

      //     const name = meta.nameData?.data?.find(
      //       (item) => item.id == getValue<any>()
      //     );

      //     return name?.name ?? "Loading...";
      //   },
      // },
      {
        id: "published",
        accessorKey: "published",
        header: "Published",
      },
      // {
      //   id: "status",
      //   header: "Status",
      //   accessorKey: "status",
      //   cell: function render({ getValue, table }) {
      //     const meta = table.options.meta as {
      //       statusData: GetManyResponse;
      //     };

      //     const status = meta.statusData?.data?.find(
      //       (item) => item.id == getValue<any>()
      //     );

      //     return status?.name ?? "Loading...";
      //   },
      // },
      {
        id: "actions",
        accessorKey: "id",
        header: "Actions",
        cell: function render({ getValue }) {
          return (
            <Group spacing="xs" noWrap>
              <ShowButton hideText recordItemId={getValue() as string} />
              <EditButton hideText recordItemId={getValue() as string} />
              <DeleteButton hideText recordItemId={getValue() as string} />
            </Group>
          );
        },
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    setOptions,
    refineCore: {
      setCurrent,
      pageCount,
      current,
      tableQueryResult: { data: tableData },
    },
  } = useTable({
    columns,
  });

  // const { data: nameData } = useMany({
  //   resource: "names",
  //   ids: tableData?.data?.map((item) => item?.name) ?? [],
  //   queryOptions: {
  //     enabled: !!tableData?.data,
  //   },
  // });

  // const { data: statusData } = useMany({
  //   resource: "statuses",
  //   ids: tableData?.data?.map((item) => item?.status) ?? [],
  //   queryOptions: {
  //     enabled: !!tableData?.data,
  //   },
  // });

  // setOptions((prev) => ({
  //   ...prev,
  //   meta: {
  //     ...prev.meta,
  //     nameData,
  //     statusData,
  //   },
  // }));

  return (
    <List>
      <ScrollArea>
        <Table highlightOnHover>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id}>
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
      <br />
      <Pagination
        position="right"
        total={pageCount}
        page={current}
        onChange={setCurrent}
      />
    </List>
  );
};
export default PageList;
