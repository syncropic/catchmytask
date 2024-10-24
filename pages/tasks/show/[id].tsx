import { Title, Text } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "src/store";
import { useParsed, useNavigation } from "@refinedev/core";
import { useReadRecordByState } from "@components/Utils";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";

export const ShowPage: React.FC = () => {
  const {
    activeApplication,
    setActiveApplication,
    activeTask,
    activeView,
    setActiveTask,
    activeSession,
    setActiveSession,
    setActiveView,
  } = useAppStore();

  const { resource, action, id, pathname, params } = useParsed();
  const { push } = useNavigation();

  // State for tracking loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid unnecessary re-renders
  const previousTaskIdRef = useRef<string | null>(null);

  // Define states for the records
  const applicationState = {
    record: { id: params?.applicationId },
    read_record_mode: "remote",
  };
  const sessionState = {
    record: { id: params?.sessionId },
    read_record_mode: "remote",
  };
  const viewState = {
    record: { id: params?.viewId },
    read_record_mode: "remote",
  };
  const taskState = {
    record: { id: params?.id },
    read_record_mode: "remote",
  };

  // Fetch records using state configurations
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
  const {
    data: viewData,
    error: viewError,
    isLoading: viewLoading,
  } = useReadRecordByState(viewState);

  // Update application, session, view, and task only if necessary
  useEffect(() => {
    const updateEntities = () => {
      const newApplication = appData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (newApplication && newApplication.id !== activeApplication?.id) {
        setActiveApplication(newApplication);
      }

      const newSession = sessionData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (newSession && newSession.id !== activeSession?.id) {
        setActiveSession(newSession);
      }

      const newTask = taskData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (newTask && newTask.id !== previousTaskIdRef.current) {
        previousTaskIdRef.current = newTask.id;
        setActiveTask(newTask);
      }

      const newView = viewData?.data?.find(
        (item: any) => item?.message?.code === "record_read"
      )?.data[0];

      if (newView && newView.id !== activeView?.id) {
        setActiveView(newView);
      }
    };

    updateEntities();

    // Set loading to false when all data is fetched
    if (!appLoading && !sessionLoading && !taskLoading && !viewLoading) {
      setLoading(false);
    }

    // Handle errors
    if (appError || sessionError || taskError || viewError) {
      setError(
        appError?.message ||
          sessionError?.message ||
          taskError?.message ||
          viewError?.message ||
          "An error occurred"
      );
      setLoading(false);
    }
  }, [
    appData,
    sessionData,
    taskData,
    viewData,
    appLoading,
    sessionLoading,
    taskLoading,
    appError,
    sessionError,
    taskError,
    viewError,
    activeApplication?.id,
    activeSession?.id,
    activeView?.id,
    setActiveApplication,
    setActiveSession,
    setActiveTask,
    setActiveView,
  ]);

  // Redirect to /home if no active task is found
  // useEffect(() => {
  //   if (!activeTask && !taskLoading) {
  //     push("/home");
  //   }
  // }, [activeTask, taskLoading, push]);

  // Display loading or error state
  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <ErrorComponent error={error} component={"Error loading params data"} />
    );
  }

  console.log("Task ID:", activeTask?.id);
  console.log("VIEW ID:", activeView?.id);

  // Render the page content
  return (
    <>
    {/* {!activeView && (<Title order={3}>Get Important Things Done.</Title>)} */}
      {/* <Breadcrumbs /> */}
      {/* <Text>Task Show Page</Text>
      <Title order={2}>{activeTask?.name || "No Task Name"}</Title> */}
    </>
  );
};

export default ShowPage;
