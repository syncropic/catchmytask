import { Badge, Button, Popover, TextInput, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useClickOutside } from "@mantine/hooks";
import { IconEdit, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useAppStore } from "src/store";
import { QueryDataType } from "@components/interfaces";

export const SelectAction = () => {
  const {
    isActionsSelectionOpen,
    setIsActionsSelectionOpen,
    activeMouseCoordinates,
    activeLayout,
    setActiveLayout,
    activeResultsSection,
    // activeAction,
    setActiveAction,
  } = useAppStore();
  const queryClient = useQueryClient();

  const viewData = queryClient.getQueryData<QueryDataType>([
    `useFetchViewByName_${activeResultsSection?.name}`,
  ]);

  console.log("viewData", viewData);

  // const ref = useClickOutside(() => setIsActionsSelectionOpen(false));
  const { x, y } = activeMouseCoordinates;
  const [searchTerm, setSearchTerm] = useState("");

  const actions = [
    { icon: <IconPlus size={10} />, label: "Create" },
    { icon: <IconEdit size={10} />, label: "Edit" },
    { icon: <IconTrash size={10} />, label: "Delete" },
    // { icon: <FaceIcon className="mr-2 h-4 w-4" />, label: "Search Emoji" },
    // { icon: <RocketIcon className="mr-2 h-4 w-4" />, label: "Launch" },
    // { icon: <PersonIcon className="mr-2 h-4 w-4" />, label: "Profile" },
    // { icon: <EnvelopeClosedIcon className="mr-2 h-4 w-4" />, label: "Mail" },
    // { icon: <GearIcon className="mr-2 h-4 w-4" />, label: "Settings" },
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //handle toggleDisplay
  const activateSection = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

  const handleSelectAction = (action: any) => {
    // console.log(`Clicked on ${action.label}`);
    // setIsActionsSelectionOpen(false);
    // setActiveAction(action);
    setActiveAction({ name: action.label });
    activateSection("rightSection");
    // close the popover
    setIsActionsSelectionOpen(false);
  };
  return (
    <div>
      <Popover
        opened={isActionsSelectionOpen}
        // position={{ top: y, left: x }}
        onClose={() => setIsActionsSelectionOpen(false)}
      >
        <Popover.Target>
          <div style={{ position: "absolute", top: y, left: x, zIndex: -1 }} />
        </Popover.Target>
        <Popover.Dropdown>
          {/* searchable list of actions. at the top a search bar and below a list
          of actions */}
          <div className="mb-4">
            <TextInput
              type="text"
              placeholder="Search actions..."
              size="xs"
              // className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredActions.map((action, index) => (
              <Button
                key={index}
                // className="flex items-center"
                size="compact"
                variant="outline"
                onClick={() => handleSelectAction(action)}
                // onClick={() => console.log(`Clicked on ${action.label}`)}
                leftIcon={action.icon}
              >
                <Text size="xs" color="gray">
                  {action.label}
                </Text>
              </Button>
            ))}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default SelectAction;
