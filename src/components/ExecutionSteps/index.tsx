import React, { useState, useRef, useEffect } from "react";
import {
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconX,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
  IconDatabaseImport,
  IconDatabase,
  IconDeviceFloppy,
  IconCode,
  IconCloud,
} from "@tabler/icons-react";
import {
  Checkbox,
  TextInput,
  Select,
  Badge,
  Button,
  Tooltip,
  ActionIcon,
} from "@mantine/core";

// Types
type StepPhase =
  | "initialization"
  | "data-collection"
  | "data-update"
  | "data-processing"
  | "finalization";
type StepPriority = "high" | "medium" | "low";
type StepStatus =
  | "pending"
  | "in-progress"
  | "running"
  | "completed"
  | "failed"
  | "warning";
type AgentType = "executor" | "fetcher" | "updater" | "sql" | "python";

interface StepOption {
  [key: string]: string | number | boolean | string[];
}

interface Step {
  id: string;
  title: string;
  description?: string;
  assignedTo: AgentType;
  status: StepStatus;
  nestLevel: number;
  phase?: StepPhase;
  priority?: StepPriority;
  codeSnippet?: string;
  pythonSnippets?: string[];
  skipCondition?: string;
  options?: StepOption;
  dependencies?: string | string[];
  consumes?: string | string[];
  produces?: string | string[];
  dataSource?: string;
  children: Step[];
}

interface ExecutionStepsProps {
  steps: Step[];
  onStepsChange: (steps: Step[]) => void;
  className?: string;
}

const ExecutionSteps: React.FC<ExecutionStepsProps> = ({
  steps,
  onStepsChange,
  className = "",
}) => {
  // State
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Step>>({});
  const [draggedStep, setDraggedStep] = useState<Step | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [showFullCodeMap, setShowFullCodeMap] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhaseFilters, setActivePhaseFilters] = useState<StepPhase[]>([]);
  const [activePriorityFilters, setActivePriorityFilters] = useState<
    StepPriority[]
  >([]);

  const dragNode = useRef<HTMLDivElement | null>(null);

  // Toggle full code display for a step
  const toggleFullCode = (stepId: string) => {
    setShowFullCodeMap((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // Toggle expanded/collapsed state of a step
  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // Toggle step selection
  const toggleSelectStep = (stepId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (selectedSteps.includes(stepId)) {
      setSelectedSteps(selectedSteps.filter((id) => id !== stepId));
    } else {
      setSelectedSteps([...selectedSteps, stepId]);
    }
  };

  // Toggle select all steps
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSteps([]);
    } else {
      const allStepIds = getAllSteps(steps).map((step) => step.id);
      setSelectedSteps(allStepIds);
    }
    setSelectAll(!selectAll);
  };

  // Get all steps (flatten the hierarchy)
  const getAllSteps = (stepsToFlatten: Step[]): Step[] => {
    const result: Step[] = [];

    const traverse = (steps: Step[]) => {
      steps.forEach((step) => {
        result.push(step);
        if (step.children && step.children.length > 0) {
          traverse(step.children);
        }
      });
    };

    traverse(stepsToFlatten);
    return result;
  };

  // Find a step by ID (including nested steps)
  const findStep = (stepsToSearch: Step[], id: string): Step | null => {
    for (const step of stepsToSearch) {
      if (step.id === id) return step;
      if (step.children && step.children.length > 0) {
        const found = findStep(step.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Find parent step containing specified child step ID
  const findParentStep = (
    stepsToSearch: Step[],
    childId: string,
    parent: Step | null = null
  ): Step | null => {
    for (const step of stepsToSearch) {
      if (step.id === childId) return parent;
      if (step.children && step.children.length > 0) {
        const found = findParentStep(step.children, childId, step);
        if (found) return found;
      }
    }
    return null;
  };

  // Update step properties
  const updateStep = (stepId: string, updates: Partial<Step>) => {
    const updateStepRecursive = (stepsToUpdate: Step[]): Step[] => {
      return stepsToUpdate.map((step) => {
        if (step.id === stepId) {
          return { ...step, ...updates };
        }
        if (step.children && step.children.length > 0) {
          return { ...step, children: updateStepRecursive(step.children) };
        }
        return step;
      });
    };

    const newSteps = updateStepRecursive([...steps]);
    onStepsChange(newSteps);
  };

  // Start editing a step
  const startEditStep = (step: Step) => {
    setEditingStepId(step.id);
    setEditValues({
      title: step.title,
      description: step.description,
      assignedTo: step.assignedTo,
      status: step.status,
      phase: step.phase,
      priority: step.priority,
    });
  };

  // Save edited step
  const saveEditStep = () => {
    if (editingStepId && editValues.title?.trim()) {
      updateStep(editingStepId, editValues);
      setEditingStepId(null);
      setEditValues({});
    }
  };

  // Delete a step
  const deleteStep = (stepId: string) => {
    const deleteStepRecursive = (stepsToFilter: Step[]): Step[] => {
      return stepsToFilter.filter((step) => {
        if (step.id === stepId) {
          return false;
        }
        if (step.children && step.children.length > 0) {
          step.children = deleteStepRecursive(step.children);
        }
        return true;
      });
    };

    const newSteps = deleteStepRecursive([...steps]);
    onStepsChange(newSteps);
  };

  // Add a new step
  const addStep = () => {
    const newStepId = `step-${Date.now()}`;
    const newStep: Step = {
      id: newStepId,
      title: "New Step",
      description: "Add description here",
      assignedTo: "executor",
      status: "pending",
      nestLevel: 0,
      phase: "initialization",
      priority: "medium",
      children: [],
    };

    onStepsChange([...steps, newStep]);
  };

  // Add a child step
  const addChildStep = (parentId: string) => {
    const newStepId = `step-${Date.now()}`;
    const parentStep = findStep(steps, parentId);

    if (!parentStep) return;

    const nestLevel = parentStep.nestLevel + 1;

    const newStep: Step = {
      id: newStepId,
      title: "New Sub-Step",
      description: "Add description here",
      assignedTo: parentStep.assignedTo,
      status: "pending",
      nestLevel,
      phase: parentStep.phase,
      priority: parentStep.priority,
      children: [],
    };

    const addChildRecursive = (stepsToUpdate: Step[]): Step[] => {
      return stepsToUpdate.map((step) => {
        if (step.id === parentId) {
          return {
            ...step,
            children: [...step.children, newStep],
          };
        }
        if (step.children && step.children.length > 0) {
          return {
            ...step,
            children: addChildRecursive(step.children),
          };
        }
        return step;
      });
    };

    const newSteps = addChildRecursive([...steps]);
    onStepsChange(newSteps);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, step: Step) => {
    setDraggedStep(step);
    dragNode.current = e.target as HTMLDivElement;
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.classList.add("opacity-50");
      }
    }, 0);
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedStep(null);
    setDraggingOver(null);
    if (dragNode.current) {
      dragNode.current.classList.remove("opacity-50");
    }
    dragNode.current = null;
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetStep: Step) => {
    e.preventDefault();
    if (draggedStep && draggedStep.id !== targetStep.id) {
      setDraggingOver(targetStep.id);
    }
  };

  // Handle drop - move step
  const handleDrop = (e: React.DragEvent, targetStep: Step) => {
    e.preventDefault();
    if (!draggedStep) return;

    // Create a deep copy of steps
    const newSteps = JSON.parse(JSON.stringify(steps)) as Step[];

    // Remove the dragged step from its original position
    const removeStep = (stepsToFilter: Step[]): Step[] => {
      return stepsToFilter.filter((step) => {
        if (step.id === draggedStep.id) {
          return false;
        }
        if (step.children && step.children.length > 0) {
          step.children = removeStep(step.children);
        }
        return true;
      });
    };

    // First remove the dragged step
    const stepsWithoutDragged = removeStep(newSteps);

    // Then insert the dragged step at the new position
    const insertStep = (stepsToUpdate: Step[], target: Step): Step[] => {
      return stepsToUpdate
        .map((step) => {
          if (step.id === target.id) {
            // Check if dropping on the top part to insert before or after
            if ((e.nativeEvent as MouseEvent).offsetY < 10) {
              // Same level as target, insert before
              return [draggedStep, step];
            } else {
              // If it's a parent step and dropping in the middle/bottom part, add as a child
              if (step.nestLevel === draggedStep.nestLevel - 1) {
                return {
                  ...step,
                  children: [...step.children, draggedStep],
                };
              }
              // Otherwise insert after
              return [step, draggedStep];
            }
          }
          if (step.children && step.children.length > 0) {
            const updatedChildren = insertStep(step.children, target);
            return {
              ...step,
              children: Array.isArray(updatedChildren[0])
                ? updatedChildren.flat()
                : updatedChildren,
            };
          }
          return step;
        })
        .flat();
    };

    // Insert the dragged step
    const result = insertStep(stepsWithoutDragged, targetStep);

    onStepsChange(result);
    setDraggingOver(null);
  };

  // Bulk update status for selected steps
  const bulkUpdateStatus = (newStatus: StepStatus) => {
    const updateSelectedStepsRecursive = (stepsToUpdate: Step[]): Step[] => {
      return stepsToUpdate.map((step) => {
        if (selectedSteps.includes(step.id)) {
          return { ...step, status: newStatus };
        }
        if (step.children && step.children.length > 0) {
          return {
            ...step,
            children: updateSelectedStepsRecursive(step.children),
          };
        }
        return step;
      });
    };

    const newSteps = updateSelectedStepsRecursive([...steps]);
    onStepsChange(newSteps);
  };

  // Bulk reassign selected steps
  const bulkReassignSteps = (agent: AgentType) => {
    const reassignSelectedStepsRecursive = (stepsToUpdate: Step[]): Step[] => {
      return stepsToUpdate.map((step) => {
        if (selectedSteps.includes(step.id)) {
          return { ...step, assignedTo: agent };
        }
        if (step.children && step.children.length > 0) {
          return {
            ...step,
            children: reassignSelectedStepsRecursive(step.children),
          };
        }
        return step;
      });
    };

    const newSteps = reassignSelectedStepsRecursive([...steps]);
    onStepsChange(newSteps);
  };

  // Move a step up in the order
  const moveStepUp = (step: Step, index: number, parentArray: Step[]) => {
    if (index <= 0) return;

    const newParentArray = [...parentArray];
    [newParentArray[index], newParentArray[index - 1]] = [
      newParentArray[index - 1],
      newParentArray[index],
    ];

    // Create a deep clone of steps to avoid mutating the props
    const newSteps = JSON.parse(JSON.stringify(steps)) as Step[];

    // If this is a top-level step
    if (parentArray === steps) {
      onStepsChange(newParentArray);
      return;
    }

    // Otherwise, find the parent and update its children
    const parentStep = findParentStep(newSteps, step.id);
    if (parentStep) {
      parentStep.children = newParentArray;
      onStepsChange(newSteps);
    }
  };

  // Move a step down in the order
  const moveStepDown = (step: Step, index: number, parentArray: Step[]) => {
    if (index >= parentArray.length - 1) return;

    const newParentArray = [...parentArray];
    [newParentArray[index], newParentArray[index + 1]] = [
      newParentArray[index + 1],
      newParentArray[index],
    ];

    // Create a deep clone of steps to avoid mutating the props
    const newSteps = JSON.parse(JSON.stringify(steps)) as Step[];

    // If this is a top-level step
    if (parentArray === steps) {
      onStepsChange(newParentArray);
      return;
    }

    // Otherwise, find the parent and update its children
    const parentStep = findParentStep(newSteps, step.id);
    if (parentStep) {
      parentStep.children = newParentArray;
      onStepsChange(newSteps);
    }
  };

  // Toggle phase filter
  const togglePhaseFilter = (phase: StepPhase) => {
    setActivePhaseFilters((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  // Toggle priority filter
  const togglePriorityFilter = (priority: StepPriority) => {
    setActivePriorityFilters((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  // Filter steps by phase, priority, and search query
  const filterSteps = (stepsToFilter: Step[]): Step[] => {
    // If no filters are active, return all steps
    if (
      activePhaseFilters.length === 0 &&
      activePriorityFilters.length === 0 &&
      !searchQuery.trim()
    ) {
      return stepsToFilter;
    }

    const filterStep = (step: Step): boolean => {
      // Check phase filter
      if (activePhaseFilters.length > 0 && step.phase) {
        if (!activePhaseFilters.includes(step.phase)) {
          return false;
        }
      }

      // Check priority filter
      if (activePriorityFilters.length > 0 && step.priority) {
        if (!activePriorityFilters.includes(step.priority)) {
          return false;
        }
      }

      // Check search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          step.title.toLowerCase().includes(query) ||
          step.description?.toLowerCase().includes(query) ||
          false;

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    };

    const processSteps = (steps: Step[]): Step[] => {
      return steps
        .map((step) => {
          // Process children first
          const filteredChildren =
            step.children.length > 0 ? processSteps(step.children) : [];

          // Check if this step passes the filter
          const passesFilter = filterStep(step);

          // If this step passes the filter OR it has children that pass the filter
          if (passesFilter || filteredChildren.length > 0) {
            return {
              ...step,
              children: filteredChildren,
            };
          }

          // This step and none of its children pass the filter
          return null;
        })
        .filter((step): step is Step => step !== null);
    };

    return processSteps(stepsToFilter);
  };

  // Get status indicator icon
  const getStatusIndicator = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <IconCheck size={16} className="text-green-500" />;
      case "in-progress":
        return <IconClock size={16} className="text-blue-500" />;
      case "running":
        return (
          <IconPlayerPlay size={16} className="text-blue-500 animate-spin" />
        );
      case "failed":
        return <IconX size={16} className="text-red-500" />;
      case "warning":
        return <IconAlertTriangle size={16} className="text-yellow-500" />;
      default: // pending
        return <IconClock size={16} className="text-gray-400" />;
    }
  };

  // Get agent type icon
  const getAgentTypeIcon = (agentType: AgentType) => {
    switch (agentType) {
      case "executor":
        return <IconPlayerPlay size={16} className="text-purple-500" />;
      case "fetcher":
        return <IconDatabase size={16} className="text-blue-500" />;
      case "updater":
        return <IconDeviceFloppy size={16} className="text-green-500" />;
      case "sql":
        return <IconCode size={16} className="text-yellow-500" />;
      case "python":
        return <IconCloud size={16} className="text-red-500" />;
      default:
        return <IconDatabaseImport size={16} className="text-gray-500" />;
    }
  };

  // Get phase badge color
  const getPhaseBadgeColor = (phase: StepPhase) => {
    switch (phase) {
      case "initialization":
        return "blue";
      case "data-collection":
        return "indigo";
      case "data-update":
        return "green";
      case "data-processing":
        return "yellow";
      case "finalization":
        return "purple";
      default:
        return "gray";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: StepPriority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  // Render a single step item in detailed view
  const renderDetailedStep = (
    step: Step,
    index: number,
    parentArray: Step[]
  ) => {
    const isExpanded = expandedSteps[step.id] !== false; // Default to expanded
    const hasChildren = step.children && step.children.length > 0;
    const isSelected = selectedSteps.includes(step.id);
    const hasCodeSnippet =
      step.codeSnippet || step.pythonSnippets || step.options;
    const showFullCode = showFullCodeMap[step.id] || false;

    return (
      <div
        key={step.id}
        className={`mb-1 border rounded ${
          draggingOver === step.id
            ? "border-blue-400 bg-blue-50"
            : isSelected
            ? "border-blue-500 bg-blue-50"
            : step.phase === "initialization"
            ? "border-indigo-200"
            : step.phase === "data-collection"
            ? "border-blue-200"
            : step.phase === "data-update"
            ? "border-green-200"
            : "border-gray-200"
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, step)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, step)}
        onDrop={(e) => handleDrop(e, step)}
      >
        {/* Header row with all action icons */}
        <div className="flex items-center p-2 bg-white hover:bg-gray-50">
          {/* Left side icons */}
          <div className="flex items-center space-x-2 mr-4">
            <Checkbox
              checked={isSelected}
              onChange={(e) =>
                toggleSelectStep(step.id, e as unknown as React.MouseEvent)
              }
              onClick={(e) => e.stopPropagation()}
              size="xs"
            />

            <div
              className="cursor-pointer text-gray-500 hover:text-gray-700 flex items-center"
              onClick={() => toggleStepExpanded(step.id)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <IconChevronDown size={16} />
                ) : (
                  <IconChevronRight size={16} />
                )
              ) : (
                <div className="w-4"></div> // Placeholder for alignment
              )}
            </div>

            <div className="flex items-center">
              {getStatusIndicator(step.status)}
            </div>

            <div className="flex items-center">
              {getAgentTypeIcon(step.assignedTo)}
            </div>
          </div>

          {/* Middle section with title/badges */}
          <div className="flex-grow overflow-hidden">
            <div className="flex items-center overflow-hidden">
              <span className="font-medium truncate" title={step.title}>
                {step.title}
              </span>

              <div className="flex-shrink-0 ml-2 flex space-x-1 items-center">
                {step.phase && (
                  <Badge
                    size="xs"
                    color={getPhaseBadgeColor(step.phase)}
                    variant="light"
                  >
                    {step.phase}
                  </Badge>
                )}

                {step.priority && (
                  <Badge
                    size="xs"
                    color={getPriorityBadgeColor(step.priority)}
                    variant="light"
                  >
                    {step.priority}
                  </Badge>
                )}

                {step.skipCondition && (
                  <Badge size="xs" color="yellow" variant="light">
                    Skip
                  </Badge>
                )}

                <Badge size="xs" color="violet" variant="light">
                  {step.assignedTo}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right side action icons */}
          <div className="flex space-x-1 flex-shrink-0 ml-4">
            <Tooltip label="Edit step">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => startEditStep(step)}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Add sub-task">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => addChildStep(step.id)}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Delete step">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => deleteStep(step.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>

            {index > 0 && (
              <Tooltip label="Move up">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => moveStepUp(step, index, parentArray)}
                >
                  <IconArrowUp size={14} />
                </ActionIcon>
              </Tooltip>
            )}

            {index < parentArray.length - 1 && (
              <Tooltip label="Move down">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => moveStepDown(step, index, parentArray)}
                >
                  <IconArrowDown size={14} />
                </ActionIcon>
              </Tooltip>
            )}

            {hasCodeSnippet && (
              <Tooltip label={isExpanded ? "Hide code" : "Show code"}>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => toggleStepExpanded(step.id)}
                >
                  <IconCode size={14} />
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label="More options">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => {
                  /* Additional options */
                }}
              >
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        {/* Edit form */}
        {editingStepId === step.id && (
          <div className="p-2 bg-gray-50 border-t">
            <div className="space-y-2">
              <TextInput
                value={editValues.title || ""}
                onChange={(e) =>
                  setEditValues({ ...editValues, title: e.target.value })
                }
                placeholder="Step title"
                size="xs"
                autoFocus
              />
              <TextInput
                value={editValues.description || ""}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    description: e.target.value,
                  })
                }
                placeholder="Step description"
                size="xs"
              />
              <div className="flex space-x-2">
                <Select
                  value={editValues.assignedTo}
                  onChange={(value) =>
                    setEditValues({
                      ...editValues,
                      assignedTo: value as AgentType,
                    })
                  }
                  data={[
                    { value: "executor", label: "Executor" },
                    { value: "fetcher", label: "Fetcher" },
                    { value: "updater", label: "Updater" },
                    { value: "sql", label: "SQL" },
                    { value: "python", label: "Python" },
                  ]}
                  size="xs"
                />

                <Select
                  value={editValues.status}
                  onChange={(value) =>
                    setEditValues({
                      ...editValues,
                      status: value as StepStatus,
                    })
                  }
                  data={[
                    { value: "pending", label: "Pending" },
                    { value: "in-progress", label: "In Progress" },
                    { value: "running", label: "Running" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                    { value: "warning", label: "Warning" },
                  ]}
                  size="xs"
                />

                <Button
                  size="xs"
                  onClick={saveEditStep}
                  variant="filled"
                  color="blue"
                >
                  Save
                </Button>

                <Button
                  size="xs"
                  onClick={() => {
                    setEditingStepId(null);
                    setEditValues({});
                  }}
                  variant="outline"
                  color="gray"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content section */}
        {isExpanded && editingStepId !== step.id && (
          <div className="p-2 bg-gray-50 border-t">
            {/* Description section */}
            {step.description && (
              <div className="mb-2 text-sm text-gray-700">
                {step.description}
              </div>
            )}

            {/* Data dependencies section */}
            {(step.consumes || step.produces || step.dependencies) && (
              <div className="mb-2 text-xs flex flex-wrap gap-2">
                {step.dependencies && (
                  <div className="inline-flex items-center">
                    <span className="text-gray-500 mr-1">Depends on:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(step.dependencies) ? (
                        step.dependencies.map((dep, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 px-1 rounded text-gray-700"
                          >
                            {dep}
                          </span>
                        ))
                      ) : (
                        <span className="bg-gray-100 px-1 rounded text-gray-700">
                          {step.dependencies}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {step.consumes && (
                  <div className="inline-flex items-center">
                    <span className="text-red-500 mr-1">Inputs:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(step.consumes) ? (
                        step.consumes.map((input, i) => (
                          <span
                            key={i}
                            className="bg-red-50 px-1 rounded text-red-700"
                          >
                            {input}
                          </span>
                        ))
                      ) : (
                        <span className="bg-red-50 px-1 rounded text-red-700">
                          {step.consumes}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {step.produces && (
                  <div className="inline-flex items-center">
                    <span className="text-green-500 mr-1">Outputs:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(step.produces) ? (
                        step.produces.map((output, i) => (
                          <span
                            key={i}
                            className="bg-green-50 px-1 rounded text-green-700"
                          >
                            {output}
                          </span>
                        ))
                      ) : (
                        <span className="bg-green-50 px-1 rounded text-green-700">
                          {step.produces}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Code section */}
            {hasCodeSnippet && (
              <div className="text-xs">
                {step.codeSnippet && (
                  <div className="relative">
                    <div className="text-xs font-semibold text-gray-600 mb-1 flex justify-between items-center">
                      <span>SQL Query:</span>
                      <Button
                        size="xs"
                        variant="subtle"
                        compact
                        onClick={() => toggleFullCode(step.id)}
                      >
                        {showFullCode ? "Show Less" : "Show Full Query"}
                      </Button>
                    </div>
                    <div className="p-2 bg-gray-800 text-gray-100 rounded font-mono whitespace-pre overflow-x-auto max-h-32 overflow-y-auto">
                      {showFullCode
                        ? step.codeSnippet
                        : step.codeSnippet.length > 100
                        ? `${step.codeSnippet.substring(0, 100)}...`
                        : step.codeSnippet}
                    </div>
                  </div>
                )}

                {step.pythonSnippets && step.pythonSnippets.length > 0 && (
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Python Expressions:
                    </div>
                    {step.pythonSnippets.map((snippet, i) => (
                      <div
                        key={i}
                        className="p-2 mt-1 bg-blue-900 text-blue-100 rounded font-mono whitespace-pre overflow-x-auto"
                      >
                        {snippet}
                      </div>
                    ))}
                  </div>
                )}

                {step.skipCondition && (
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Skip Condition:
                    </div>
                    <div className="p-2 bg-yellow-50 text-yellow-800 rounded font-mono whitespace-pre overflow-x-auto border border-yellow-200">
                      {step.skipCondition}
                    </div>
                  </div>
                )}

                {step.options && (
                  <div className="mt-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Options:
                    </div>
                    <div className="p-2 bg-gray-50 text-gray-800 rounded overflow-x-auto border border-gray-200">
                      {Object.entries(step.options).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-semibold mr-2">{key}:</span>
                          <span>
                            {Array.isArray(value)
                              ? value.join(", ")
                              : value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="pl-8 pr-2 pb-2 bg-gray-50">
            {step.children.map((childStep, childIndex) =>
              renderDetailedStep(childStep, childIndex, step.children)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render a single step item in compact view
  const renderCompactStep = (
    step: Step,
    index: number,
    parentArray: Step[]
  ) => {
    const isExpanded = expandedSteps[step.id] !== false; // Default to expanded
    const hasChildren = step.children && step.children.length > 0;
    const isSelected = selectedSteps.includes(step.id);

    return (
      <div
        key={step.id}
        className="border border-gray-200 rounded bg-white mb-1"
      >
        <div className="flex items-center p-2">
          {/* Left section */}
          <div className="flex items-center space-x-2 mr-2">
            <Checkbox
              checked={isSelected}
              onChange={(e) =>
                toggleSelectStep(step.id, e as unknown as React.MouseEvent)
              }
              onClick={(e) => e.stopPropagation()}
              size="xs"
            />
            <div>{getStatusIndicator(step.status)}</div>
            <div>{getAgentTypeIcon(step.assignedTo)}</div>
          </div>

          {/* Middle section */}
          <div className="font-medium truncate flex-grow">{step.title}</div>

          {/* Right section */}
          <div className="flex items-center space-x-1">
            {step.phase && (
              <Badge
                size="xs"
                color={getPhaseBadgeColor(step.phase)}
                variant="light"
              >
                {step.phase.split("-")[0]}
              </Badge>
            )}

            {step.skipCondition && (
              <Badge size="xs" color="yellow" variant="light">
                Skip
              </Badge>
            )}

            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => toggleStepExpanded(step.id)}
            >
              {expandedSteps[step.id] !== false ? (
                <IconChevronDown size={14} />
              ) : (
                <IconChevronRight size={14} />
              )}
            </ActionIcon>

            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => startEditStep(step)}
            >
              <IconEdit size={14} />
            </ActionIcon>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50 border-t border-gray-200 py-1 px-2">
            <div className="pl-4 space-y-1">
              {step.children.map((childStep, childIndex) => (
                <div
                  key={childStep.id}
                  className="flex items-center p-1 rounded hover:bg-gray-100"
                >
                  {/* Left section */}
                  <div className="flex items-center space-x-2 mr-2">
                    <Checkbox
                      checked={selectedSteps.includes(childStep.id)}
                      onChange={(e) =>
                        toggleSelectStep(
                          childStep.id,
                          e as unknown as React.MouseEvent
                        )
                      }
                      onClick={(e) => e.stopPropagation()}
                      size="xs"
                    />
                    <div>{getStatusIndicator(childStep.status)}</div>
                    <div>{getAgentTypeIcon(childStep.assignedTo)}</div>
                  </div>

                  {/* Middle section */}
                  <div className="text-sm truncate flex-grow">
                    {childStep.title}
                  </div>

                  {/* Right section */}
                  <div className="flex items-center space-x-1">
                    {childStep.skipCondition && (
                      <Badge size="xs" color="yellow" variant="light">
                        Skip
                      </Badge>
                    )}

                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={() => startEditStep(childStep)}
                    >
                      <IconEdit size={12} />
                    </ActionIcon>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter steps based on active filters
  const filteredSteps = filterSteps(steps);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-100 p-3 border-b flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          <Checkbox
            checked={selectAll}
            onChange={toggleSelectAll}
            className="mr-2"
            size="sm"
          />
          <h4 className="font-medium">Execution Steps</h4>
          <div className="ml-4 flex space-x-1">
            <Button
              size="xs"
              variant={viewMode === "detailed" ? "filled" : "subtle"}
              onClick={() => setViewMode("detailed")}
              compact
            >
              Detailed
            </Button>
            <Button
              size="xs"
              variant={viewMode === "compact" ? "filled" : "subtle"}
              onClick={() => setViewMode("compact")}
              compact
            >
              Compact
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          {selectedSteps.length > 0 && (
            <div className="flex space-x-2">
              <Select
                placeholder="Change Status"
                value=""
                onChange={(value) =>
                  value && bulkUpdateStatus(value as StepStatus)
                }
                data={[
                  { value: "pending", label: "Pending" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "running", label: "Running" },
                  { value: "completed", label: "Completed" },
                  { value: "failed", label: "Failed" },
                  { value: "warning", label: "Warning" },
                ]}
                size="xs"
                style={{ width: 120 }}
              />

              <Select
                placeholder="Reassign To"
                value=""
                onChange={(value) =>
                  value && bulkReassignSteps(value as AgentType)
                }
                data={[
                  { value: "executor", label: "Executor" },
                  { value: "fetcher", label: "Fetcher" },
                  { value: "updater", label: "Updater" },
                  { value: "sql", label: "SQL" },
                  { value: "python", label: "Python" },
                ]}
                size="xs"
                style={{ width: 120 }}
              />
            </div>
          )}
          <Button
            leftIcon={<IconPlus size={14} />}
            size="xs"
            onClick={addStep}
            variant="outline"
          >
            Add Step
          </Button>
        </div>
      </div>

      {/* Filter and phase tabs */}
      <div className="bg-white border-b p-2 flex flex-wrap items-center gap-2 sticky top-12 z-10">
        <span className="text-xs font-medium text-gray-500">
          Filter by phase:
        </span>
        <Badge
          color="indigo"
          variant={
            activePhaseFilters.includes("initialization") ? "filled" : "light"
          }
          className="cursor-pointer"
          onClick={() => togglePhaseFilter("initialization")}
        >
          Initialization
        </Badge>
        <Badge
          color="blue"
          variant={
            activePhaseFilters.includes("data-collection") ? "filled" : "light"
          }
          className="cursor-pointer"
          onClick={() => togglePhaseFilter("data-collection")}
        >
          Data Collection
        </Badge>
        <Badge
          color="green"
          variant={
            activePhaseFilters.includes("data-update") ? "filled" : "light"
          }
          className="cursor-pointer"
          onClick={() => togglePhaseFilter("data-update")}
        >
          Data Update
        </Badge>

        <span className="ml-4 text-xs font-medium text-gray-500">
          Filter by priority:
        </span>
        <Badge
          color="red"
          variant={activePriorityFilters.includes("high") ? "filled" : "light"}
          className="cursor-pointer"
          onClick={() => togglePriorityFilter("high")}
        >
          High
        </Badge>
        <Badge
          color="yellow"
          variant={
            activePriorityFilters.includes("medium") ? "filled" : "light"
          }
          className="cursor-pointer"
          onClick={() => togglePriorityFilter("medium")}
        >
          Medium
        </Badge>
        <Badge
          color="green"
          variant={activePriorityFilters.includes("low") ? "filled" : "light"}
          className="cursor-pointer"
          onClick={() => togglePriorityFilter("low")}
        >
          Low
        </Badge>

        <TextInput
          placeholder="Search steps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="xs"
          className="ml-auto"
          style={{ width: 200 }}
        />
      </div>

      {/* Steps list */}
      <div className="p-3  max-h-[44vh] overflow-y-auto">
        {filteredSteps.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No steps match the current filters
          </div>
        ) : viewMode === "compact" ? (
          // Compact view for steps
          <div className="space-y-1">
            {filteredSteps.map((step, index) =>
              renderCompactStep(step, index, filteredSteps)
            )}
          </div>
        ) : (
          // Detailed view for steps
          <div>
            {filteredSteps.map((step, index) =>
              renderDetailedStep(step, index, filteredSteps)
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 flex flex-wrap space-x-4">
        <div className="flex items-center">
          <IconCheck size={14} className="text-green-500 mr-1" />
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <IconClock size={14} className="text-blue-500 mr-1" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center">
          <IconPlayerPlay size={14} className="text-blue-500 mr-1" />
          <span>Running</span>
        </div>
        <div className="flex items-center">
          <IconClock size={14} className="text-gray-400 mr-1" />
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <IconX size={14} className="text-red-500 mr-1" />
          <span>Failed</span>
        </div>
        <div className="flex items-center">
          <IconPlayerPlay size={14} className="text-purple-500 mr-1" />
          <span>Executor</span>
        </div>
        <div className="flex items-center">
          <IconDatabase size={14} className="text-blue-500 mr-1" />
          <span>Fetcher</span>
        </div>
        <div className="flex items-center">
          <IconDeviceFloppy size={14} className="text-green-500 mr-1" />
          <span>Updater</span>
        </div>
        <div className="flex items-center">
          <IconCode size={14} className="text-yellow-500 mr-1" />
          <span>SQL</span>
        </div>
        <div className="flex items-center">
          <IconCloud size={14} className="text-red-500 mr-1" />
          <span>Python</span>
        </div>
      </div>

      {/* Tip at the bottom */}
      <div className="p-3 bg-blue-50 text-blue-700 text-sm border-t border-blue-100">
        <strong>Tip:</strong> Drag and drop steps to reorder them. Use the +
        button to add sub-tasks. Click the arrow icon to expand/collapse nested
        steps.
      </div>
    </div>
  );
};

export default ExecutionSteps;
