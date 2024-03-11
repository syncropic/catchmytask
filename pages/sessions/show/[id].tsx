import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useGo,
  useNavigation,
} from "@refinedev/core";
import { Show, TextField, DateField, CloneButton } from "@refinedev/mantine";
import {
  Accordion,
  Anchor,
  Flex,
  MantineProvider,
  ScrollArea,
  Title,
} from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { Text, Code, Button } from "@mantine/core";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mantine";
import { useParsed } from "@refinedev/core";
import TableView from "src/components/tableview";
import { useAppStore } from "src/store";
import ShowView from "@components/ShowView";
import { IconAffiliate, IconTableShortcut } from "@tabler/icons-react";

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

  const record = data?.data;

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
      // enhance data with additional columns for additional ui and other purposes i.e add a colum for resource
      const item_metadata = {
        resource: record?.resource,
      };
      // add the item_metadata to the mutationData?.data array items
      const enhancedMutationData = {
        ...mutationData,
        data: mutationData?.data.map((item: any) => {
          return {
            ...item,
            item_metadata,
          };
        }),
      };
      setActiveQueryResults(enhancedMutationData);
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

  // // console.log("fields_configuration", record?.fields_configuration || []);
  // console.log("activeQueryResults", activeQueryResults);

  // const handleActionChange = (value: string[]) => {
  //   const item = action_options.find((item) => item.value === value[0]);
  //   setActiveActionOption(item);
  //   setActionType("setActiveActionOption");
  //   if (record) {
  //     setActiveRecord(record);
  //   }
  //   activateSection("rightSection");
  //   setFieldValue("action", value);
  // };
  // // handle toggleDisplay
  // const activateSection = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };

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
              resource="general"
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
        <ScrollArea>
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
            resource={activeItem_2?.item_metadata?.resource}
            display_components={["header", "details", "files"]}
            default_display_component="files"
          />
          <TableView
            resource={activeItem_2?.item_metadata?.resource}
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
        </ScrollArea>
      </Show>
    </>
  );
};
export default PageShow;
