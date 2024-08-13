// ResourceHeader.tsx
import React from "react";
import { ActionIcon } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList } from "@refinedev/core";
import { ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import { IconCopy, IconEdit, IconPlus } from "@tabler/icons-react";

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
  const { activeSession, activeApplication, setActiveAction } = useAppStore();

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

  const handleSelectAction = (action: any) => {
    setActiveAction(action);
  };

  return (
    <div className="flex w-full items-center pl-4 pr-4 space-x-4">
      <SelectSession
        sessions_list={session_data_items || []}
        record={activeSession}
        view_item={null}
      />
      <div className="flex items-center space-x-2">
        <ActionIcon
          variant="filled"
          aria-label="Create Session"
          onClick={() => handleSelectAction({ name: "create_session" })}
        >
          <IconPlus />
        </ActionIcon>
        <ActionIcon variant="filled" aria-label="Copy" disabled>
          <IconCopy />
        </ActionIcon>
        <ActionIcon variant="filled" aria-label="Edit" disabled>
          <IconEdit />
        </ActionIcon>
      </div>
    </div>
  );
};

export default SessionBar;
