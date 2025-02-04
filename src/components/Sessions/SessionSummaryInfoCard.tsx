import React from "react";
import { IconUser } from "@tabler/icons-react";
import ActionToolbar from "@components/ActionToolbar";
import { useAppStore } from "src/store";
import { useSession } from "next-auth/react";
import { useParsed } from "@refinedev/core";
import ExternalSubmitButton from "@components/SubmitButton";
import { formatAuthorId } from "@components/Utils";

interface SessionData {
  id: string;
  name: string;
  excerpt: string;
  author_id: string;
  created_datetime: string;
}

interface SessionSummaryInfoCardProps {
  session: SessionData;
  execlude_components?: string[];
}

const SessionSummaryInfoCard: React.FC<SessionSummaryInfoCardProps> = ({
  session,
  execlude_components,
}) => {
  const {
    sectionIsExpanded,
    setSectionIsExpanded,
    activeLayout,
    setActiveLayout,
    activeInput,
    setActiveInput,
    action_input_form_values,
  } = useAppStore();
  const { data: user_session } = useSession();
  const { params, pathname } = useParsed<{ id: string }>();

  let action_form_key = `form_${params?.id || "general"}`;

  const closeDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = false;
      setActiveLayout(newLayout);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Name - Blue background */}
      <div className="bg-blue-50 px-4 py-1 border-b border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 break-words">
          {session.name}
        </h3>
      </div>

      {/* Excerpt - Light grey background */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
        <p className="text-sm text-gray-600 break-words">{session.excerpt}</p>
      </div>

      {/* Author Info + Date */}
      <div className="px-4 py-3 flex flex-wrap items-center gap-4 text-sm bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <IconUser className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span className="font-medium text-gray-900 break-all">
            {formatAuthorId(session.author_id || "")}
          </span>
        </div>
        <span className="text-gray-500">
          {formatDate(session.created_datetime)}
        </span>
      </div>

      {/* Session ID */}
      <div className="px-4 py-2 text-xs bg-gray-50 text-gray-500 border-t border-gray-100">
        <div className="break-all">
          ID: <span className="font-mono">{session.id}</span>
        </div>
      </div>

      {/* Variables value - with enhanced visual hierarchy */}
      {action_input_form_values[action_form_key]?.variables_value && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Variables
            </label>
            <div className="bg-gray-50 p-3 rounded-md">
              <pre className="text-xs font-mono text-blue-600 whitespace-pre-wrap break-all">
                {action_input_form_values[action_form_key]?.variables_value ||
                  ""}
              </pre>
            </div>
          </div>
        </div>
      )}
      {/* Interaction Actions */}
      {execlude_components?.includes("toolbar") ? null : (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="min-w-0 w-full">
            <ActionToolbar
              params={params}
              userSession={user_session}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
              sectionIsExpanded={sectionIsExpanded}
              setSectionIsExpanded={setSectionIsExpanded}
              closeDisplay={closeDisplay}
              includeComponents={["toolbar"]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryInfoCard;
