import ExternalSubmitButton from "@components/SubmitButton";
import { Button, Indicator, Tooltip } from "@mantine/core";
import {
  IconAdjustments,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconClock,
  IconColumns,
  IconSquareX,
} from "@tabler/icons-react";
import React from "react";
import { useAppStore } from "src/store";

interface UserProfile {
  permissions?: string[];
}

interface UserSession {
  userProfile?: UserProfile;
}

interface ExternalSubmitButtonProps {
  record: Record<string, unknown>;
  entity_type: string;
  action_form_key: string;
  action: string;
}

interface ActionToolbarProps {
  params?: any;
  userSession?: any;
  activeInput:
    | "info"
    | "natural_language_query"
    | "structured_query"
    | "terminal_query";
  setActiveInput: (
    input:
      | "info"
      | "natural_language_query"
      | "structured_query"
      | "terminal_query"
  ) => void;
  sectionIsExpanded: string;
  setSectionIsExpanded: (section: string) => void;
  closeDisplay: (section: string) => void;
  includeComponents?: string[];
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  params,
  userSession,
  activeInput,
  setActiveInput,
  sectionIsExpanded,
  setSectionIsExpanded,
  closeDisplay,
  includeComponents = [],
}) => {
  const hasPermission = (permission: string): boolean => {
    return Boolean(userSession?.userProfile?.permissions?.includes(permission));
  };

  let view_items = params?.view_items?.split(",");

  const {
    global_input_mode,
    showVariables,
    toggleShowVariables,
    showFields,
    toggleShowFields,
    showSchedule,
    toggleShowSchedule,
    filter_form_values,
    activeSession,
  } = useAppStore();

  let global_input_mode_developer =
    global_input_mode === "developer" ? true : false;

  const getActiveFiltersCount = (formKey: string) => {
    const filterKey = `${formKey}_filter`;
    const formValues = filter_form_values[filterKey] || {};

    return Object.entries(formValues).reduce((count, [key, value]) => {
      if (
        !key.includes("_operator") &&
        !key.includes("_value2") &&
        value !== null &&
        value !== ""
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between bg-gray-50 px-3 py-2 space-y-2 md:space-y-0">
      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {params?.id &&
          hasPermission("query_action_input") &&
          activeSession?.features?.includes("can_query") && (
            <ExternalSubmitButton
              record={{}}
              entity_type="sessions"
              action_form_key={`form_${params.id}`}
              action="query"
            />
          )}

        {params?.id &&
          hasPermission("queue_action_input") &&
          activeSession?.features?.includes("can_queue") && (
            <ExternalSubmitButton
              record={{}}
              entity_type="sessions"
              action_form_key={`form_${params.id}`}
              action="queue"
            />
          )}

        {params?.id &&
          hasPermission("schedule_action_input") &&
          activeSession?.features?.includes("can_schedule") && (
            <ExternalSubmitButton
              record={{}}
              entity_type="sessions"
              action_form_key={`form_${params.id}`}
              action="schedule"
            />
          )}
      </div>

      {/* Utility Buttons Row - No wrapping */}
      <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
        <div className="flex items-center gap-2 w-full justify-start md:justify-end">
          {activeSession?.variables?.length > 0 && (
            <Tooltip
              label={`${showVariables ? "hide" : "show and provide"} variables`}
            >
              <Indicator
                inline
                label={getActiveFiltersCount(`form_${params.id}`)}
                size={16}
                disabled={getActiveFiltersCount(`form_${params.id}`) === 0}
                color="blue"
                offset={4}
              >
                <Button
                  size="compact-xs"
                  leftSection={<IconAdjustments size={14} />}
                  variant={showVariables ? "filled" : "outline"}
                  onClick={toggleShowVariables}
                >
                  Variables
                </Button>
              </Indicator>
            </Tooltip>
          )}

          {params?.id && view_items?.length > 0 && (
            <Tooltip
              label={`${showFields ? "hide" : "show and reorder"} fields`}
            >
              <Indicator
                inline
                size={16}
                disabled={true}
                color="blue"
                offset={4}
              >
                <Button
                  size="compact-xs"
                  leftSection={<IconColumns size={14} />}
                  variant={showFields ? "filled" : "outline"}
                  onClick={toggleShowFields}
                >
                  Fields
                </Button>
              </Indicator>
            </Tooltip>
          )}

          {params?.id &&
            hasPermission("schedule_action_input") &&
            activeSession?.features?.includes("can_schedule") && (
              <Tooltip
                label={`${
                  showSchedule ? "hide" : "show and configure"
                } schedule`}
              >
                <Indicator
                  inline
                  size={16}
                  disabled={true}
                  color="blue"
                  offset={4}
                >
                  <Button
                    size="compact-xs"
                    leftSection={<IconClock size={14} />}
                    variant={showSchedule ? "filled" : "outline"}
                    onClick={toggleShowSchedule}
                  >
                    Schedule
                  </Button>
                </Indicator>
              </Tooltip>
            )}
        </div>
      </div>
    </div>
  );
};

export default ActionToolbar;
