import React from "react";
import {
  useGetIdentity,
  useActiveAuthProvider,
  pickNotDeprecated,
  useNavigation,
  useLogout,
  useGo,
} from "@refinedev/core";
import { HamburgerMenu } from "./hamburgerMenu";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Flex,
  Header as MantineHeader,
  Sx,
  TextInput,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { forwardRef } from "react";
import {
  IconApps,
  IconChevronRight,
  IconComponents,
  IconDatabase,
  IconLogout,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { Group, Text, Menu, UnstyledButton } from "@mantine/core";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/mantine";
import { useAppStore } from "src/store";
import { IIdentity } from "@components/interfaces";
import { CustomSpotlight } from "@components/Spotlight";
import Link from "next/link";

export const ThemedHeaderV2: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  isSticky,
  sticky,
}) => {
  const { activeLayout, setActiveLayout } = useAppStore();
  const go = useGo();
  const { activeApplication } = useAppStore();

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
        {/* <div>{null}</div> */}
        <div className="flex items-center">
          {/* <ActionIcon>
            <IconComponents
              style={{ width: "70%", height: "70%" }}
              stroke={1.5}
              // color="blue"
              gradientTransform="rotate(90)"
              onClick={() => {
                go({
                  to: "/home",
                  type: "push",
                });
              }}
            />
          </ActionIcon> */}

          <Anchor
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            fw={500}
            fz="lg"
            component={Link}
            href="/home"
          >
            {activeApplication?.name}
          </Anchor>
        </div>
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
          <CustomSpotlight />
        </div>
        <Flex align="center" gap="sm">
          {/* {user?.name && (
            <Title order={6} data-testid="header-user-name">
              {user?.name}
            </Title>
          )}
          {user?.avatar && (
            <Avatar src={user?.avatar} alt={user?.name} radius="xl" />
          )} */}
          <UserMenu user={user} />
        </Flex>
      </Flex>
    </MantineHeader>
  );
};

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name: string;
  email: string;
  icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
      {...others}
    >
      <Group>
        <Avatar src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {name}
          </Text>

          <Text color="dimmed" size="xs">
            {email}
          </Text>
        </div>

        {icon || <IconChevronRight size="1rem" />}
      </Group>
    </UnstyledButton>
  )
);

const UserMenu: React.FC<{ user: IIdentity }> = ({ user }) => {
  const { list } = useNavigation();
  const { mutate: logout } = useLogout();
  // handle logout
  const handleLogout = () => {
    // deleteToken from localStorage
    localStorage.removeItem("cmt_auth_token");
    logout();
  };
  return (
    <Group position="center">
      <Menu withArrow withinPortal>
        <Menu.Target>
          <UserButton
            image=""
            // image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name={user?.name}
            email={user?.email}
          />
        </Menu.Target>
        {/* ...Menu.Items */}
        <Menu.Dropdown>
          {user.email === "david.wanjala@snowstormtech.com" && (
            <>
              <Menu.Label>Store</Menu.Label>
              <Menu.Item
                icon={<IconApps size={14} />}
                onClick={() => list("applications")}
              >
                Applications
              </Menu.Item>
              <Menu.Item
                icon={<IconDatabase size={14} />}
                onClick={() => list("datasets")}
              >
                Datasets
              </Menu.Item>
              <Menu.Item
                icon={<IconComponents size={14} />}
                onClick={() => list("sessions")}
              >
                Sessions
              </Menu.Item>
              <Menu.Item
                icon={<IconSearch size={14} />}
                // onClick={() => list("sessions")}
              >
                Spotlight
              </Menu.Item>
            </>
          )}

          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            icon={<IconSettings size={14} />}
            onClick={() => list("profile")}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            icon={<IconLogout size={14} />}
            onClick={() => handleLogout()}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
