import { Select } from "@mantine/core";
import { useGo } from "@refinedev/core";
import { useForm } from "@refinedev/mantine";
import { useState } from "react";
import { useAppStore } from "src/store";

// Define a placeholder list of sessions
const placeholderSessions = [
  { id: "1", name: "Session 1" },
  { id: "2", name: "Session 2" },
  { id: "3", name: "Session 3" },
];

interface SelectSessionComponentProps<T extends Record<string, any>> {
  sessions_list: T[];
  record: T;
  view_item: T;
}

function SelectSession<T extends Record<string, any>>({
  sessions_list,
  record,
  view_item,
}: SelectSessionComponentProps<T>) {
  const [fieldFocused, setFieldFocused] = useState(false);
  const { setActiveSession, activeApplication } = useAppStore();
  const go = useGo();

  const {
    getInputProps,
    setFieldValue,
    refineCore: { onFinish },
    isTouched,
  } = useForm({
    initialValues: {
      session: "",
    },
  });

  const handleSessionChange = (value: string) => {
    const selectedSession = placeholderSessions.find(
      (session) => session.id === value
    );

    if (selectedSession) {
      setActiveSession(selectedSession);
      go({
        to: {
          resource: "sessions",
          action: "show",
          id: selectedSession.id,
          meta: {
            applicationId: activeApplication?.id,
          },
        },
        type: "push",
      });
    }
  };

  const handleFocus = () => {
    if (isTouched("session")) return;
    setFieldFocused(true);
  };

  return (
    <div className="flex-grow">
      <Select
        placeholder="Select session"
        {...getInputProps("session")}
        searchable={true}
        onFocus={handleFocus}
        data={placeholderSessions.map((session) => ({
          value: session.id,
          label: session.name,
        }))}
        // onChange={handleSessionChange}
      />
    </div>
  );
}

export default SelectSession;
