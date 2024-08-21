// SessionBar.tsx
import React from "react";
import { ActionIcon } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList } from "@refinedev/core";
import { ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import {
  IconCopy,
  IconEdit,
  IconGripHorizontal,
  IconPlus,
  IconRun,
  IconSearch,
} from "@tabler/icons-react";

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
  } = useAppStore();

  // const { activeLayout, setActiveLayout } = useAppStore();
  // // handle toggleDisplay
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

  // const handleSelectAction = (action: any) => {
  //   setActiveAction(action);
  // };

  return (
    <div className="flex w-full items-center pl-4 pr-4 space-x-4">
      <SelectSession
        sessions_list={session_data_items || []}
        record={activeSession}
        view_item={null}
      />
      <div className="flex items-center space-x-2">
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
          <IconRun />
        </ActionIcon>

        {/* <ActionIcon
          variant="filled"
          aria-label="Create Session"
          size="sm"
          disabled
          onClick={() => handleSelectAction({ name: "create_session" })}
        >
          <IconPlus />
        </ActionIcon> */}
        {/* <ActionIcon variant="filled" aria-label="Copy" disabled size="sm">
          <IconCopy />
        </ActionIcon> */}
        {/* <ActionIcon variant="filled" aria-label="Edit" disabled size="sm">
          <IconEdit />
        </ActionIcon> */}
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
        <ActionIcon
          aria-label="any"
          size="sm"
          onClick={() => toggleSessionInteractionMode("any")}
          variant={
            sessionConfig.interaction_mode == "any" ? "filled" : "outline"
          }
        >
          <IconGripHorizontal />
        </ActionIcon>
      </div>
    </div>
  );
};

export default SessionBar;
