import { Anchor, Group, ActionIcon, rem } from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
  IconMailForward,
} from "@tabler/icons-react";
import classes from "./FooterCentered.module.css";

interface Link {
  label: string;
  link: string;
}

interface ActionItem {
  label: string;
  link: string;
}

interface FooterItem {
  actionItems: ActionItem[];
  links: Link[];
}

export function FooterCentered({ links, actionItems }: FooterItem) {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  const actionItemsComponents = actionItems.map((item, index) => (
    <Anchor href="mailto: dpwanjala@gmail.com" key={index}>
      <ActionIcon
        size="lg"
        variant="default"
        radius="xl"
        key={index}
        // component={Anchor}
      >
        <IconMailForward
          style={{ width: rem(18), height: rem(18) }}
          stroke={1.5}
        />
      </ActionIcon>
    </Anchor>
  ));

  return (
    <div>
      <div className="flex md:flex-row justify-between pt-2 pb-2 pr-4 pl-4 md:pr-72 md:pl-72 bg-gray-900 items-center">
        <Anchor href="https://dpwanjala.com">© dpwanjala.com</Anchor>

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          {actionItemsComponents}
        </Group>
      </div>
    </div>
  );
}
