import SessionBar from "@components/SessionBar";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutDistributeVertical,
  IconMenu2,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

// create simple function component called HeaderSectionToggleAndSearch
type LayoutToggleAndSearchProps = {
  //   toggleDisplay: (position: string) => void;
  // activeLayout?: any;
};

export const LayoutToggle: React.FC<LayoutToggleAndSearchProps> = ({}) => {
  const { activeLayout, setActiveLayout } = useAppStore();

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };
  return (
    <div className="flex items-center gap-4">
      <div>
        <Tooltip label="Toggle left pane" position="top">
          <ActionIcon
            // size="compact-xs"
            size="sm"
            variant={
              activeLayout?.leftSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => {
              toggleDisplay("leftSection");
            }}
          >
            {/* left */}
            <IconLayoutSidebarLeftCollapseFilled />
          </ActionIcon>
        </Tooltip>
      </div>
      <div>
        <Tooltip label="Toggle center pane" position="top">
          <ActionIcon
            // size="compact-xs"
            size="sm"
            variant={
              activeLayout?.centerSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => {
              toggleDisplay("centerSection");
            }}
          >
            {/* center */}
            <IconLayoutDistributeVertical />
          </ActionIcon>
        </Tooltip>
      </div>
      <div>
        <Tooltip label="Toggle right pane" position="top">
          <ActionIcon
            // size="compact-xs"
            size="sm"
            variant={
              activeLayout?.rightSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => {
              toggleDisplay("rightSection");
            }}
          >
            {/* right */}
            <IconLayoutSidebarRightCollapseFilled />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className="block lg:hidden w-full max-w-2xl">
        <Tooltip label="Toggle quick actions" position="top">
          <ActionIcon
            size="sm"
            variant={
              activeLayout?.quickActionsBar?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => {
              toggleDisplay("quickActionsBar");
            }}
          >
            {/* right */}
            <IconMenu2 />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};

export default LayoutToggle;
