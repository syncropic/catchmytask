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
import LayoutToggleAndSearch from "./LayoutToggleAndSearch";
import UserMenu from "./UserMenu";
import { useIsAuthenticated } from "@refinedev/core";
import Footer from "@components/Footer";
import Header from "@components/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { activeApplication } = useAppStore();
  const { isLoading, data: authenticatedData } = useIsAuthenticated();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        {/* <div className="flex justify-between align-middle pl-3 pr-3">
          <div className="flex items-center">

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
          {authenticatedData?.authenticated && <LayoutToggleAndSearch />}
          <UserMenu />
        </div> */}
        <Header authenticatedData={authenticatedData}></Header>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {/* <UnstyledButton className={classes.control}>Home</UnstyledButton>
        <UnstyledButton className={classes.control}>Blog</UnstyledButton>
        <UnstyledButton className={classes.control}>Contacts</UnstyledButton>
        <UnstyledButton className={classes.control}>Support</UnstyledButton> */}
        <div>mobile navbar coming soon</div>
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Navbar is only visible on mobile, links that are rendered in the header
        on desktop are hidden on mobile in header and rendered in navbar
        instead. */}
        {children}
      </AppShell.Main>
      <AppShell.Footer>
        <Footer></Footer>
        {/* <Footer
              companyName="dpwanjala"
              companyURL="https://dpwanjala.com"
              year="2023"
            ></Footer> */}
        {/* <FooterCentered
                links={links}
                actionItems={actionItems}
              ></FooterCentered> */}
      </AppShell.Footer>
    </AppShell>
  );
}
export default AppLayout;

// // create simple function component called MainSiteNavigation
// const MainSiteNavigation: React.FC = () => {
//   return (
//     <div className="flex items-center gap-4">
//       <Button
//         size="xs"
//         variant="filled"
//         onClick={() => {
//           console.log("leftSection");
//         }}
//       >
//         Why Catchmytask?
//       </Button>
//       <Menu shadow="md" width={200}>
//         <Menu.Target>
//           <Button>More</Button>
//         </Menu.Target>

//         <Menu.Dropdown>
//           <Menu.Item
//           // icon={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
//           >
//             Terms & Conditions
//           </Menu.Item>

//           <Menu.Item
//           // icon={<IconSearch style={{ width: rem(14), height: rem(14) }} />}
//           >
//             FAQ
//           </Menu.Item>
//         </Menu.Dropdown>
//       </Menu>
//     </div>
//   );
// };
