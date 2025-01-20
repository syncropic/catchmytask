import React from "react";
import LayoutToggle from "@components/Layout/LayoutToggle";
import UserMenu from "@components/Layout/UserMenu";
import { LogoName } from "@components/LogoName/LogoName";
import {
  getLabel,
  getTooltipLabel,
  useFetchDomainDataByDomain,
  useUpdateComponentAction,
} from "@components/Utils";
import { useGo } from "@refinedev/core";
import { useAppStore } from "src/store";
import SearchBar from "@components/SearchBar";
import QuickActionsBar from "@components/QuickActionsBar";
import ColorSchemeToggle from "@components/ColorSchemeToggle";
import AutomationsToggle from "@components/AutomationsToggle";

import { ActionIcon, Tooltip, Text } from "@mantine/core";
import {
  IconCode,
  IconHttpGet,
  IconIconsOff,
  IconLetterB,
  IconMail,
  IconMenu2,
  IconSettingsAutomation,
} from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import PinActionStepsToggle from "@components/PinActionStepsToggle";
import CustomTooltipComponent from "@components/CustomTooltipComponent";
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import SectionsToggle from "@components/SectionsToggle";
import { useSession } from "next-auth/react";
import { useDomainData } from "@components/Utils/useDomainData";
import SessionsWrapper from "@components/Sessions";

interface HeaderComponentProps {
  authenticatedData?: any;
  activeApplication?: any;
  applicationData?: any;
  go?: any;
}

const LargeScreenHeader = ({
  applicationData,
  authenticatedData,
  activeApplication,
  go,
}: HeaderComponentProps) => {
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
    global_developer_mode,
    toggleGlobalDeveloperMode,
  } = useAppStore();
  const { updateComponentAction } = useUpdateComponentAction();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { width } = useViewportSize();
  const { data: user_session } = useSession();

  const hasPermission = (permission: string): boolean => {
    return Boolean(
      user_session?.userProfile?.permissions?.includes(permission)
    );
  };

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    setShowRequestResponseView(false);
    clearViews({});
  };

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  const toggleSessionInteractionMode = (mode: string) => {
    if (sessionConfig) {
      const newSessionConfig = { ...sessionConfig };
      let currentInteractionMode = newSessionConfig["interaction_mode"];
      if (mode) {
        newSessionConfig["interaction_mode"] =
          currentInteractionMode === mode ? "interactive" : mode;
      }
      setSessionConfig(newSessionConfig);
    }
  };

  const toggleShowRequestResponseView = () => {
    setShowRequestResponseView(!showRequestResponseView);
  };

  const handleMenuNavigate = (item: any) => {
    // console.log("Edit", item);
    go({
      to: {
        resource: item?.entity_type,
        action: item?.action_type,
        id: item?.id,
        // meta: navigationHistory?.params,
      },
      // query: navigationHistory?.params,
      type: "push",
    });
    // setOpened(!opened);
    setMonitorComponents(["messages"]);
  };

  return (
    <div className="flex justify-between items-center h-full md:pr-72 md:pl-72">
      <div className="flex items-center">
        <LogoName
          logoLink="/"
          logoURL={applicationData.logo_image_url}
          companyName={
            applicationData.name || activeApplication?.name || "APP NAME"
          }
          iconName={applicationData.logo_icon_name}
          handleClickHome={() => {
            go({
              to: "/",
              type: "push",
            });
          }}
        />
        {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <LayoutToggle />
          </div>
        )}

        {/* {
          <div className="hidden lg:block">
            <ColorSchemeToggle />
          </div>
        } */}
        {/* {authenticatedData?.authenticated &&
          user_session?.userProfile?.quick_action_options?.includes(
            "toggle_immediate_request_response"
          ) && (
            <div className="hidden lg:block">
              <div className="flex items-center pl-4 pr-4">
                <div>
                  <Tooltip
                    label={`toggle immediate request response view`}
                    position="top"
                  >
                    <ActionIcon
                      size="sm"
                      variant={!showRequestResponseView ? "outline" : "filled"}
                      onClick={toggleShowRequestResponseView}
                    >
                      <IconHttpGet size={20} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
            </div>
          )} */}

        {/* {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <div className="flex items-center pl-4 pr-4">
              <div>
                <Tooltip label={`messages`} position="top">
                  <ActionIcon
                    size="sm"
                    // onClick={handleClearViews}
                    onClick={() =>
                      handleMenuNavigate({
                        entity_type: "sessions",
                        action_type: "show",
                        id: "sessions:h5v3p5tbn363as94m248",
                      })
                    }
                    variant="outline"
                  >
                    <IconMail size={20} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          </div>
        )} */}

        {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <div className="flex items-center pl-4 pr-4">
              <div>
                <Tooltip label={`clear all views`} position="top">
                  <ActionIcon
                    size="sm"
                    onClick={handleClearViews}
                    variant={
                      showRequestResponseView || Object.keys(views).length > 0
                        ? "filled"
                        : "outline"
                    }
                  >
                    <IconIconsOff size={20} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {authenticatedData?.authenticated &&
          hasPermission("has_developer_mode") && (
            <div className="hidden lg:block">
              <div className="flex items-center pl-4 pr-4">
                <div>
                  <Tooltip label={`toggle developer mode`} position="top">
                    <ActionIcon
                      size="sm"
                      onClick={toggleGlobalDeveloperMode}
                      variant={global_developer_mode ? "filled" : "outline"}
                    >
                      <IconCode size={20} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

        {/* {authenticatedData?.authenticated && (
          <div className="block lg:hidden">
            <Tooltip label="Toggle quick actions" position="top">
              <ActionIcon
                size="sm"
                variant={
                  activeLayout?.quickActionsBar?.isDisplayed
                    ? "filled"
                    : "outline"
                }
                onClick={() => {
                  toggleDisplay("quickActionsBar");
                }}
              >
                <IconMenu2 />
              </ActionIcon>
            </Tooltip>
          </div>
        )} */}

        {/* {authenticatedData?.authenticated && (
          <div className="hidden lg:block">
            <div>
              <Tooltip label="Toggle background mode" position="top">
                <ActionIcon
                  aria-label="Toggle background mode"
                  size="sm"
                  onClick={() => toggleSessionInteractionMode("background")}
                  variant={
                    sessionConfig.interaction_mode == "background"
                      ? "filled"
                      : "outline"
                  }
                >
                  <IconLetterB />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        )} */}
      </div>
      {/* {authenticatedData?.authenticated && (
        <div className="hidden lg:block w-full items-center pl-4">
          <SearchInput include_action_icons={[]} />
        </div>
      )} */}
      {/* {authenticatedData?.authenticated && activeTask && (
        <div className="pr-3">
          <ComponentsToolbar
            include_components={[
              {
                action: "save",
                entity_type: "action_steps",
                type: "action",
                record: activeTask,
                onClick: () => console.log("save"),
              },
              {
                action: "execute",
                entity_type: "action_steps",
                type: "action",
                record: activeTask,
                onClick: updateComponentAction,
              },
            ]}
          />
        </div>
      )} */}
      {/* {authenticatedData?.authenticated &&
        activeTask &&
        activeView &&
        action && (
          <ExternalSubmitButton
            record={activeView}
            entity_type="tasks"
            action={action}
          />
        )} */}

      {/* {authenticatedData?.authenticated && activeTask && <AutomationsToggle />} */}

      {/* {authenticatedData?.authenticated && (
        <div className="max-w-xl">
          <SearchInput
            placeholder="search"
            description={undefined}
            handleOptionSubmit={(item) => console.log(item)}
            // value={activeAgent?.id || ""}
            // include_action_icons={activeAgent?.id ? ["filter"] : []}
            // navigateOnSelect={{ resource: "views" }}
            // navigateOnClear={{ resource: "home" }}
            // activeFilters={[
            //   {
            //     id: 1,
            //     name: "tasks",
            //     description: "tasks",
            //     entity_type: "tasks",
            //     metadata: {
            //       is_agent: true,
            //     },
            //     is_selected: true,
            //   },
            // ]}
          />
        </div>
      )} */}

      {/* {authenticatedData?.authenticated && activeTask && activeView && (
        <SectionsToggle />
      )} */}

      {/* {authenticatedData?.authenticated && activeSession && (
        <div className="w-full overflow-hidden ">
          <Reveal
            trigger="click"
            target={
              <Tooltip
                multiline
                withArrow
                transitionProps={{ duration: 200 }}
                label={getTooltipLabel(activeSession)}
              >
                <div className="flex max-w-full overflow-hidden justify-center">
                  <Text size="sm" className="text-blue-500 truncate block px-3">
                    {getLabel(activeSession)}
                  </Text>
                </div>
              </Tooltip>
            }
          >
            <MonacoEditor value={activeSession} language="json" height="50vh" />
          </Reveal>
        </div>
      )} */}

      {authenticatedData?.authenticated && (
        <div className="w-[600px] ">
          <SessionsWrapper
            func_name="fetch_system_sessions"
            view_id="views:36xo8keq9tsoyly68shk"
            title="monitor"
            display_mode="search_input"
            success_message_code="fetch_system_sessions"
          />
        </div>
      )}

      {applicationData?.disabled_sections &&
      applicationData?.disabled_sections?.includes("user_menu") ? null : (
        <UserMenu />
      )}
    </div>
  );
};

export function Header({ authenticatedData }: HeaderComponentProps) {
  const go = useGo();
  // const runtimeConfig = useAppStore((state) => state.runtimeConfig);
  const {
    domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
    domainRecord,
  } = useDomainData();

  // let state = {
  //   domain_url: runtimeConfig?.DOMAIN_URL,
  // };
  const { activeApplication } = useAppStore();
  // const {
  //   data: domainData,
  //   isLoading: domainDataIsLoading,
  //   error: domainDataError,
  // } = useFetchDomainDataByDomain(state);

  const applicationData =
    domainData?.data?.find(
      (item: any) => item?.message?.code === "fetch_system_domain_data"
    )?.data[0]?.application || {};

  return (
    <>
      <LargeScreenHeader
        applicationData={applicationData}
        authenticatedData={authenticatedData}
        activeApplication={activeApplication}
        go={go}
      />
    </>
  );
}

export default Header;
