// Example usage in a Next.js page or component
// src/pages/task-editor.tsx or src/components/TaskEditor.tsx

import { useState, useEffect } from "react";
import { Box, Title, Card, Group, Button, Loader } from "@mantine/core";
import { IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";
import stepsService, { Step } from "src/services/stepsService";
import ExecutionSteps from ".";

const TaskEditor = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load initial steps
  useEffect(() => {
    const loadSteps = async () => {
      try {
        setLoading(true);
        const loadedSteps = await stepsService.getSteps();
        setSteps(loadedSteps);
      } catch (error) {
        console.error("Error loading steps:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSteps();
  }, []);

  // Handle steps update
  const handleStepsChange = (newSteps: Step[]) => {
    setSteps(newSteps);
  };

  // Save steps
  const saveSteps = async () => {
    try {
      setSaving(true);
      await stepsService.updateSteps(steps);
      // You might want to show a success notification here
    } catch (error) {
      console.error("Error saving steps:", error);
      // You might want to show an error notification here
    } finally {
      setSaving(false);
    }
  };

  // Reset steps to original
  const resetSteps = async () => {
    try {
      setLoading(true);
      const originalSteps = await stepsService.getSteps();
      setSteps(originalSteps);
    } catch (error) {
      console.error("Error resetting steps:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-3">
      {loading ? (
        <Box className="flex justify-center p-10">
          <Loader size="md" />
        </Box>
      ) : (
        <ExecutionSteps
          steps={steps}
          onStepsChange={handleStepsChange}
          className="mb-6"
        />
      )}
    </Box>
  );
};

export default TaskEditor;
