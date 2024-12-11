import {
  Title,
  Text,
  useComputedColorScheme,
  Button,
  Accordion,
  Tooltip,
} from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "src/store";
import { useParsed, useNavigation } from "@refinedev/core";
import {
  getLabel,
  getTooltipLabel,
  useReadRecordByState,
} from "@components/Utils";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";
import View from "@components/View";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import MessagesWrapper from "@components/Messages";
import ActionInputWrapper from "@components/ActionInput";
import EventsWrapper from "@components/Events";
import ViewWrapper from "@components/View";
import AccordionComponent from "@components/AccordionComponent";
import { viewQueryAccordionConfig } from "@components/View/viewQueryAccordionConfig";
import { getDb } from "src/surreal";
import Surreal, { LiveHandler, Uuid } from "surrealdb";
import { viewSearchActionAccordionConfig } from "@components/Layout/viewSearchActionAccordionConfig";
import { viewFooterAccordionConfig } from "@components/View/viewFooterAccordionConfig";
import { IconCode, IconInfoCircle } from "@tabler/icons-react";
import MonacoEditor from "@components/MonacoEditor";
import WebAutomation from "@components/WebAutomation";
import { Tabs } from "@mantine/core";
import SearchInput from "@components/SearchInput";
import ExternalSubmitButton from "@components/SubmitButton";
import ActionsWrapper from "@components/Actions";
import Reveal from "@components/Reveal";
import CustomComponentsView from "@components/CustomComponentsView";
import ComponentsToolbar from "@components/ComponentsToolbar";
import Documentation from "@components/Documentation";
import { useViewportSize } from "@mantine/hooks";
import ResponseViewWrapper from "@components/View/ResponseView";
import SessionsWrapper from "@components/Sessions";
import MonitorWrapper from "@components/Monitor";

export const ShowPage: React.FC = () => {
  // const [templateSearch, setTemplateSearch] = useState("");
  const { colorScheme, activeTask, request_response, views } = useAppStore();

  const { params } = useParsed();
  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  // const effectiveScheme =
  //   colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const action_input_form_values = useAppStore(
  //   (state) => state.action_input_form_values[action_input_form_values_key]
  // );

  // const globalQuery = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[`${action_input_form_values_key}`]?.query
  // );

  // const {
  //   data: events,
  //   error,
  //   loading,
  // } = useLiveQuery<Event>(
  //   "events",
  //   `task_id = "${params?.id}" ORDER BY created_datetime ASC`
  // );

  // Render the page content
  return (
    <>
      {/* <MonacoEditor
        value={activeTask}
        language="json"
        height="25vh"
      ></MonacoEditor> */}
      {/* <div>{JSON.stringify(events)}</div> */}
      {/* {!activeView && (<Title order={3}>Get Important Things Done.</Title>)} */}
      {/* <Breadcrumbs /> */}
      {/* <Text>Task Show Page</Text>
      <Title order={2}>{activeTask?.name || "No Task Name"}</Title> */}
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={0}>
          <div className="h-[85vh] flex flex-col">
            {" "}
            {/* Using 85% of viewport height */}
            {/* Top component */}
            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              {/* <WebAutomation></WebAutomation> */}

              {/* {params?.id && events && (
                <EventsWrapper
                  task_id={params?.id}
                  title="events"
                  data_items={events || []}
                />
              )} */}
              {/* {params?.view_id && <ViewWrapper></ViewWrapper>} */}
              {/* {<ViewWrapper></ViewWrapper>} */}
              {/* <ViewsDisplay views={views} /> */}
              <ResponseViewWrapper />
              {/* <MonacoEditor
                value={request_response}
                height="75vh"
                language="json"
              ></MonacoEditor> */}
            </div>
            {/* Bottom component */}
            <div>
              {/* <div>
                <AccordionComponent
                  sections={viewSearchActionAccordionConfig}
                  activeView={{}}
                  activeTask={{}}
                  defaultExpandedValues={[]}
                  action={"filters"}
                />
              </div> */}
              {/* <ActionInputWrapper
                name={"query"}
                query_name="data_model"
                record={{
                  id: params?.id,
                }}
                action={"query"}
                action_form_key="query_general"
                success_message_code="action_input_data_model_schema"
              /> */}
              {/* <div>
                <AccordionComponent
                  sections={viewFooterAccordionConfig}
                  globalQuery={globalQuery}
                  include_items={[]}
                  key="view_footer"
                  title={
                    <div className="flex gap-4 items-center">
                      <IconCode size={16} />
                      <Text>Code</Text>
                    </div>
                  }
                />
              </div> */}
            </div>
          </div>
        </Panel>
        <PanelResizeHandle>
          <ResizeHandle />
        </PanelResizeHandle>

        <Panel defaultSize={20} minSize={0}>
          {/* <SessionsWrapper
            // name={action}
            query_name="fetch sessions"
            view_id="views:36xo8keq9tsoyly68shk"
            title="monitor"
            // record={record}
            // action={action}
            success_message_code="action_input_data_model_schema"
          /> */}
          <MonitorWrapper></MonitorWrapper>
        </Panel>

        {/* <Panel
          defaultSize={50}
          minSize={0}
          style={{
            display: true ? "block" : "none",
          }}
        >
          <div
            className={`${
              effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
            }`}
          >
            {params?.view_id && <ViewWrapper></ViewWrapper>}
          </div>
        </Panel> */}
      </PanelGroup>
    </>
  );
};

export default ShowPage;
