import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  extractKeys,
  getLabel,
  getTooltipLabel,
  useRunTask,
} from "@components/Utils";
import { useGetIdentity, useGo, useParsed } from "@refinedev/core";
import { useAppStore, useTransientStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import DataGridView from "@components/DataGridView";
import {
  Accordion,
  Tooltip,
  Text,
  LoadingOverlay,
  Box,
  Loader,
  ActionIcon,
} from "@mantine/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle, IconMaximize, IconSquareX } from "@tabler/icons-react";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { jsonify } from "surrealdb";
import ViewDocumentation from "@components/ViewDocumentation";

interface ResponseViewWrapperProps {}

const ResponseViewWrapper = ({}: ResponseViewWrapperProps) => {
  const { views } = useAppStore();
  const { params } = useParsed();
  const { width } = useViewportSize();
  const { showRequestResponseView } = useAppStore();
  const queryClient = useQueryClient();
  // const viewData = queryClient.getQueryData([view_query_key]);
  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  let view_items = params?.view_items?.split(",");

  return (
    <div className="flex flex-col">
      {!showRequestResponseView && !view_items && (
        <div className="flex justify-center items-center h-[65vh]">Views</div>
      )}
      {showRequestResponseView && (
        <Accordion multiple defaultValue={["showRequestResponseView"]}>
          <Accordion.Item
            value={"showRequestResponseView"}
            key={"showRequestResponseView"}
          >
            <Accordion.Control>request response view</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  responseData: responseData,
                }}
                height="75vh"
                language="json"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {/* <div>{JSON.stringify(view_items)}</div> */}

      {view_items &&
        view_items?.map((view_item: any) => {
          return (
            <ViewItemWrapper
              key={view_item}
              view_item_id={view_item}
            ></ViewItemWrapper>
          );
        })}
    </div>
  );
};
export default ResponseViewWrapper;

const ViewItemWrapper = ({ view_item_id }: { view_item_id: string }) => {
  const { width } = useViewportSize();
  const { views } = useAppStore();
  let view_item_record = views[view_item_id];
  let run_task_state = {
    task: {
      id: view_item_record?.task_id,
      name: view_item_record?.task_id,
    },
  };
  const {
    data: runTaskData,
    isLoading: runTaskDataIsLoading,
    error: runTaskDataError,
  } = useRunTask(run_task_state);

  if (runTaskDataError) {
    return (
      <>
        <MonacoEditor
          value={{
            error: runTaskDataError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  let actionItem = runTaskData?.data?.find
    ? runTaskData?.data?.find(
        (item: any) => item?.action_step?.id === view_item_id
      )
    : {};

  let dataItems = actionItem?.data;
  // either read view from the response or retrieve view from external

  let view_record = actionItem?.view;
  let include_components = ["toolbar"];

  return (
    <div>
      {/* <MonacoEditor
        value={{
          error: runTaskDataError,
          runTaskData: runTaskData,
          runTaskDataIsLoading: runTaskDataIsLoading,
        }}
        language="json"
        height="25vh"
      ></MonacoEditor> */}
      {runTaskDataIsLoading && (
        <Accordion multiple>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>
              <div className="flex items-center gap-3">
                <Loader size={18} />
                <div>|</div>
                <div className="text-sm font-semibold px-3 break-words max-w-xs sm:max-w-md">
                  {view_item_record?.name}
                </div>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="flex justify-center items-center">
                loading content ...
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {!runTaskDataIsLoading && !dataItems && !view_record && (
        <Accordion multiple defaultValue={[view_item_id]}>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>{view_item_record?.name}</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  error: runTaskDataError,
                  runTaskData: runTaskData,
                  runTaskDataIsLoading: runTaskDataIsLoading,
                }}
                language="json"
                height="25vh"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {dataItems && view_record && (
        <ViewItem
          dataItems={dataItems}
          view_record={view_record}
          include_components={include_components}
          view_item_id={view_item_id}
          view_item_record={view_item_record}
          query_state={run_task_state}
        />
      )}
    </div>
  );
};

const ViewItem = ({
  dataItems,
  view_record,
  view_item_id,
  view_item_record,
  include_components,
  query_state,
}: {
  dataItems: any;
  view_record: any;
  view_item_id: string;
  view_item_record: any;
  include_components: any;
  query_state: any;
}) => {
  const { width } = useViewportSize();
  const { params } = useParsed();
  const {
    activeLayout,
    setActiveLayout,
    isFullWindowDisplay,
    setIsFullWindowDisplay,
    views,
    setViews,
    activeProfile,
  } = useAppStore();

  let view_documentation_record = {
    action: {
      id: view_item_record?.id,
      name: view_item_record?.name,
      function: view_item_record?.func_name,
    },
    session: {
      id: view_item_record?.session_id,
    },
    credential: {
      id: view_item_record?.credential_id,
    },
    task: {
      id: view_item_record?.task_id,
      variables: view_item_record?.variables,
    },
    author: {
      id: view_item_record?.author_id,
    },
    timestamp: {
      created_datetime: view_item_record?.created_datetime,
      updated_datetime: view_item_record?.updated_datetime,
    },
    view: {
      id: view_item_record?.view_id,
      fields: view_record?.fields || [],
    },
    status: {
      action_status: view_item_record?.action_status,
    },
  };

  let subheading_object = view_item_record?.variables
    ? extractKeys(
        view_item_record?.variables,
        [
          "application_id",
          "profile_id",
          "session_id",
          "task_id",
          "execution_mode",
          "breakpoint",
        ],
        "exclude"
      )
    : {};

  // Format the JSON string on a single line
  const formatObject = (obj: any) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("  •  "); // Using bullet point as separator for better readability
  };

  const subheading = formatObject(subheading_object);

  const toggleFullWindowDisplay = () => {
    setIsFullWindowDisplay(!isFullWindowDisplay);
  };

  const toggleItemFullWindowDisplay = () => {
    toggleFullWindowDisplay();
    if (!isFullWindowDisplay) {
      if (activeLayout) {
        const newLayout = { ...activeLayout };
        newLayout.leftSection.isDisplayed = false;
        newLayout.rightSection.isDisplayed = false;
        setActiveLayout(newLayout);
      }
    } else {
      if (activeLayout) {
        const newLayout = { ...activeLayout };
        newLayout.leftSection.isDisplayed = true;
        newLayout.rightSection.isDisplayed = true;
        setActiveLayout(newLayout);
      }
    }
  };
  const go = useGo();
  let view_ids = Object.keys(views);

  const toggleView = (id: string, record: any) => {
    // Access the current views from your zustand store
    const currentViews = views;

    // Check if the item exists in views
    const existingView = currentViews[id];

    const toggleItemInList = (list: any, itemId: any) => {
      // Check if item exists in list
      const exists = list.includes(itemId);

      if (exists) {
        // If exists, filter it out
        return list.filter((id: string) => id !== itemId);
      } else {
        // If doesn't exist, add it to the list (spreading the existing list)
        return [...list, itemId];
      }
    };

    if (existingView) {
      // Remove the view if it exists
      // const { [id]: removedView, ...remainingViews } = currentViews;
      setViews(id, null);
      let new_view_ids = toggleItemInList(view_ids, id);
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    } else {
      // Add the view if it doesn't exist
      setViews(id, record);
      let new_view_ids = [...view_ids, id];
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    }
  };

  return (
    <Accordion multiple defaultValue={[view_item_id]}>
      <Accordion.Item value={view_item_id} key={view_item_id}>
        <Accordion.Control>
          <div className="flex justify-between items-center">
            <div onClick={(e) => e.stopPropagation()}>
              <Reveal
                trigger="click"
                target={
                  <Tooltip
                    multiline
                    w={220}
                    withArrow
                    transitionProps={{ duration: 200 }}
                    // label={getTooltipLabel(view_item_record || {})}
                    label={"click for details"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        {/* Main Label - Made larger and bolder */}
                        <div className="text-sm font-semibold text-blue-600 px-3 break-words max-w-xs sm:max-w-md">
                          {getLabel(view_item_record || {})}
                        </div>

                        {/* Subheading - Smaller, lighter color and weight */}
                        <div
                          className="text-xs font-normal text-blue-400 truncate overflow-hidden whitespace-nowrap px-3"
                          // className="text-sm font-normal text-blue-400 truncate"
                          style={{ maxWidth: width < 500 ? 300 : 500 }}
                        >
                          {subheading}
                        </div>
                      </div>
                      <IconInfoCircle
                        // className="text-blue-500 flex-shrink-0"
                        size={12}
                      />
                    </div>
                  </Tooltip>
                }
              >
                {/* <Documentation record={view_record}></Documentation> */}
                <ViewDocumentation
                  record={view_documentation_record}
                ></ViewDocumentation>
              </Reveal>
            </div>
            {include_components?.includes("toolbar") && (
              <div className="hidden lg:block">
                <div
                  className="flex p-3 gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalSubmitButton
                    record={{}}
                    reference_record={{
                      id: view_item_id,
                      name: view_item_record?.name,
                      queryKey: `useRunTask_${JSON.stringify(query_state)}`,
                    }}
                    view_item={view_record}
                    entity_type="view"
                    action_form_key={`query_${params?.id}`}
                    action={"save"}
                  />
                  <Tooltip label="expand/minimize" key="expand/minimize">
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="expand/minimize"
                      onClick={toggleItemFullWindowDisplay}
                    >
                      <IconMaximize />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="close" key="close">
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="close"
                      onClick={() =>
                        toggleView(
                          String(view_item_record?.id),
                          view_item_record
                        )
                      }
                    >
                      <IconSquareX />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
          {include_components?.includes("toolbar") && (
            <div className="block lg:hidden">
              <div
                className="flex p-3 gap-3 items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalSubmitButton
                  record={{}}
                  reference_record={{
                    id: view_item_id,
                    name: view_item_record?.name,
                    queryKey: `useRunTask_${JSON.stringify(query_state)}`,
                  }}
                  view_item={view_record}
                  entity_type="view"
                  action_form_key={`query_${params?.id}`}
                  action={"save"}
                />
                <Tooltip label="expand/minimize" key="expand/minimize">
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="expand/minimize"
                    onClick={toggleItemFullWindowDisplay}
                  >
                    <IconMaximize />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="close" key="close">
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="close"
                    onClick={() =>
                      toggleView(String(view_item_record?.id), view_item_record)
                    }
                  >
                    <IconSquareX />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          )}
        </Accordion.Control>
        <Accordion.Panel>
          <DataGridView
            data_fields={view_record?.fields || []}
            data_items={dataItems || []}
            view_record={view_record}
          ></DataGridView>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
