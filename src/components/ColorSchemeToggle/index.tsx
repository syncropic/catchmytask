import React from "react";
import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconBrightnessUp, IconMoon } from "@tabler/icons-react";
import { useAppStore } from "src/store";

type ColorSchemeProps = {};

export const ColorSchemeToggle: React.FC<ColorSchemeProps> = ({}) => {
  const { colorScheme, setColorScheme } = useAppStore();
  const { setColorScheme: setColorSchemeMantine } = useMantineColorScheme();

  // handle toggleDisplay
  const toggleColorScheme = () => {
    const newScheme = colorScheme.scheme === "light" ? "dark" : "light";

    // Update global state
    setColorScheme({ scheme: newScheme });

    // Update Mantine's color scheme
    setColorSchemeMantine(newScheme);
  };

  return (
    <div className="flex items-center pl-4 pr-4">
      <div>
        <Tooltip
          label={`Switch to ${
            colorScheme.scheme === "light" ? "dark" : "light"
          } mode`}
          position="top"
        >
          <ActionIcon
            size="sm"
            variant={colorScheme.scheme === "light" ? "outline" : "filled"}
            onClick={toggleColorScheme}
          >
            {colorScheme.scheme === "light" ? (
              <IconMoon size={20} /> // Use IconMoon for light mode
            ) : (
              <IconBrightnessUp size={20} /> // Use IconBrightnessUp for dark mode
            )}
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};

export default ColorSchemeToggle;
