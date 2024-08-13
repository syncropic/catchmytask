import ListView from "@components/ListView";
import ResourceHeader from "@components/ResourceHeader";
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
import { formatDateTimeAsDateTime } from "src/utils";
// import SessionList from "pages/sessions";

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
  const {
    setActiveDataset,
    activeDataset,
    setActiveApplication,
    activeApplication,
  } = useAppStore();

  const { data, isLoading } = queryResult;

  const application = data?.data;
  // when session changes, set activeDataset
  useEffect(() => {
    if (application) {
      setActiveApplication(application);
    }
  }, [data?.data]);

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
            // actions_list={actionsList || []}
            // record={activeDataset}
            // view_item={null}
            />
          </>
        )}
      >
        {/* <>
          <Text>
            <b>id:</b> {application?.id}
          </Text>
          <Text>
            <b>name:</b>{" "}
            {application?.name ||
              application?.display_name ||
              application?.title}
          </Text>
        </> */}
        <ResourceHeader
          name={activeApplication?.name}
          heading={activeApplication?.heading}
          subheading={activeApplication?.subheading}
          description={activeApplication?.description}
        />
        <div className="flex p-3 gap-3">
          <Text>
            <b>Author:</b> {activeApplication?.author}
          </Text>
          <Text>
            <b>Updated:</b>{" "}
            {formatDateTimeAsDateTime(activeApplication?.updated_datetime)}
          </Text>
        </div>
        {/* <div>application stats and useful links i.e installs, author etc</div> */}
        {/* <div>application sessions</div> */}
        {/* display application session by default if show is not specified on application record otherwise display that */}
        {activeApplication?.show ? "show" : <ListSessions />}
        {/* <Accordion defaultValue="1">
          {activeApplication?.show?.map((item: IView) => (
            <Accordion.Item key={item?.order} value={item?.order?.toString()}>
              <Accordion.Control>{`${item?.resource}`}</Accordion.Control>
              <Accordion.Panel>
                <ListView item={item} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion> */}
      </Show>
    </>
  );
};
export default PageShow;

// a simple react component that displays hello world
// import React from "react";
//
const ListSessions = () => {
  // return <SessionList />;
  return <div>SessionList</div>;
};
