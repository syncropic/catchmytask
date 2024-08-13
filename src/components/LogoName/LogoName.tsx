import { Anchor, Avatar, Button } from "@mantine/core";
import { IconLetterC } from "@tabler/icons-react";
import Link from "next/link";

interface LogoNameProps {
  logoLink: string;
  companyName?: string;
  logoURL?: string;
  handleClickHome: () => void;
  iconName?: string;
}

export function LogoName({
  logoLink,
  companyName = "COMPANY NAME",
  logoURL,
  handleClickHome,
  iconName,
}: LogoNameProps) {
  return (
    <Anchor component={Link} href={logoLink}>
      <Button
        variant="transparent"
        leftSection={
          logoURL ? (
            <Avatar src={logoURL} alt="company logo" size="sm" />
          ) : iconName ? (
            <Avatar color="blue" radius="sm">
              <IconLetterC />
            </Avatar>
          ) : (
            <Avatar color="blue" radius="sm">
              <IconLetterC />
            </Avatar>
          )
        }
        onClick={handleClickHome}
      >
        {companyName}
      </Button>
    </Anchor>
  );
}
