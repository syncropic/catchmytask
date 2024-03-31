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

  // const {
  //   data: applicationData,
  //   isLoading: isLoadingApplication,
  //   isError: isErrorApplication,
  // } = useOne<IApplication, HttpError>({
  //   resource: "applications",
  //   id: `${params?.applicationId}`,
  // });

  const datasetDataset = useOne<IDataset, HttpError>({
    resource: "datasets",
    id: "datasets:⟨61b76957-cd14-47fa-ae47-1e1d06c3f1cf⟩",
  });

  // console.log("sessionDataset", sessionDataset);
  const defaultDatasetListItem = datasetDataset.data?.data.list.find(
    (item) => item.name == "default"
  );
  // console.log("defaultSessionListItem", defaultSessionListItem);

  const actionsList = defaultDatasetListItem?.actions;

  const { queryResult } = useShow();
  const { setActiveDataset, activeDataset, setActiveApplication } =
    useAppStore();

  const { data, isLoading } = queryResult;

  const dataset = data?.data;
  // when session changes, set activeDataset
  useEffect(() => {
    if (dataset) {
      setActiveDataset(dataset);
    }
  }, [dataset]);

  // when session changes, set activeDataset
  // useEffect(() => {
  //   if (applicationData?.data) {
  //     setActiveApplication(applicationData?.data);
  //   }
  // }, [applicationData?.data]);

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={({ defaultButtons }) => (
          <>
            <SelectAction
              actions_list={actionsList}
              record={activeDataset}
              view_item={null}
            />
          </>
        )}
      >
        <>
          <Text>
            <b>id:</b> {dataset?.id}
          </Text>
          <Text>
            <b>name:</b>{" "}
            {dataset?.name || dataset?.display_name || dataset?.title}
          </Text>
        </>
        <Accordion defaultValue="1">
          {dataset?.list?.map((item: IView) => (
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
