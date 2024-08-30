import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList } from "@refinedev/core";
import { ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import {
  IconCopy,
  IconEdit,
  IconGripHorizontal,
  IconLetterS,
  IconPlus,
  IconRun,
  IconSearch,
} from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { IconLetterB } from "@tabler/icons-react";

interface SessionBarProps {
  name: string;
  heading: string;
  subheading: string;
  description: string;
}

const SessionBar: React.FC<SessionBarProps> = ({
  name,
  heading,
  subheading,
  description,
}) => {
  const {
    activeSession,
    activeApplication,
    setActiveAction,
    sessionConfig,
    setSessionConfig,
    activeLayout,
    setActiveLayout,
  } = useAppStore();

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      console.log("newLayout", newLayout);
      newLayout[section].isDisplayed = !newLayout[section]?.isDisplayed;
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

  const {
    data,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<ISession, HttpError>({
    resource: "sessions",
    filters: [
      {
        field: "session_status",
        operator: "eq",
        value: "published",
      },
      {
        field: "application",
        operator: "eq",
        value: activeApplication?.id,
      },
    ],
  });

  const session_data_items = data?.data ?? [];

  return (
    <div className="flex w-full items-center pl-4 pr-4 space-x-4">
      <div className="flex items-center space-x-2">
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

        {/* <Tooltip label="Toggle search mode" position="top">
          <ActionIcon
            aria-label="Toggle search mode"
            size="sm"
            onClick={() => toggleSessionInteractionMode("search")}
            variant={
              sessionConfig.interaction_mode == "search" ? "filled" : "outline"
            }
          >
            <IconSearch />
          </ActionIcon>
        </Tooltip> */}
        <Tooltip label="Toggle search" position="top">
          <ActionIcon
            aria-label="any"
            size="sm"
            onClick={() => toggleDisplay("searchInput")}
            variant={
              activeLayout?.searchInput?.isDisplayed ? "filled" : "outline"
            }
          >
            <IconLetterS />
          </ActionIcon>
        </Tooltip>
      </div>
      {activeLayout?.searchInput?.isDisplayed && (
        <div className="hidden lg:block w-full">
          <SearchInput />
        </div>
      )}
    </div>
  );
};

export default SessionBar;
