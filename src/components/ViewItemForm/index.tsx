import { ActionInputForm } from "@components/ActionInput";
import { useToggleView } from "@components/hooks/useToggleView";
import ExternalSubmitButton from "@components/SubmitButton";
import {
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useGo, useParsed } from "@refinedev/core";
import { IconMaximize, IconSquareX } from "@tabler/icons-react";
import { useAppStore } from "src/store";

interface ViewItemFormProps {
  action_form_key: string;
  view_item_id: string;
  view_item_record: any;
  query_state: any;
  view_record?: any;
  view_query_state: any;
  // success_message_code?: string;
  // display_mode?: string;
  // query_name?: string;
  // view_id?: string;
  // author_id?: string;
  // title?: string;
}

export const ViewItemForm = ({
  action_form_key,
  view_item_record,
  view_item_id,
  query_state,
  view_record,
  view_query_state,
}: ViewItemFormProps) => {
  const { params } = useParsed();
  const {
    activeProfile,
    views,
    setViews,
    activeLayout,
    setActiveLayout,
    isFullWindowDisplay,
    setIsFullWindowDisplay,
  } = useAppStore();

  const go = useGo();
  let view_ids = Object.keys(views);
  const { toggleView } = useToggleView();

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

  return (
    <>
      <ExternalSubmitButton
        record={{}}
        reference_record={{
          ...view_item_record,
          id: view_item_id,
          queryKey: `useRunTask_${JSON.stringify(query_state)}`,
          view_query_state: view_query_state,
          viewQueryKey: `useExecuteFunctionWithArgs_${JSON.stringify(
            view_query_state
          )}`,
        }}
        view_item={view_item_record}
        entity_type="view"
        view_record={view_record}
        action_form_key={`form_${params?.id}_${view_item_id}`}
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
      <ActionInputForm action_form_key={action_form_key} fields={[]} />
    </>
  );
};

export default ViewItemForm;
