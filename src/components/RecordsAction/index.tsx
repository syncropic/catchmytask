import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  extractIdentifier,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchDataModelByState,
  useFetchQueryDataByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
// import { ActionControlFormWrapper } from "@components/ActionControlForm";
import type { FieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { Children, useEffect, useRef, useState } from "react";
import { inputs } from "@data/index";
import { Combobox } from "@components/Combobox";
import { ComponentKey, IIdentity } from "@components/interfaces";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import config from "src/config";
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
// import { useIsMutating } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import {
  IconCursorText,
  IconEye,
  IconLock,
  IconPlayerPlay,
} from "@tabler/icons-react";
import ActionInputForm, { ActionInputWrapper } from "@components/ActionInput";

interface RowActionsWrapperProps {
  query_name?: string;
  name?: string;
  action_type?: string;
  entity?: string;
  record?: any;
  exclude_components?: string[];
  children?: any;
  nested_component?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  records?: any[];
  include_action_icons?: string[];
  include_form_components?: string[];
}

export const RecordsActionWrapper: React.FC<RowActionsWrapperProps> = ({
  query_name,
  name,
  action_type,
  entity,
  record,
  exclude_components = [],
  children,
  nested_component,
  success_message_code,
  setExpandedRecordIds,
  invalidate_queries_on_submit_success,
  records,
  include_action_icons,
  include_form_components,
}) => {
  // let state = {
  //   query_name: query_name,
  //   name: name,
  //   action_type: action_type,
  //   entity: entity,
  // };
  // const {
  //   data: queryData,
  //   isLoading: queryDataIsLoading,
  //   error: queryDataError,
  // } = useFetchQueryDataByState(state);

  // // // console.log("actionFormFieldValues", actionFormFieldValues);
  // if (queryDataError) return <div>Error: {JSON.stringify(queryDataError)}</div>;
  // if (queryDataIsLoading) return <div>Loading...</div>;
  // const handleClick = (event: React.MouseEvent) => {
  //   event.stopPropagation(); // Prevents the click event from bubbling up to the row
  //   // Handle the button click logic here
  // };

  return (
    <>
      {/* <div>ActionInputWrapper</div> */}
      {/* <>{JSON.stringify(queryData)}</> */}
      <div>
        {/* <div>action input</div>
      {JSON.stringify(
        actionData?.data?.find(
          (item: any) => item?.message?.code === "query_success_results"
        )?.data
      )} */}
        <ActionInputWrapper
          record={record}
          records={records}
          exclude_components={exclude_components}
          name={name}
          children={children}
          query_name={query_name}
          entity={entity}
          action_type={action_type}
          nested_component={nested_component}
          success_message_code={success_message_code}
          // action_icon={
          //   <Group gap={4} justify="right" wrap="nowrap">
          //     <Tooltip label="execute" position="left">
          //       <ActionIcon size="sm" variant="subtle" color="green">
          //         <IconPlayerPlay size={16} />
          //       </ActionIcon>
          //     </Tooltip>{" "}
          //   </Group>
          // }
          setExpandedRecordIds={setExpandedRecordIds}
          invalidate_queries_on_submit_success={
            invalidate_queries_on_submit_success
          }
          include_form_components={include_form_components}
        ></ActionInputWrapper>
      </div>
    </>
  );
};

export default RecordsActionWrapper;
