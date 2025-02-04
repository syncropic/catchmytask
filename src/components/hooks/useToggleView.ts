import { useGo, useParsed } from "@refinedev/core";
import { useAppStore } from "src/store";

interface UseToggleViewParams {
  onViewsChange?: (viewIds: string[]) => void;
}

interface ToggleViewResult {
  toggleView: (
    id: string,
    record: any,
    action_context?: string,
    current_view_items?: string
  ) => void;
  viewIds: string[];
}

export const useToggleView = ({
  onViewsChange,
}: UseToggleViewParams = {}): ToggleViewResult => {
  const go = useGo();
  const { params } = useParsed();
  const {
    activeProfile,
    setViews,
    views,
    open_new_items_in_window,
    setDeSelectedRecords,
  } = useAppStore();

  const viewIds = Object.keys(views);

  const toggleItemInList = (list: string[], itemId: string): string[] => {
    const exists = list.includes(itemId);
    if (open_new_items_in_window == "current") {
      return exists ? list.filter((id: string) => id !== itemId) : [itemId];
    } else {
      return exists
        ? list.filter((id: string) => id !== itemId)
        : [...list, itemId];
    }
  };

  const toggleView = (
    id: string,
    record: any,
    action_context?: string,
    current_view_items?: string
  ) => {
    const existingView = views[id];
    const newViewIds = toggleItemInList(viewIds, id);

    let view_items = current_view_items?.split(",");

    if (action_context === "request_response") {
      // for when toggling after request
      setDeSelectedRecords(view_items || []);
      setViews(id, record);
    } else if (existingView) {
      // for when toggling in ui
      setDeSelectedRecords([id]);
      setViews(id, null);
    } else if (!existingView) {
      setViews(id, record);
    }

    // Construct query parameters
    const queryParams: {
      profile_id: string;
      view_items?: string;
    } = {
      profile_id: String(
        record?.profile_id || params?.profile_id || activeProfile?.id
      ),
    };

    if (newViewIds?.length > 0) {
      queryParams.view_items = String(newViewIds);
    }

    // Navigate with updated query parameters
    go({
      query: queryParams,
      type: "push",
    });

    // Call the optional callback if provided
    onViewsChange?.(newViewIds);
  };

  return {
    toggleView,
    viewIds,
  };
};
