import {
  IconArrowUp,
  IconBrandLine,
  IconCode,
  IconDots,
  IconMessageCircle,
  IconPencil,
  IconSettings,
} from "@tabler/icons-react";
import { useWindowScroll } from "@mantine/hooks";
import {
  ActionIcon,
  Affix,
  Button,
  Menu,
  Modal,
  Text,
  Transition,
} from "@mantine/core";
import { useAppStore } from "src/store";
import ActionInputWrapper from "@components/ActionInput";
import { useParsed } from "@refinedev/core";
import ActionToolbar from "@components/ActionToolbar";
import { useSession } from "next-auth/react";

const SessionActionInput = () => {
  const [scroll, scrollTo] = useWindowScroll();
  const { data: user_session } = useSession();

  const { params } = useParsed();
  const {
    toggleDisplaySessionActionInput,
    global_developer_mode,
    global_session_trace_mode,
    activeInput,
    setActiveInput,
    setActiveLayout,
    sectionIsExpanded,
    setSectionIsExpanded,
    activeLayout,
    activeSession,
    displaySessionActionInput,
  } = useAppStore();

  const closeDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = false;
      setActiveLayout(newLayout);
    }
  };

  return (
    <>
      <Modal
        opened={displaySessionActionInput}
        onClose={toggleDisplaySessionActionInput}
        styles={{
          header: {
            padding: 0,
            marginBottom: 0,
          },
          title: {
            width: "100%",
          },
        }}
        title={
          <div className="w-full">
            {/* Name - Blue background */}
            <div className="bg-blue-50 px-4 py-1 border-b border-blue-100">
              <h3 className="text-sm font-medium text-blue-900 break-words">
                {activeSession?.name}
              </h3>
            </div>

            {/* Toolbar */}
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
                />
              </div>
            </div>
          </div>
        }
      >
        {!global_developer_mode && !global_session_trace_mode && (
          <div>
            <ActionInputWrapper
              data_model="user mode query input"
              query_name="data_model"
              record={{ id: params?.id }}
              action="query"
              action_form_key={`form_${params?.id}`}
              success_message_code="user_mode_query_input"
            />
          </div>
        )}
      </Modal>
      {!displaySessionActionInput && (
        <Affix
          position={{ bottom: 60, left: "50%" }}
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="flex gap-3">
            <ActionIcon
              variant="filled"
              aria-label="Settings"
              radius="xl"
              size="xl"
              onClick={toggleDisplaySessionActionInput}
            >
              <IconBrandLine />
            </ActionIcon>
          </div>
        </Affix>
      )}
    </>
  );
};

export default SessionActionInput;
