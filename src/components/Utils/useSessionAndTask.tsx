// useSessionAndTask.ts
// This hook handles setting the active session and task based on the domain record and ensures that the application and session states are correctly initialized.

import { useEffect } from "react";
import { useAppStore } from "src/store";

export const useSessionAndTask = (domainRecord: any) => {
  const { activeSession, setActiveSession, activeTask, setActiveApplication } =
    useAppStore();

  useEffect(() => {
    if (domainRecord?.["application"]) {
      setActiveApplication(domainRecord?.["application"]);
    }

    // If no active session exists, set the default session from the domain record
    if (
      !activeSession &&
      domainRecord?.["application"]?.["defaults"]?.["session"]
    ) {
      setActiveSession(domainRecord?.["application"]["defaults"]["session"]);
    }
  }, [domainRecord, activeSession]);
};
