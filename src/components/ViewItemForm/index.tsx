import { ActionInputForm } from "@components/ActionInput";
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
    <>
      <ExternalSubmitButton
        record={{}}
        reference_record={{
          ...view_item_record,
          id: view_item_id,
          queryKey: `useRunTask_${JSON.stringify(query_state)}`,
        }}
        view_item={view_item_record}
        entity_type="view"
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
