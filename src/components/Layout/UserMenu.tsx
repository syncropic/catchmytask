import {
  useActiveAuthProvider,
  useGetIdentity,
  useGo,
  useLogout,
  useNavigation,
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
  IconSearch,
  IconSettings,
  IconUserCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import UserButton from "./UserButton";
import { useAppStore } from "src/store";

export const UserMenu = () => {
  const { list } = useNavigation();
  const go = useGo();
  const { mutate: logout } = useLogout();
  const authProvider = useActiveAuthProvider();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const { setIsFloatingWindowOpen, setActiveFloatingWindow } = useAppStore();

  // handle logout
  const handleLogout = () => {
    // deleteToken from localStorage
    localStorage.removeItem("cmt_auth_token");
    logout();
  };
  if (!user) {
    return (
      <Button
        size="xs"
        onClick={() => {
          go({
            to: "/login",
            type: "push",
          });
        }}
      >
        Sign In
      </Button>
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
          {user.email === "david.wanjala@snowstormtech.com" && (
            <>
              <Menu.Label>Quick Access</Menu.Label>
              {/* navigate to connections view */}
              <Menu.Item
                leftSection={<IconComponents size={14} />}
                onClick={() => handleFloatingWindowMenuSelection("connections")}
              >
                Connections
              </Menu.Item>
              <Menu.Item
                leftSection={<IconMail size={14} />}
                onClick={() => handleFloatingWindowMenuSelection("messages")}
              >
                Messages
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => handleFloatingWindowMenuSelection("automations")}
              >
                Automations
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFiles size={14} />}
                onClick={() =>
                  handleFloatingWindowMenuSelection("file_browser")
                }
              >
                File Browser
              </Menu.Item>
              <Menu.Item
                leftSection={<IconClipboard size={14} />}
                onClick={() => handleFloatingWindowMenuSelection("scratchpad")}
              >
                Scratchpad
              </Menu.Item>
              <Menu.Item
                leftSection={<IconListCheck size={14} />}
                onClick={() =>
                  handleFloatingWindowMenuSelection("execution_trace")
                }
              >
                Execution Trace
              </Menu.Item>
              <Menu.Item
                leftSection={<IconUserPlus size={14} />}
                onClick={() =>
                  handleFloatingWindowMenuSelection("recommendations")
                }
              >
                Recommendations
              </Menu.Item>
              {/* <Menu.Item
                leftSection={<IconApps size={14} />}
                onClick={() => list("applications")}
              >
                Applications
              </Menu.Item> */}
              {/* <Menu.Item
                leftSection={<IconDatabase size={14} />}
                onClick={() => list("datasets")}
              >
                Datasets
              </Menu.Item> */}
              {/* <Menu.Item
                leftSection={<IconComponents size={14} />}
                onClick={() => list("sessions")}
              >
                Sessions
              </Menu.Item> */}
              {/* <Menu.Item
                leftSection={<IconSearch size={14} />}
              >
                Spotlight
              </Menu.Item> */}
            </>
          )}

          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            leftSection={<IconUserCircle size={14} />}
            onClick={() => list("profile")}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLogout size={14} />}
            onClick={() => handleLogout()}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default UserMenu;
