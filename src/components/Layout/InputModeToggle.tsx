import { IIdentity } from "@components/interfaces";
import SessionBar from "@components/SessionBar";
import { useIsMobile, useUpdateComponentAction } from "@components/Utils";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useParsed,
} from "@refinedev/core";
import {
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutDistributeVertical,
  IconMenu2,
  IconCode,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useAppStore } from "src/store";

// create simple function component called HeaderSectionToggleAndSearch
type InputModeToggleAndSearchProps = {
  //   toggleDisplay: (position: string) => void;
  // activeLayout?: any;
  authenticatedData: any;
};

export const InputModeToggle: React.FC<InputModeToggleAndSearchProps> = ({
  authenticatedData,
}) => {
  const {
    sessionConfig,
    setSessionConfig,
    activeLayout,
    setActiveLayout,
    activeTask,
    activeSession,
    activeView,
    focused_entities,
    activeProfile,
    clearViews,
    showRequestResponseView,
    setShowRequestResponseView,
    views,
    setMonitorComponents,
    toggleShowSessionWorkingMemory,
    showSessionWorkingMemory,
    global_session_trace_mode,
    toggleGlobalSessionTraceMode,
    global_input_mode,
    setGlobalInputMode,
    setDisplaySessionEmbedMonitor,
  } = useAppStore();
  const { updateComponentAction } = useUpdateComponentAction();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { width } = useViewportSize();
  const { data: user_session } = useSession();
  const authProvider = useActiveAuthProvider();
  const { params } = useParsed();

  const { data: identity } = useGetIdentity<IIdentity>();

  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const isMobile = useIsMobile();
  let global_input_mode_developer =
    global_input_mode === "developer" ? true : false;

  const hasPermission = (permission: string): boolean => {
    return Boolean(
      user_session?.userProfile?.permissions?.includes(permission)
    );
  };

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  const handleToggleGlobalInputMode = (mode: any) => {
    if (mode == "developer") {
      setGlobalInputMode(
        global_input_mode === "developer" ? "user" : "developer"
      );

      setShowRequestResponseView(
        global_input_mode === "developer" ? false : true
      );
      setDisplaySessionEmbedMonitor(
        global_input_mode === "developer" ? false : true
      );
    }

    if (mode == "terminal") {
      setGlobalInputMode(
        global_input_mode === "terminal" ? "user" : "terminal"
      );
    }
    // console.log("Edit", item);
    // go({
    //   to: {
    //     resource: item?.entity_type,
    //     action: item?.action_type,
    //     id: item?.id,
    //     // meta: navigationHistory?.params,
    //   },
    //   // query: navigationHistory?.params,
    //   type: "push",
    // });
    // // setOpened(!opened);
    // setMonitorComponents(["messages"]);
  };
  return (
    <div className="flex items-center gap-4">
      {authenticatedData?.authenticated &&
        params?.id &&
        activeSession?.author_id === identity?.email && (
          <div className="flex items-center">
            <div>
              <Tooltip label={`toggle developer mode`} position="top">
                <ActionIcon
                  size="sm"
                  onClick={() => handleToggleGlobalInputMode("developer")}
                  variant={
                    global_input_mode === "developer" ? "filled" : "outline"
                  }
                >
                  <IconCode size={20} />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        )}
      {authenticatedData?.authenticated &&
        params?.id &&
        activeSession?.author_id === identity?.email && (
          <div className="flex items-center">
            <div>
              <Tooltip label={`toggle developer mode`} position="top">
                <ActionIcon
                  size="sm"
                  onClick={() => handleToggleGlobalInputMode("developer")}
                  variant={
                    global_input_mode === "developer" ? "filled" : "outline"
                  }
                >
                  <IconCode size={20} />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        )}
    </div>
  );
};

export default InputModeToggle;
