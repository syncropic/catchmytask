import SessionBar from "@components/SessionBar";
import { ActionIcon, Button } from "@mantine/core";
// import { useIsAuthenticated } from "@refinedev/core";
import {
  IconBoxAlignLeftFilled,
  IconBoxAlignRightFilled,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutDistributeVertical,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

// create simple function component called HeaderSectionToggleAndSearch
type LayoutToggleAndSearchProps = {
  //   toggleDisplay: (position: string) => void;
  // activeLayout?: any;
};

export const LayoutToggle: React.FC<LayoutToggleAndSearchProps> = ({}) => {
  const { activeLayout, activeApplication, setActiveLayout } = useAppStore();

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
      <ActionIcon
        size="compact-xs"
        variant={activeLayout?.leftSection?.isDisplayed ? "filled" : "outline"}
        onClick={() => {
          toggleDisplay("leftSection");
        }}
      >
        {/* left */}
        <IconLayoutSidebarLeftCollapseFilled />
      </ActionIcon>
      <ActionIcon
        size="compact-xs"
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
      <ActionIcon
        size="compact-xs"
        variant={activeLayout?.rightSection?.isDisplayed ? "filled" : "outline"}
        onClick={() => {
          toggleDisplay("rightSection");
        }}
      >
        {/* right */}
        <IconLayoutSidebarRightCollapseFilled />
      </ActionIcon>
      {/* <CustomSpotlight /> */}
    </div>
  );
};

export default LayoutToggle;
