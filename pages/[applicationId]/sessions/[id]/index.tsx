import ListView from "@components/ListView";
import SelectAction from "@components/SelectAction";
import {
  IApplication,
  IDataset,
  IListItem,
  IView,
} from "@components/interfaces";
import { Accordion, Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import React, { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { params } = useParsed();

  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    isError: isErrorApplication,
  } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: `${params?.applicationId}`,
  });

  const sessionDataset = useOne<IDataset, HttpError>({
    resource: "datasets",
    id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
  });

  // console.log("sessionDataset", sessionDataset);
  const defaultDatasetListItem = sessionDataset.data?.data.list.find(
    (item) => item.name == "default"
  );
  // console.log("defaultSessionListItem", defaultSessionListItem);

  const actionsList = defaultDatasetListItem?.actions;
  // console.log("actionsList", actionsList);

  const { queryResult } = useShow();
  const { setActiveSession, activeSession, setActiveApplication } =
    useAppStore();

  const { data, isLoading } = queryResult;

  const session = data?.data;
  // when session changes, set activeSession
  useEffect(() => {
    if (session) {
      setActiveSession(session);
    }
  }, [session]);

  // when session changes, set activeSession
  useEffect(() => {
    if (applicationData?.data) {
      setActiveApplication(applicationData?.data);
    }
  }, [applicationData?.data]);
  // console.log("activeSession", activeSession);

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={({ defaultButtons }) => (
          <>
            <SelectAction
              actions_list={actionsList || []}
              record={activeSession}
              view_item={null}
            />
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
          {session?.list?.map((item: IView) => (
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
