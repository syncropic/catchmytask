import ListView from "@components/ListView";
import { IListItem } from "@components/interfaces";
import { Accordion, Text } from "@mantine/core";
import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { CloneButton, EditButton, Show } from "@refinedev/mantine";
import React, { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { queryResult } = useShow();
  const { setActiveSession } = useAppStore();
  const { data, isLoading } = queryResult;

  const session = data?.data;
  // when session changes, set activeSession
  useEffect(() => {
    if (session) {
      setActiveSession(session);
    }
  }, [session]);

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
              recordItemId={session?.id}
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
        <>
          <Text>
            <b>id:</b> {session?.id}
          </Text>
          <Text>
            <b>name:</b>{" "}
            {session?.name || session?.display_name || session?.title}
          </Text>
        </>
        <Accordion defaultValue="1">
          {session?.list?.map((item: IListItem) => (
            <Accordion.Item key={item?.order} value={item?.order?.toString()}>
              <Accordion.Control>{`${item?.resource}`}</Accordion.Control>
              <Accordion.Panel>
                <ListView item={item} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Show>
    </>
  );
};
export default PageShow;
