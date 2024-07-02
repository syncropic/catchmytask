import { Anchor, Avatar, Button } from "@mantine/core";
import Link from "next/link";

export function LogoName({ logoLink, companyName, logoURL, handleClickHome }) {
  return (
    <Anchor component={Link} href={logoLink}>
      <Button
        variant="transparent"
        leftSection={<Avatar src={logoURL} alt="company logo" size="sm" />}
        onClick={() => handleClickHome()}
      >
        {companyName || "COMPANY NAME"}
      </Button>
    </Anchor>
  );
}
