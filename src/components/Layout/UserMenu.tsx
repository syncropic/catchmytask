import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useNavigation,
} from "@refinedev/core";
import { IIdentity } from "@components/interfaces";
import { Group, Menu } from "@mantine/core";
import {
  IconApps,
  IconComponents,
  IconDatabase,
  IconLogout,
  IconMail,
  IconSearch,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
import UserButton from "./UserButton";

export const UserMenu = () => {
  const { list } = useNavigation();
  const { mutate: logout } = useLogout();
  const authProvider = useActiveAuthProvider();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  // handle logout
  const handleLogout = () => {
    // deleteToken from localStorage
    localStorage.removeItem("cmt_auth_token");
    logout();
  };
  if (!user) {
    return (
      <button
        // onClick={() => signIn()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <a href="/login">Sign In</a>
      </button>
    );
  }
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
                // onClick={() => list("sessions")}
              >
                Connections
              </Menu.Item>
              <Menu.Item
                leftSection={<IconMail size={14} />}
                // onClick={() => list("sessions")}
              >
                Messages
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                // onClick={() => list("sessions")}
              >
                Automations
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
