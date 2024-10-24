import {
  useActiveAuthProvider,
  useGetIdentity,
  useGo,
  useLogout,
  useNavigation,
  useParsed,
} from "@refinedev/core";
import { IIdentity } from "@components/interfaces";
import { Button, Group, Menu } from "@mantine/core";
import {
  IconApps,
  IconClipboard,
  IconComponents,
  IconDatabase,
  IconFiles,
  IconListCheck,
  IconLogout,
  IconMail,
  IconPuzzle,
  IconSearch,
  IconSettings,
  IconUserCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import UserButton from "./UserButton";
import { useAppStore } from "src/store";
import { signIn } from "next-auth/react";
// import MonacoEditor from "@components/MonacoEditor";

export const UserMenu = () => {
  const { list } = useNavigation();
  const go = useGo();
  const { mutate: logout } = useLogout();
  const authProvider = useActiveAuthProvider();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const { setIsFloatingWindowOpen, setActiveFloatingWindow, setNavigationHistory } = useAppStore();
  const { resource, action, id, pathname, params } = useParsed();

  // handle logout
  const handleLogout = () => {
    // get the current full url
    setNavigationHistory(
      {
        pathname: pathname,
        params: params
      }
    )
    logout();
  };
  if (!user) {
    return (
      <div className="pr-3">
        <Button
          size="xs"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
          variant="gradient"
          // fullWidth
          onClick={() => signIn("keycloak")}
        >
          Sign In
        </Button>
      </div>
    );
  }

  const handleFloatingWindowMenuSelection = (section: string) => {
    setActiveFloatingWindow({ name: section });
    setIsFloatingWindowOpen(true);
  };
  return (
    <Group align="center">
      <Menu withArrow withinPortal>
        <Menu.Target>
          <UserButton
            image=""
            // image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name={user?.name}
            email={user?.email}
          />
          {/* <div>userbutton</div> */}
        </Menu.Target>
        {/* ...Menu.Items */}
        <Menu.Dropdown>
          {/* <Menu.Label>Profile</Menu.Label> */}
          <Menu.Item leftSection={<IconUserCircle size={14} />} disabled>
            Switch Profile
          </Menu.Item>
          {/* <Menu.Item
            leftSection={<IconPuzzle size={14} />}
          >
            Resources
          </Menu.Item> */}

          {/* <Menu.Label>Account</Menu.Label> */}
          {/* <Menu.Item
            leftSection={<IconSettings size={14} />}
          >
            Settings
          </Menu.Item> */}
          <Menu.Item leftSection={<IconSettings size={14} />} disabled>
            Manage Account
          </Menu.Item>
          <Menu.Item leftSection={<IconMail size={14} />} disabled>
            Inbox
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLogout size={14} />}
            onClick={() => handleLogout()}
          >
            Logout
          </Menu.Item>
          {/* <MonacoEditor
            value={{
              user: user,
            }}
            language="json"
            height="75vh"
          /> */}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default UserMenu;
