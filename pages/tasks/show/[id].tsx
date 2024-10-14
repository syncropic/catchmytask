import { Title, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { useParsed } from "@refinedev/core";
import MonacoEditor from "@components/MonacoEditor";
import { useReadRecordByState } from "@components/Utils";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";

export const ShowPage: React.FC = () => {
  const {
    activeApplication,
    setActiveApplication,
    activeTask,
    setActiveTask,
    activeSession,
    setActiveSession,
  } = useAppStore();

  const { resource, action, id, pathname, params } = useParsed();

  // Initialize loading and error state for tracking
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the records based on params
  const applicationState = {
    record: { id: params?.applicationId },
    read_record_mode: "remote",
  };
  const sessionState = {
    record: { id: params?.sessionId },
    read_record_mode: "remote",
  };
  const taskState = { record: { id: params?.id }, read_record_mode: "remote" };

  // Use hooks to read records, but we will conditionally manage their results
  const {
    data: appData,
    error: appError,
    isLoading: appLoading,
  } = useReadRecordByState(applicationState);
  const {
    data: sessionData,
    error: sessionError,
    isLoading: sessionLoading,
  } = useReadRecordByState(sessionState);
  const {
    data: taskData,
    error: taskError,
    isLoading: taskLoading,
  } = useReadRecordByState(taskState);

  useEffect(() => {
    // Check for application and set if necessary
    if (!activeApplication || activeApplication?.id !== params?.applicationId) {
      let application = appData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (application) setActiveApplication(application);
    }

    // Check for session and set if necessary, if not explicitly cleared (set to false)
    if (
      activeSession !== false &&
      (!activeSession || activeSession?.id !== params?.sessionId)
    ) {
      let session = sessionData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (session) setActiveSession(session);
    }
    // Only set activeTask if it wasn't explicitly cleared (set to false)
    if (
      activeTask !== false &&
      (!activeTask || (activeTask?.id !== params?.id && params?.id))
    ) {
      if (taskData) {
        let task = taskData?.data?.find(
          (item: any) => item?.message?.code === "record_read"
        )?.data[0];
        if (task) setActiveTask(task);
      }
    }

    // If all data has been loaded, set loading to false
    if (!appLoading && !sessionLoading && !taskLoading) {
      setLoading(false);
    }

    // Handle errors
    if (appError || sessionError || taskError) {
      setError(
        appError?.message ||
          sessionError?.message ||
          taskError?.message ||
          "An error occurred"
      );
      setLoading(false);
    }
  }, [
    appData,
    sessionData,
    taskData,
    appLoading,
    sessionLoading,
    taskLoading,
    appError,
    sessionError,
    taskError,
    activeApplication,
    activeSession,
    activeTask,
    params,
  ]);

  // Show loading state or error state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <ErrorComponent error={error} component={"error loading params data"} />
    );
  }

  // Render the Monaco editor once everything is loaded
  return (
    <>
      {/* <MonacoEditor
        value={{
          resource,
          action,
          id,
          pathname,
          params,
        }}
        language="json"
        height="25vh"
      /> */}
      {/* <div>task show page</div> */}
      {/* <Breadcrumbs /> */}
    </>
  );
};

export default ShowPage;
