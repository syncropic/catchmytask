import { ActionComponentProps } from "@components/interfaces";
import ExternalSubmitButton from "@components/SubmitButton";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

// const PAGE_SIZES = [10, 15, 20];
interface AutomationToggleProps {
  record: any;
  onAction: any;
  query_key?: string;
}

const AutomationToggle: React.FC<AutomationToggleProps> = ({
  record,
  onAction,
  query_key,
}) => {
  if (!record?.metadata?.can_automate) {
    return null;
  }

  const isRunning = record?.status === "run";

  const handleToggle = (e: React.MouseEvent) => {
    onAction({
      record,
      action: isRunning ? "pause" : "run",
      e,
    });
  };

  // Then use the interface for both components
  const CustomIconPlayerPlayButton: React.FC<ActionComponentProps> = ({
    onClick,
    disabled = false,
    loading = false,
  }) => (
    <IconPlayerPlay
      onClick={onClick}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    />
  );

  const CustomIconPlayerPauseButton: React.FC<ActionComponentProps> = ({
    onClick,
    disabled = false,
    loading = false,
  }) => (
    <IconPlayerPause
      onClick={onClick}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    />
  );

  return (
    <Tooltip
      key="automation-toggle"
      label={isRunning ? "pause" : "run"}
      position="top"
    >
      <ActionIcon
        size="sm"
        variant="subtle"
        color={isRunning ? "red" : "green"}
        onClick={handleToggle}
      >
        {isRunning ? (
          <ExternalSubmitButton
            record={record}
            entity_type="tasks"
            ActionComponent={CustomIconPlayerPauseButton}
            action={"pause"}
            action_form_key={`query_${record?.id}`}
            // action_form_key={`query_general`}
            invalidate_query_key={query_key}
          />
        ) : (
          // <IconPlayerPlay size={16} />
          <ExternalSubmitButton
            record={record}
            entity_type="tasks"
            ActionComponent={CustomIconPlayerPlayButton}
            action={"run"}
            action_form_key={`query_${record?.id}`}
            // action_form_key={`query_general`}
            invalidate_query_key={query_key}
          />
        )}
      </ActionIcon>
    </Tooltip>
  );
};

export default AutomationToggle;
