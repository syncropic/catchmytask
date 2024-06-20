// floating draggable, expandable, open in new window, closable window
import { Badge, Button, Popover, TextInput, Text, Affix } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useClickOutside } from "@mantine/hooks";
import { IconEdit, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useAppStore } from "src/store";
import { QueryDataType } from "@components/interfaces";
import Scratchpad from "@components/Scratchpad";
import FileBrowser from "@components/FileBrowser";
import { ScrollArea } from "@mantine/core";

export const FloatingWindow = () => {
  const {
    isFloatingWindowOpen,
    setIsFloatingWindowOpen,
    activeFloatingWindow,
  } = useAppStore();
  const queryClient = useQueryClient();

  // const viewData = queryClient.getQueryData<QueryDataType>([
  //   `useFetchViewByName_${activeResultsSection?.name}`,
  // ]);

  // console.log("viewData", viewData);

  // // const ref = useClickOutside(() => setIsActionsSelectionOpen(false));
  // const { x, y } = activeMouseCoordinates;
  // const [searchTerm, setSearchTerm] = useState("");

  // const actions = [
  //   { icon: <IconPlus size={10} />, label: "Create" },
  //   { icon: <IconEdit size={10} />, label: "Edit" },
  //   { icon: <IconTrash size={10} />, label: "Delete" },
  //   // { icon: <FaceIcon className="mr-2 h-4 w-4" />, label: "Search Emoji" },
  //   // { icon: <RocketIcon className="mr-2 h-4 w-4" />, label: "Launch" },
  //   // { icon: <PersonIcon className="mr-2 h-4 w-4" />, label: "Profile" },
  //   // { icon: <EnvelopeClosedIcon className="mr-2 h-4 w-4" />, label: "Mail" },
  //   // { icon: <GearIcon className="mr-2 h-4 w-4" />, label: "Settings" },
  // ];

  // const filteredActions = actions.filter((action) =>
  //   action.label.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // //handle toggleDisplay
  // const activateSection = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };

  // const handleSelectAction = (action: any) => {
  //   // console.log(`Clicked on ${action.label}`);
  //   // setIsActionsSelectionOpen(false);
  //   // setActiveAction(action);
  //   setActiveAction({ name: action.label });
  //   activateSection("rightSection");
  //   // close the popover
  //   setIsActionsSelectionOpen(false);
  // };
  return (
    <div>
      <Popover
        opened={isFloatingWindowOpen}
        width={800}
        // width="target"
        // height={500}
        // position="bottom"
        // position={{ top: y, left: x }}
        // onClose={() => setIsActionsSelectionOpen(false)}
      >
        <Popover.Target>
          <Affix
            position={{ bottom: 20, left: "50%" }}
            style={{ transform: "translateX(-50%)" }}
          >
            <div onClick={() => setIsFloatingWindowOpen(false)} />
          </Affix>
        </Popover.Target>
        <Popover.Dropdown>
          <ScrollArea h={400}>
            <Button onClick={() => setIsFloatingWindowOpen(false)}>
              Close
            </Button>
            <div className="mb-4 h-[400px]">
              {activeFloatingWindow?.name === "scratchpad" && <Scratchpad />}
              {activeFloatingWindow?.name === "file_browser" && <FileBrowser />}
            </div>
          </ScrollArea>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default FloatingWindow;
