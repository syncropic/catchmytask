import ListView from "@components/ListView";
import { IApplication, IIdentity, IListItem } from "@components/interfaces";
import SelectTaskComponent from "@components/selecttask";
import { Accordion, Button, Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useGetIdentity,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { CloneButton, EditButton, Show } from "@refinedev/mantine";
import { IconCopy } from "@tabler/icons-react";
import React, { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  // get applicationId from the URL
  const { data: identity } = useGetIdentity<IIdentity>();

  const { params } = useParsed();
  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    isError: isErrorApplication,
    error: errorApplication,
  } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: params?.applicationId,
  });

  // console.log("applicationData", applicationData);

  const { queryResult } = useShow();
  const {
    setActiveSession,
    setActiveRecord,
    setActiveActionId,
    setActionType,
  } = useAppStore();
  const { data, isLoading } = queryResult;

  const session = data?.data;
  // when session changes, set activeSession
  useEffect(() => {
    if (session) {
      setActiveSession(session);
    }
  }, [session]);

  const handleClone = () => {
    setActiveRecord(session);
    setActiveActionId({
      id: "action_options:b7mh2av3p49zcir80ctz",
      name: "clone",
    });
  };

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={({ defaultButtons }) => (
          <>
            {/* {defaultButtons} */}
            {/* <EditButton resource="sessions" size="xs" /> */}
            {/* <Button
              size="xs"
              variant="outline"
              leftIcon={<IconCopy></IconCopy>}
              onClick={handleClone}
            >
              Clone
            </Button> */}
            {/* <SelectTaskComponent
              action_options={[]}
              identity={identity}
              action_step={null}
              record={null}
              data_items={[]}
              data_table={{}}
              setActionType={setActionType}
              view_item={{}}
            /> */}
            {/* <CloneButton
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
            </CloneButton> */}
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
