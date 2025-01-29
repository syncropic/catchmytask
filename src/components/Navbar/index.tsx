import {
  IconBulb,
  IconCheckbox,
  IconSearch,
  IconUser,
  IconHttpGet,
  IconMoon,
  IconBrightnessUp,
  IconMenu2,
  IconLogout,
  IconClick,
} from "@tabler/icons-react";
import { UnstyledButton, useMantineColorScheme } from "@mantine/core";
import classes from "./NavbarSearch.module.css";
import { useState } from "react";
import { useAppStore } from "src/store";
import { useActiveAuthProvider, useGetIdentity } from "@refinedev/core";
import { handleLogout } from "@components/Utils/auth";
import { useParsed } from "@refinedev/core";

export default function NavbarSearch() {
  const authProvider = useActiveAuthProvider();
  const { resource, action, id, pathname, params } = useParsed();
  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const [opened, setOpened] = useState(false);
  const {
    showRequestResponseView,
    setShowRequestResponseView,
    colorScheme,
    setColorScheme,
    activeLayout,
    setActiveLayout,
    open_new_items_in_window,
    setOpenNewItemsInWindow,
    setNavigationHistory,
  } = useAppStore();

  const { setColorScheme: setColorSchemeMantine } = useMantineColorScheme();

  // Toggle functions
  const toggleShowRequestResponseView = () => {
    setShowRequestResponseView(!showRequestResponseView);
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme.scheme === "light" ? "dark" : "light";
    setColorScheme({ scheme: newScheme });
    setColorSchemeMantine(newScheme);
  };

  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = !newLayout[section].isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  const toggleOpenItemsInWindow = () => {
    let set_to_view = open_new_items_in_window == "current" ? "new" : "current";
    setOpenNewItemsInWindow(set_to_view);
  };

  const handleLogoutClick = async () => {
    setNavigationHistory({
      pathname: pathname,
      params: params,
    });
    await handleLogout();
  };

  const links = [
    {
      icon: IconHttpGet,
      label: "Toggle Request Response",
      onClick: toggleShowRequestResponseView,
      active: showRequestResponseView,
    },
    {
      icon: colorScheme.scheme === "light" ? IconMoon : IconBrightnessUp,
      label: colorScheme.scheme === "light" ? "Dark Mode" : "Light Mode",
      onClick: toggleColorScheme,
    },
    {
      icon: IconClick,
      label: "Quick Actions Bar",
      onClick: () => toggleDisplay("quickActionsBar"),
      active: activeLayout?.quickActionsBar?.isDisplayed,
      showOnMobile: true,
      className: "block lg:hidden", // Added Tailwind responsive class
    },
    {
      icon: IconMenu2,
      label: "Open Items In New Window",
      onClick: toggleOpenItemsInWindow,
      active: open_new_items_in_window !== "current",
    },
    {
      icon: IconLogout,
      label: "Logout",
      onClick: handleLogoutClick,
    },
  ];

  const mainLinks = links.map((link) => (
    <UnstyledButton
      key={link.label}
      className={`
        flex items-center w-full px-3 py-2 text-sm rounded-sm
        ${link.className || ""} 
        ${link.active ? "text-blue-500" : "text-gray-700 dark:text-gray-200"}
        hover:bg-gray-100 dark:hover:bg-dark-6
        transition-colors duration-150
      `}
      onClick={link.onClick}
    >
      <link.icon size={14} className="mr-2" stroke={1.5} />
      <span>{link.label}</span>
    </UnstyledButton>
  ));

  return (
    <nav className="flex flex-col w-full bg-white dark:bg-dark-7">
      <div className="py-2">
        <div className="flex flex-col space-y-1">{mainLinks}</div>
      </div>
    </nav>
  );
}
