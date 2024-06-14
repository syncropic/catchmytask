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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { activeApplication } = useAppStore();

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
        <div className="flex justify-between align-middle pl-3 pr-3">
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
          <LayoutToggleAndSearch />
          {/* <MainSiteNavigation></MainSiteNavigation> */}
          <UserMenu />
        </div>
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
