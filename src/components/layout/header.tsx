import React from "react";
import {
  useGetIdentity,
  useActiveAuthProvider,
  pickNotDeprecated,
} from "@refinedev/core";
import { HamburgerMenu } from "./hamburgerMenu";
import {
  Avatar,
  Button,
  Flex,
  Header as MantineHeader,
  Sx,
  Title,
  useMantineTheme,
} from "@mantine/core";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/mantine";
import { useAppStore } from "src/store";

export const ThemedHeaderV2: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  isSticky,
  sticky,
}) => {
  const { activeLayout, setActiveLayout } = useAppStore();

  const theme = useMantineTheme();

  const authProvider = useActiveAuthProvider();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const borderColor =
    theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2];

  let stickyStyles: Sx = {};
  if (pickNotDeprecated(sticky, isSticky)) {
    stickyStyles = {
      position: `sticky`,
      top: 0,
      zIndex: 1,
    };
  }
  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  return (
    <MantineHeader
      zIndex={199}
      height={64}
      py={6}
      px="sm"
      sx={{
        borderBottom: `1px solid ${borderColor}`,
        ...stickyStyles,
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        sx={{
          height: "100%",
        }}
      >
        {/* <HamburgerMenu /> */}
        <div>{null}</div>
        <div className="flex gap-4">
          <Button
            size="xs"
            variant={
              activeLayout?.leftSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => toggleDisplay("leftSection")}
          >
            left
          </Button>
          <Button
            size="xs"
            variant={
              activeLayout?.centerSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => toggleDisplay("centerSection")}
          >
            center
          </Button>
          <Button
            size="xs"
            variant={
              activeLayout?.rightSection?.isDisplayed ? "filled" : "outline"
            }
            onClick={() => toggleDisplay("rightSection")}
          >
            right
          </Button>
        </div>
        <Flex align="center" gap="sm">
          {user?.name && (
            <Title order={6} data-testid="header-user-name">
              {user?.name}
            </Title>
          )}
          {user?.avatar && (
            <Avatar src={user?.avatar} alt={user?.name} radius="xl" />
          )}
        </Flex>
      </Flex>
    </MantineHeader>
  );
};
