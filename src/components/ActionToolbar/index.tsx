import ExternalSubmitButton from "@components/SubmitButton";
import { Button, Indicator, Tooltip } from "@mantine/core";
import {
  IconAdjustments,
  IconArrowsMaximize,
  IconArrowsMinimize,
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
  const {
    global_input_mode,
    showVariables,
    toggleShowVariables,
    showFields,
    toggleShowFields,
    filter_form_values,
  } = useAppStore();
  let global_input_mode_developer =
    global_input_mode === "developer" ? true : false;

  // Function to count active filters for the current form
  const getActiveFiltersCount = (formKey: string) => {
    const filterKey = `${formKey}_filter`;
    const formValues = filter_form_values[filterKey] || {};

    // Count fields that have a value and aren't null
    return Object.entries(formValues).reduce((count, [key, value]) => {
      // Only count main values, not operators or value2
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
    <div className="w-full flex items-center justify-between bg-gray-50 px-3 py-2">
      {/* Toggle Buttons */}

      <div className="flex gap-2">
        {params?.id && global_input_mode_developer && (
          <>
            {hasPermission("query_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="sessions"
                action_form_key={`form_${params.id}`}
                action="query"
              />
            )}
          </>
        )}

        {params?.id && (
          <>
            {hasPermission("queue_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="sessions"
                action_form_key={`form_${params.id}`}
                action="queue"
              />
            )}
          </>
        )}

        {/* {params?.id && (
          <>
            {hasPermission("schedule_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="sessions"
                action_form_key={`form_${params.id}`}
                action="schedule"
              />
            )}
          </>
        )} */}
        {/* {params?.id && !global_developer_mode && (
          <>
            {hasPermission("queue_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="sessions"
                action_form_key={`form_${params.id}`}
                action="connect"
              />
            )}
          </>
        )} */}
        {params?.id && global_input_mode_developer && (
          <>
            {/* {true && (
              <Tooltip label="session info">
                <Button
                  size="compact-sm"
                  variant={activeInput === "info" ? "outline" : "default"}
                  onClick={() => setActiveInput("info")}
                  className="whitespace-nowrap"
                >
                  Info
                </Button>
              </Tooltip>
            )} */}
            {/* 
            {hasPermission("describe_action_input") && (
              <Button
                size="compact-sm"
                variant={
                  activeInput === "natural_language_query"
                    ? "outline"
                    : "default"
                }
                onClick={() => setActiveInput("natural_language_query")}
                className="whitespace-nowrap"
              >
                Describe
              </Button>
            )} */}

            {/* {hasPermission("code_action_input") && (
              <Button
                size="compact-sm"
                variant={
                  activeInput === "structured_query" ? "outline" : "default"
                }
                onClick={() => setActiveInput("structured_query")}
                className="whitespace-nowrap"
              >
                Code
              </Button>
            )} */}

            {/* {hasPermission("terminal_action_input") && (
              <Button
                size="compact-sm"
                variant={
                  activeInput === "terminal_query" ? "outline" : "default"
                }
                onClick={() => setActiveInput("terminal_query")}
                className="whitespace-nowrap"
              >
                Terminal
              </Button>
            )} */}

            {/* {hasPermission("split_action_input") && (
              <Button
                size="compact-sm"
                variant={
                  activeInput === "structured_query" ? "outline" : "default"
                }
                disabled={true}
                className="whitespace-nowrap"
              >
                Split
              </Button>
            )} */}

            {/* {hasPermission("query_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="tasks"
                action_form_key={`form_${params.id}`}
                action="query"
              />
            )} */}

            {/* {hasPermission("queue_action_input") && (
              <ExternalSubmitButton
                record={{}}
                entity_type="tasks"
                action_form_key={`form_${params.id}`}
                action="queue"
              />
            )} */}
          </>
        )}
      </div>
      <div className="flex gap-2">
        <div>
          <Tooltip
            label={`${showVariables ? "hide" : "show"} variables input`}
            key="variables"
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
                size="compact-sm"
                leftSection={<IconAdjustments size={20} />}
                variant="outline"
                // variant={showVariables ? "filled" : "outline"}
                onClick={toggleShowVariables}
                // disabled={!global_developer_mode}
              >
                Variables
              </Button>
            </Indicator>
          </Tooltip>
        </div>

        <div>
          <Tooltip
            label={`${showFields ? "hide" : "show"} toggle and reorder fields`}
            key="variables"
          >
            <Indicator
              inline
              // label={getActiveFiltersCount(action_form_key)}
              size={16}
              // disabled={getActiveFiltersCount(action_form_key) === 0}
              disabled={true}
              color="blue"
              offset={4}
            >
              <Button
                size="compact-sm"
                leftSection={<IconColumns size={20} />}
                variant="outline"
                // variant={showVariables ? "filled" : "outline"}
                onClick={toggleShowFields}
                // disabled={!global_developer_mode}
              >
                Fields
              </Button>
            </Indicator>
          </Tooltip>
        </div>
      </div>

      {/* {includeComponents?.includes("toolbar") && (
        <div>
          <div
            className="flex p-3 gap-3 items-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Tooltip
              label={
                sectionIsExpanded === "leftSection" ? "minimize" : "expand"
              }
            >
              <Button
                size="compact-xs"
                variant="outline"
                // className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                onClick={() => setSectionIsExpanded("leftSection")}
              >
                {sectionIsExpanded === "leftSection" ? (
                  <IconArrowsMinimize size={16} />
                ) : (
                  <IconArrowsMaximize size={16} />
                )}
              </Button>
            </Tooltip>

            <Tooltip label="close">
              <Button
                size="compact-xs"
                variant="outline"
                onClick={() => closeDisplay("leftSection")}
              >
                <IconSquareX size={16} />
              </Button>
            </Tooltip>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ActionToolbar;
