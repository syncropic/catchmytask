import SessionBar from "@components/SessionBar";
import { Button } from "@mantine/core";
import { useAppStore } from "src/store";

// create simple function component called HeaderSectionToggleAndSearch
type LayoutToggleAndSearchProps = {
  //   toggleDisplay: (position: string) => void;
  // activeLayout?: any;
};

export const LayoutToggleAndSearch: React.FC<
  LayoutToggleAndSearchProps
> = ({}) => {
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
      <Button
        size="xs"
        variant={activeLayout?.leftSection?.isDisplayed ? "filled" : "outline"}
        onClick={() => {
          toggleDisplay("leftSection");
        }}
      >
        left
      </Button>
      <Button
        size="xs"
        variant={
          activeLayout?.centerSection?.isDisplayed ? "filled" : "outline"
        }
        onClick={() => {
          toggleDisplay("centerSection");
        }}
      >
        center
      </Button>
      <Button
        size="xs"
        variant={activeLayout?.rightSection?.isDisplayed ? "filled" : "outline"}
        onClick={() => {
          toggleDisplay("rightSection");
        }}
      >
        right
      </Button>
      {/* <CustomSpotlight /> */}
      <SessionBar
        name={activeApplication?.name}
        heading={activeApplication?.heading}
        subheading={activeApplication?.subheading}
        description={activeApplication?.description}
      />
    </div>
  );
};

export default LayoutToggleAndSearch;
