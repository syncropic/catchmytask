import { ActionIcon, Anchor, Avatar, Button } from "@mantine/core";
import { IconLetterC, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useAppStore } from "src/store";
import { Burger } from "@mantine/core";
import { useIsMobile } from "@components/Utils";
import { useActiveAuthProvider, useGetIdentity } from "@refinedev/core";

interface LogoNameProps {
  logoLink: string;
  companyName?: string;
  logoURL?: string;
  handleClickHome: () => void;
  iconName?: string;
  authenticatedData?: any;
}

export function LogoName({
  logoLink,
  companyName = "COMPANY NAME",
  logoURL,
  handleClickHome,
  iconName,
  authenticatedData = {},
}: LogoNameProps) {
  const { displaySidebar, toggleDisplaySidebar, activeProfile } = useAppStore();
  const isMobile = useIsMobile();

  const authProvider = useActiveAuthProvider();

  const { data: user } = useGetIdentity({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  return (
    // <Anchor component={Link} href={logoLink}>

    // </Anchor>
    <>
      {!authenticatedData?.authenticated && (
        <Button
          variant="transparent"
          // leftSection={
          //   authenticatedData?.authenticated ? (
          //     <Burger
          //       opened={displaySidebar}
          //       size="sm"
          //       // onClick={toggleDisplaySidebar}
          //       aria-label="Toggle navigation"
          //       color="blue"
          //     />
          //   ) : null
          // }
          // leftSection={
          //   logoURL ? (
          //     <Avatar src={logoURL} alt="company logo" size="sm" />
          //   ) : iconName ? (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   ) : (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   )
          // }
          // onClick={toggleDisplaySidebar}
        >
          {companyName}
        </Button>
      )}

      {authenticatedData?.authenticated && (
        <Button
          variant="transparent"
          leftSection={
            authenticatedData?.authenticated ? (
              <Burger
                opened={displaySidebar}
                size="sm"
                // onClick={toggleDisplaySidebar}
                aria-label="Toggle navigation"
                color="blue"
              />
            ) : null
          }
          // leftSection={
          //   logoURL ? (
          //     <Avatar src={logoURL} alt="company logo" size="sm" />
          //   ) : iconName ? (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   ) : (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   )
          // }
          onClick={toggleDisplaySidebar}
        >
          {/* {isMobile ? null : companyName} */}

          {isMobile ? null : activeProfile?.name || user?.email}
        </Button>
      )}

      {/* {!isMobile && !authenticatedData?.authenticated && (
        <Button
          variant="transparent"
          leftSection={
            authenticatedData?.authenticated ? (
              <Burger
                opened={displaySidebar}
                size="sm"
                // onClick={toggleDisplaySidebar}
                aria-label="Toggle navigation"
                color="blue"
              />
            ) : null
          }
          // leftSection={
          //   logoURL ? (
          //     <Avatar src={logoURL} alt="company logo" size="sm" />
          //   ) : iconName ? (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   ) : (
          //     <Avatar color="blue" radius="sm">
          //       <IconLetterC />
          //     </Avatar>
          //   )
          // }
          onClick={toggleDisplaySidebar}
        >
          {isMobile ? null : companyName}
        </Button>
      )} */}

      {/* : (
        <div className="p-1">
          <Burger
            opened={displaySidebar}
            size="sm"
            onClick={toggleDisplaySidebar}
            aria-label="Toggle navigation"
            color="blue"
          />
        </div>
      )} */}
    </>
  );
}
