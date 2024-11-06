import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  getLabel,
  getTooltipLabel,
  sanitizeFilters,
  useFetchExecutionData,
  useFetchQueryDataByState,
  useReadByState,
  useReadRecordByState,
} from "@components/Utils";
import { useParsed } from "@refinedev/core";
import { useDuckDB } from "pages/_app";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { viewQueryAccordionConfig } from "./viewQueryAccordionConfig";
import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
import { ActionInputForm } from "@components/ActionInput";
import { titleAccordionConfig } from "./titleAccordionConfig";
import { Tooltip, Text } from "@mantine/core";
import Reveal from "@components/Reveal";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { IconInfoCircle } from "@tabler/icons-react";
import { viewItemsAccordionConfig } from "./viewItemsAccordionConfig";

const ViewWrapper = () => {
  const { params } = useParsed();
  const { width } = useViewportSize();

  const {
    activeTask,
    activeView,
    activeSession,
    activeProfile,
    activeApplication,
    action_input_form_fields,
    activeEvent,
  } = useAppStore();

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  const fields = action_input_form_fields[action_input_form_values_key];

  const view_id = params?.view_id;
  const task_id = params?.task_id;
  const session_id = params?.session_id;

  let fetch_view_by_id_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: view_id,
    record: {
      id: view_id,
    },
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(fetch_view_by_id_state);

  let view_record = viewData?.data?.find(
    (item: any) => item?.message?.code === view_id
  )?.data[0];

  // const globalQuery =
  //   useAppStore(
  //     (state) =>
  //       state.action_input_form_values[`${action_input_form_values_key}`]?.query
  //   ) || view_record?.query; // use query as default if nothing is in the global store

  // let activity_state = {
  //   id:
  //     activeView?.id ||
  //     activeTask?.id ||
  //     activeSession?.id ||
  //     activeProfile?.id,
  //   query_name: "fetch events",
  //   session_id: activeSession?.id,
  //   view_id: activeView?.id,
  //   profile_id: activeProfile?.id,
  //   application_id: activeApplication?.id,
  //   task_id: params?.id,
  //   success_message_code: "events",
  // };

  // const {
  //   data: activityData,
  //   isLoading: activityIsLoading,
  //   error: activityError,
  // } = useFetchQueryDataByState(activity_state);

  if (viewIsLoading) return <div>Loading...</div>;

  if (viewError) {
    return (
      <ErrorComponent
        error={viewError}
        component={"Error loading params data"}
      />
    );
  }

  return (
    <AccordionComponent
      sections={viewItemsAccordionConfig}
      include_items={["toolbar"]}
      defaultExpandedValues={["main"]}
      key="view_title"
      view_record={view_record}
      title={
        <div onClick={(e) => e.stopPropagation()}>
          <Reveal
            trigger="click"
            target={
              <Tooltip
                multiline
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                label={getTooltipLabel(view_record)}
              >
                <div className="flex">
                  <Text
                    size="sm"
                    className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                    style={{ maxWidth: width < 500 ? 100 : 500 }}
                  >
                    {getLabel(view_record)}
                  </Text>
                  <IconInfoCircle size={18} />
                </div>
              </Tooltip>
            }
          >
            <Documentation record={view_record}></Documentation>
          </Reveal>
        </div>
      }
    />
  );
};
export default ViewWrapper;
