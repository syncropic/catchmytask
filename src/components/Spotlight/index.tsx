import { Button, Group, TextInput, rem } from "@mantine/core";
import { SpotlightProvider, spotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import { useGo } from "@refinedev/core";
import {
  IconHome,
  IconDashboard,
  IconFileText,
  IconSearch,
  IconSquareLetterS,
  IconMusic,
  IconUserCircle,
  IconRobotFace,
} from "@tabler/icons-react";

function SpotlightControl() {
  return (
    <Group position="center">
      <TextInput
        placeholder="Search..."
        size="xs"
        // onClick={spotlight.open}
        onChange={() => spotlight.open()}
        icon={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
      />
    </Group>
  );
}

const actions = [
  {
    title: "Home",
    description: "Get to home page",
    path: "/home",
    icon: <IconHome size="1.2rem" />,
  },
  {
    title: "Stormy",
    description: "Launch Stormy application",
    path: "/applications/show/applications:⟨018e21b1-0bfe-7048-ab46-2b39f5f8091c⟩",
    icon: <IconRobotFace size="1.2rem" />,
  },
  // {
  //   title: "Catchmyvibe",
  //   description: "Launch Catchmyvibe application",
  //   path: "/applications/show/applications:⟨018e21b0-b84c-7538-a56c-07d3d08c8e7f⟩",
  //   icon: <IconMusic size="1.2rem" />,
  // },
  // {
  //   title: "Personal Assistant",
  //   description: "Launch Personal Assistant application",
  //   path: "/applications/show/applications:⟨26b56be2-7d8b-4099-b4be-d895d51f6aa8⟩",
  //   icon: <IconUserCircle size="1.2rem" />,
  // },
];

export function CustomSpotlight() {
  const go = useGo();
  const enhancedActions: SpotlightAction[] = actions.map((action) => {
    const enhancedAction = {
      ...action,
      onTrigger: () =>
        go({
          to: action.path,
          type: "push",
        }),
    };
    return enhancedAction;
  });

  return (
    <SpotlightProvider
      actions={enhancedActions}
      searchIcon={<IconSearch size="1.2rem" />}
      searchPlaceholder="Search..."
      shortcut="mod + shift + 1"
      nothingFoundMessage="Nothing found..."
    >
      <SpotlightControl />
    </SpotlightProvider>
  );
}

export default CustomSpotlight;
