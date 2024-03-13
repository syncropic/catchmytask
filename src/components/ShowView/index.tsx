import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useGetIdentity,
  useDelete,
  useCustom,
} from "@refinedev/core";
import {
  Show,
  TextField,
  DateField,
  CloneButton,
  EditButton,
} from "@refinedev/mantine";
import {
  Accordion,
  Anchor,
  Flex,
  MantineProvider,
  Title,
  rem,
  Text,
} from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";

import TableView from "@components/tableview";

interface IActionStep {
  request_object: any;
  id: string;
  status: string;
  updated_at: string;
  created_at: string;
  results: any;
}

interface IActionOption {
  // [key: string]: any;
  request_object: any;
}

type IIdentity = {
  email: string;
};

export const PageShow = ({ show_item }) => {
  const { data, isLoading } = useCustom({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
    dataProviderName: "catchmytaskApiDataProvider",
    method: "post",
    config: {
      payload: show_item?.active_query,
    },
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

  return (
    <>
      <Show
        goBack={false}
        breadcrumb={null}
        isLoading={isLoading}
        title={<Title order={5}>{show_item?.resource}</Title>}
        headerButtons={({ defaultButtons }) => (
          <>
            {/* {defaultButtons} */}
            <EditButton resource="general" size="xs" />

            {/* <CloneButton
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
            </CloneButton> */}
          </>
        )}
      >
        {/* {display_components.includes("header") && (
          <>
            <Text>
              <b>id:</b> {record?.id}
            </Text>
            <Text>
              <b>name:</b>{" "}
              {record?.name || record?.display_name || record?.title}
            </Text>
          </>
        )} */}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <TableView
              resource={show_item?.resource}
              data_columns={show_item?.fields_configuration}
              data={
                show_item?.data_field
                  ? data?.data[0]?.[show_item.data_field]
                  : data?.data
              }
              isLoading={isLoading}
            ></TableView>
          </>
        )}
      </Show>
    </>
  );
};
export default PageShow;
