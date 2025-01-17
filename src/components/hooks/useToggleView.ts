import { useGo, useParsed } from "@refinedev/core";
import { useAppStore } from "src/store";

interface UseToggleViewParams {
  onViewsChange?: (viewIds: string[]) => void;
}

interface ToggleViewResult {
  toggleView: (id: string, record: any) => void;
  viewIds: string[];
}

export const useToggleView = ({
  onViewsChange,
}: UseToggleViewParams = {}): ToggleViewResult => {
  const go = useGo();
  const { params } = useParsed();
  const { activeProfile, setViews, views, open_new_items_in_window } =
    useAppStore();

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

  const toggleView = (id: string, record: any) => {
    const existingView = views[id];
    const newViewIds = toggleItemInList(viewIds, id);

    if (existingView) {
      setViews(id, null);
    } else {
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

// Usage example:
// const { toggleView, viewIds } = useToggleView({
//   onViewsChange: (newViewIds) => {
//     console.log('Views changed:', newViewIds);
//   }
// });
