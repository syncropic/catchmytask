import React from "react";
import { ActionIcon, Button, Checkbox, Tooltip } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList } from "@refinedev/core";
import { ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import {
  IconCopy,
  IconEdit,
  IconFilter,
  IconGripHorizontal,
  IconLetterS,
  IconPlus,
  IconRun,
  IconSearch,
} from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { IconLetterB } from "@tabler/icons-react";
import Reveal from "@components/Reveal";
import FilterComponent from "@components/Filter";

interface QuickActionsBarProps {
  name: string;
  heading: string;
  subheading: string;
  description: string;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
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
    searchFilters,
    setSearchFilters,
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

        <div>
          <Tooltip label="Toggle search" position="top">
            <ActionIcon
              aria-label="any"
              size="sm"
              onClick={() => toggleDisplay("searchInput")}
              variant={
                activeLayout?.searchInput?.isDisplayed ? "filled" : "outline"
              }
            >
              <IconSearch />
            </ActionIcon>
          </Tooltip>
        </div>
        <div>
          <FilterComponent />
        </div>
      </div>
      {/* {activeLayout?.searchInput?.isDisplayed && (
        <div className="hidden lg:block w-full">
          <SearchInput
            sessions_list={session_data_items || []}
            record={activeSession}
            view_item={null}
          />
        </div>
      )} */}
    </div>
  );
};

export default QuickActionsBar;
