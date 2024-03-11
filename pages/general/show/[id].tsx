import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useGo,
  useNavigation,
} from "@refinedev/core";
import { Show, TextField, DateField, CloneButton } from "@refinedev/mantine";
import { Accordion, Anchor, Flex, MantineProvider, Title } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { Text, Code, Button } from "@mantine/core";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mantine";
import { useParsed } from "@refinedev/core";
import TableView from "src/components/tableview";
import { useAppStore } from "src/store";
import ShowView from "@components/ShowView";
import { IconAffiliate, IconTableShortcut } from "@tabler/icons-react";
import { createColumnDef, RowData } from "@components/Utils";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParsed();
  const {
    activeQuery,
    setActiveQuery,
    activeQueryResults,
    setActiveQueryResults,
    setActiveSession,
    activeColumnOptions,
    setActiveColumnOptions,
    activeItem_2,
  } = useAppStore();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  // use effect to set activeSession when data changes
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
    data: mutationData,
  } = useCustomMutation();
  // const go = useGo();

  // set a set called columns
  // const [columns, setColumns] = useState([]);
  // console.log("columns", columns);

  // const data_columns = useMemo(
  //   () => columns.map((column) => createColumnDef<RowData>(column)),
  //   [columns]
  // );
  let active_item_2_columns = [
    // { id: 0, field_name: "classes", visible: true },
    // { id: 1, field_name: "functions", visible: true },
    // { id: 2, field_name: "globals", visible: true },
    // { id: 3, field_name: "imports", visible: true },
    { field_name: "path", visible: true, data_type: "varchar", pin: "left" },
  ];
  console.log("active_item_2_columns", active_item_2_columns);

  const record = data?.data;
  // console.log("record", record);
  // function called renderColumns that takes in a record and returns an array of columns
  // const renderColumns = (record: any) => {
  //   let fields_configuration = record?.fields_configuration;
  //   let columns = fields_configuration?.map((field: any) => {
  //     return {
  //       ...field,
  //     };
  //   });
  //   setColumns(columns);
  // };
  // console.log("renderColumns", renderColumns(record));
  // use effect that calls the renderColumns function
  useEffect(() => {
    if (record) {
      // set activeQuery
      // setActiveQuery(record?.active_query);
      // set activeColumnOptions
      setActiveColumnOptions(
        record?.fields_configuration.map((field: any) => {
          return {
            ...field,
            value: field.field_name,
            label: field.field_name,
          };
        })
      );
      setActiveSession(record);
      runActiveQuery();
      // renderColumns(record);
    }
  }, [record]);
  // use effect to update activeQueryResults when mutationData changes
  useEffect(() => {
    if (mutationData) {
      setActiveQueryResults(mutationData);
    }
  }, [mutationData]);

  const runActiveQuery = () => {
    // setActiveQuery(values);
    setActiveQuery(record?.active_query);
    let request_data = {
      ...record?.active_query,
      // ...activeActionOption,
      // id: addSeparator(activeActionOption?.id, "action_options"),
      // values: {
      //   ...record,
      //   ...values, // so i can override original in the form if not disabled
      //   billing_addresses: JSON.parse(values?.billing_addresses),
      //   flight_segments: JSON.parse(values?.flight_segments),
      //   hotel_segments: JSON.parse(values?.hotel_segments),
      //   payment_methods: JSON.parse(values?.payment_methods),
      //   trip_passengers: JSON.parse(values?.trip_passengers),
      //   action_options: [
      //     addSeparator(activeActionOption?.id, "action_options"),
      //   ],
      // },
    };
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
      dataProviderName: "catchmytaskApiDataProvider",
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        // invalidate({
        //   resource: "caesars_bookings",
        //   invalidates: ["list"],
        // });
        // close();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  console.log("fields_configuration", record?.fields_configuration || []);

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={({ defaultButtons }) => (
          <>
            {/* {defaultButtons} */}
            <EditButton resource="sessions" size="xs" />
            {/* <Button disabled size="xs">
              Duplicate
            </Button> */}
            <CloneButton
              size="xs"
              // onClick={() => {
              //   clone("sessions", "123");
              // }}
              resource="sessions"
              recordItemId={record?.id}
              // meta={{
              //   id: record?.id,
              //   resource: "sessions",
              //   query: { id: record?.id },
              // }}
            >
              Clone
            </CloneButton>
          </>
        )}
      >
        <Text>
          <b>id:</b> {record?.id}
        </Text>
        <Text>
          <b>name:</b> {record?.name}
        </Text>
        <Accordion defaultValue="quick_access">
          <Accordion.Item key="quick_access" value="quick_access">
            <Accordion.Control icon={<IconTableShortcut size={16} />}>
              Top Level
            </Accordion.Control>
            <Accordion.Panel>
              <TableView
                resource={record?.resource}
                data_columns={record?.fields_configuration || []}
                activeQueryResults={activeQueryResults}
              ></TableView>
            </Accordion.Panel>
          </Accordion.Item>
          {/* <Accordion.Item key="query" value="query">
            <Accordion.Control icon={<IconAffiliate size={16} />}>
              active item level 2
            </Accordion.Control>
            <Accordion.Panel>
              <ShowView id={activeItem_2?.id} resource="task" />
            </Accordion.Panel>
          </Accordion.Item> */}
        </Accordion>
        <ShowView
          id={activeItem_2?.id}
          resource="applications"
          display_components={["header", "details", "files"]}
          default_display_component="files"
        />
        <TableView
          resource="applications"
          // data_columns={Object.keys(record?.files?.[0] || {}).map(
          //   (item, index) => ({
          //     id: index,
          //     field_name: item,
          //     visible: true,
          //   })
          // )}
          data_columns={
            [
              {
                data_type: "varchar",
                display_component: "FilePath",
                field_name: "file_path",
                pin: "left",
                visible: true,
              },
            ] || []
          }
          activeQueryResults={{ data: activeItem_2?.files }}
        ></TableView>
      </Show>
    </>
  );
};
export default PageShow;
