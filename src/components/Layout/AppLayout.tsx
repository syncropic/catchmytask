import {
  AppShell,
  Burger,
  Group,
  UnstyledButton,
  Anchor,
  Button,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import classes from "./MobileNavbar.module.css";
import { useAppStore } from "src/store";
import UserMenu from "./UserMenu";
import { useIsAuthenticated } from "@refinedev/core";
import Footer from "@components/Footer";
import Header from "@components/Header";
import LayoutToggle from "./LayoutToggle";
import { useIsMobile } from "@components/Utils";
// export default AppLayout;
export function AppLayout({
  children,
  authenticatedData,
}: {
  children: React.ReactNode;
  authenticatedData: any;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { activeLayout } = useAppStore();
  const isMobile = useIsMobile(); // Custom hook to check if the screen is mobile

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
              <div className="flex justify-center">
                <LayoutToggle />
              </div>
            )}
          <Footer></Footer>
        </AppShell.Footer>
      </AppShell>
    </>
  );
}
export default AppLayout;
