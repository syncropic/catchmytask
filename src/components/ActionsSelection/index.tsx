// ResourceHeader.tsx
import React from "react";
import { Title, Text, ActionIcon } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList, useOne } from "@refinedev/core";
import { IDataset, ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import { CreateButton } from "@refinedev/mantine";
import { IconCopy, IconEdit } from "@tabler/icons-react";

interface ActionsSelectionProps {
  record: any;
  // heading: string;
  // subheading: string;
  // description: string;
}

const ActionsSelection: React.FC<ActionsSelectionProps> = ({
  record,
  // heading,
  // subheading,
  // description,
}) => {
  // console.log("params.id", params?.id);
  // getSessionById
  // const {
  //   data: session,
  //   isLoading: sessionIsLoading,
  //   error: sessionError,
  // } = useFetchSessionById(params?.id);
  const { activeSession, activeApplication } = useAppStore();

  // const sessionDataset = useOne<IDataset, HttpError>({
  //   resource: "datasets",
  //   id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
  // });

  // // console.log("sessionDataset", sessionDataset);
  // const defaultDatasetListItem = sessionDataset.data?.data.list.find(
  //   (item) => item.name == "default"
  // );
  // // console.log("defaultSessionListItem", defaultSessionListItem);

  // const actionsList = defaultDatasetListItem?.actions;
  // const {
  //   data,
  //   isLoading: isLoadingReports,
  //   isError: isErrorReports,
  // } = useList<ISession, HttpError>({
  //   resource: "sessions",
  //   filters: [
  //     {
  //       field: "session_status",
  //       operator: "eq",
  //       value: "published",
  //     },
  //     {
  //       field: "application",
  //       operator: "eq",
  //       value: activeApplication?.id,
  //     },
  //   ],
  // });

  // const session_data_items = data?.data ?? [];

  return (
    <div className="flex gap-3 items-center m-2">
      {/* <Title order={4}>{name}</Title> */}
      {JSON.stringify(record)}
      {/* <SelectSession
        sessions_list={session_data_items || []}
        record={activeSession}
        view_item={null}
      />
      <CreateButton
        size="xs"
        resource="sessions"
        meta={{ applicationId: activeApplication?.id }}
        disabled={true}
      >
        Create Session
      </CreateButton>
      <ActionIcon variant="filled" aria-label="Settings" disabled={true}>
        <IconCopy style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
      <ActionIcon variant="filled" aria-label="Settings" disabled={true}>
        <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon> */}
    </div>
  );
};

export default ActionsSelection;
