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
  IconAdjustmentsHorizontal,
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
  IconUser,
  IconUserCircle,
  IconUserPlus,
  IconUserScan,
} from "@tabler/icons-react";
import UserButton from "./UserButton";
import { useAppStore } from "src/store";
import { signIn } from "next-auth/react";
import SearchInput from "@components/SearchInput";
import { useState } from "react";
import { useClickOutside } from "@mantine/hooks";
// import MonacoEditor from "@components/MonacoEditor";

export const UserMenu = () => {
  const { list } = useNavigation();
  const go = useGo();
  const { mutate: logout } = useLogout();
  const authProvider = useActiveAuthProvider();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  const {
    setIsFloatingWindowOpen,
    setActiveFloatingWindow,
    setNavigationHistory,
    setActiveProfile,
    activeProfile,
  } = useAppStore();
  const { resource, action, id, pathname, params } = useParsed();
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => {
    return setOpened(false);
  });

  // handle logout
  const handleLogout = () => {
    // get the current full url
    setNavigationHistory({
      pathname: pathname,
      params: params,
    });
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
  const handleEdit = (item: any) => {
    console.log("Edit", item);
    go({
      to: {
        resource: item?.entity_type,
        action: "edit",
        id: item?.id,
        // meta: navigationHistory?.params,
      },
      // query: navigationHistory?.params,
      type: "push",
    });
    setOpened(!opened);
  };
  const handleMenuNavigate = (item: any) => {
    // console.log("Edit", item);
    go({
      to: {
        resource: item?.entity_type,
        action: item?.action_type,
        id: item?.id,
        // meta: navigationHistory?.params,
      },
      // query: navigationHistory?.params,
      type: "push",
    });
    setOpened(!opened);
  };

  return (
    <Group align="center">
      <Menu withArrow withinPortal opened={opened}>
        <Menu.Target>
          <UserButton
            image=""
            // image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name={user?.name}
            email={activeProfile?.name || user?.email}
            onClick={() => setOpened(!opened)}
            opened={opened}
          />
          {/* <div>userbutton</div> */}
        </Menu.Target>
        {/* ...Menu.Items */}
        <Menu.Dropdown>
          {/* <Menu.Label>Profile</Menu.Label> */}
          {/* <Menu.Item leftSection={<IconUserCircle size={14} />}>
            <div>
              <SearchInput
                placeholder="profiles"
                description="profiles"
                handleOptionSubmit={setActiveProfile}
                value={activeProfile?.id || ""}
                // include_action_icons={activeAgent?.id ? ["filter"] : []}
                // navigateOnSelect={{ resource: "views" }}
                // navigateOnClear={{ resource: "home" }}
                activeFilters={[
                  {
                    id: 1,
                    name: "profiles",
                    description: "profiles",
                    entity_type: "profiles",
                    is_selected: true,
                  },
                ]}
              />
            </div>
          </Menu.Item> */}
          {/* <div onClick={(e) => e.stopPropagation()}>
            <Menu.Item
              component={SearchInput}
              placeholder="profiles"
              description="profiles"
              handleOptionSubmit={setActiveProfile}
              value={activeProfile?.id || ""}
              withinPortal={true}
              // include_action_icons={activeAgent?.id ? ["filter"] : []}
              // navigateOnSelect={{ resource: "views" }}
              // navigateOnClear={{ resource: "home" }}
              activeFilters={[
                {
                  id: 1,
                  name: "profiles",
                  description: "profiles",
                  entity_type: "profiles",
                  is_selected: true,
                },
              ]}
            ></Menu.Item>
          </div> */}

          <Menu.Item leftSection={<IconUser size={14} />}>
            <div onClick={(e) => e.stopPropagation()}>
              <SearchInput
                placeholder="profiles"
                description="profiles"
                handleOptionSubmit={setActiveProfile}
                value={activeProfile?.id || ""}
                withinPortal={true}
                ref={ref}
                include_action_icons={["record_info", "explore"]}
                handleEdit={handleEdit}
                record={activeProfile}
                query_name="fetch profiles"
                // navigateOnSelect={{ resource: "views" }}
                // navigateOnClear={{ resource: "home" }}
                activeFilters={[
                  {
                    id: 1,
                    name: "profiles",
                    description: "profiles",
                    entity_type: "profiles",
                    is_selected: true,
                  },
                ]}
              ></SearchInput>
            </div>
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
          <Menu.Item
            leftSection={<IconUserScan size={14} />}
            disabled
            // onClick={() =>
            //   handleMenuNavigate({
            //     entity_type: "account",
            //     action_type: "edit",
            //     id: user?.email,
            //   })
            // }
          >
            Manage Account
          </Menu.Item>
          <Menu.Item
            leftSection={<IconAdjustmentsHorizontal size={14} />}
            disabled
            // onClick={() =>
            //   handleMenuNavigate({
            //     entity_type: "settings",
            //     action_type: "edit",
            //     id: user?.email,
            //   })
            // }
          >
            Settings
          </Menu.Item>
          {/* <Menu.Item
            leftSection={<IconMail size={14} />}
            onClick={() =>
              handleMenuNavigate({
                entity_type: "tasks",
                action_type: "list",
                id: user?.email,
              })
            }
          >
            Tasks
          </Menu.Item> */}
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
