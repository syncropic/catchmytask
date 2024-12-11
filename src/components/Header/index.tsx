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
  IconIconsOff,
  IconLetterB,
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
  } = useAppStore();
  const { updateComponentAction } = useUpdateComponentAction();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { width } = useViewportSize();

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
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

        {<ColorSchemeToggle />}
        {authenticatedData?.authenticated && (
          <Tooltip
            withArrow
            transitionProps={{ duration: 200 }}
            label="clear views"
          >
            <ActionIcon
              size="xs"
              variant="default"
              aria-label="clear view"
              onClick={handleClearViews}
            >
              <IconIconsOff size={24} />
            </ActionIcon>
          </Tooltip>
        )}

        {authenticatedData?.authenticated && (
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
                {/* right */}
                <IconMenu2 />
              </ActionIcon>
            </Tooltip>
          </div>
        )}

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
      {authenticatedData?.authenticated &&
        activeTask &&
        activeView &&
        action && (
          <ExternalSubmitButton
            record={activeView}
            entity_type="tasks"
            action={action}
          />
        )}

      {/* {authenticatedData?.authenticated && activeTask && <AutomationsToggle />} */}

      {authenticatedData?.authenticated && activeSession && (
        <Reveal
          trigger="click"
          target={
            <Tooltip
              multiline
              w={220}
              withArrow
              transitionProps={{ duration: 200 }}
              label={getTooltipLabel(activeSession)}
            >
              <Text
                size="sm"
                className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                style={{ maxWidth: width < 500 ? 100 : 500 }}
              >
                {getLabel(activeSession)}
              </Text>
            </Tooltip>
          }
        >
          <MonacoEditor value={activeSession} language="json" height="50vh" />
        </Reveal>
      )}
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

      {<UserMenu />}
    </div>
  );
};

export function Header({ authenticatedData }: HeaderComponentProps) {
  const go = useGo();
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);

  let state = {
    domain_url: runtimeConfig?.DOMAIN_URL,
  };
  const { activeApplication } = useAppStore();
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(state);

  const applicationData =
    domainData?.data?.find(
      (item: any) => item?.message?.code === "query_success_results"
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
