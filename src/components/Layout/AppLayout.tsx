import {
  AppShell,
  Burger,
  Group,
  UnstyledButton,
  Anchor,
  Button,
  Menu,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import classes from "./MobileNavbar.module.css";
import { useAppStore } from "src/store";
import UserMenu from "./UserMenu";
import { useGo, useIsAuthenticated } from "@refinedev/core";
import Footer from "@components/Footer";
import Header from "@components/Header";
import LayoutToggle from "./LayoutToggle";
import { useIsMobile } from "@components/Utils";
import { IconHttpGet, IconIconsOff, IconMail } from "@tabler/icons-react";
import InputModeToggle from "./InputModeToggle";
// export default AppLayout;
export function AppLayout({
  children,
  authenticatedData,
}: {
  children: React.ReactNode;
  authenticatedData: any;
}) {
  const [opened, { toggle }] = useDisclosure();
  const {
    activeLayout,
    views,
    showRequestResponseView,
    setShowRequestResponseView,
    activeProfile,
    clearViews,
    setMonitorComponents,
  } = useAppStore();
  const go = useGo();
  const isMobile = useIsMobile(); // Custom hook to check if the screen is mobile
  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    setShowRequestResponseView(false);
    clearViews({});
  };

  const toggleShowRequestResponseView = () => {
    setShowRequestResponseView(!showRequestResponseView);
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
    // setOpened(!opened);
    setMonitorComponents(["messages"]);
  };

  return (
    <>
      {/* <div>{JSON.stringify(authenticatedData)}</div> */}
      {/* <div>{children}</div> */}
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { desktop: true, mobile: !opened },
        }}
        // padding="md"
      >
        <AppShell.Header>
          <Header authenticatedData={authenticatedData}></Header>
        </AppShell.Header>

        <AppShell.Navbar py="md" px={4}>
          {/* <UnstyledButton className={classes.control}>Home</UnstyledButton>
        <UnstyledButton className={classes.control}>Blog</UnstyledButton>
        <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
        <UnstyledButton className={classes.control}>Support</UnstyledButton> */}
          {/* <div>mobile navbar coming soon</div> */}
        </AppShell.Navbar>

        <AppShell.Main>
          {/* Navbar is only visible on mobile, links that are rendered in the header
        on desktop are hidden on mobile in header and rendered in navbar
        instead. */}
          {children}
        </AppShell.Main>
        <AppShell.Footer>
          {isMobile &&
            authenticatedData?.authenticated &&
            activeLayout?.quickActionsBar?.isDisplayed && (
              <div className="flex justify-between p-2 gap-3 px-12">
                <></>
                <LayoutToggle />

                <div className="flex gap-4">
                  <InputModeToggle authenticatedData={authenticatedData} />
                  <Tooltip label={`clear all views`} position="top">
                    <ActionIcon
                      size="sm"
                      onClick={handleClearViews}
                      variant={
                        showRequestResponseView || Object.keys(views).length > 0
                          ? "filled"
                          : "outline"
                      }
                    >
                      <IconIconsOff size={20} />
                    </ActionIcon>
                  </Tooltip>
                </div>
                {/* <div>
                  <Tooltip label={`messages`} position="top">
                    <ActionIcon
                      size="sm"
                      // onClick={handleClearViews}
                      onClick={() =>
                        handleMenuNavigate({
                          entity_type: "sessions",
                          action_type: "show",
                          id: "sessions:h5v3p5tbn363as94m248",
                        })
                      }
                      // variant={
                      //   showRequestResponseView || Object.keys(views).length > 0
                      //     ? "filled"
                      //     : "outline"
                      // }
                      variant="outline"
                    >
                      <IconMail size={20} />
                    </ActionIcon>
                  </Tooltip>
                </div> */}
              </div>
            )}
          <Footer></Footer>
        </AppShell.Footer>
      </AppShell>
    </>
  );
}
export default AppLayout;
