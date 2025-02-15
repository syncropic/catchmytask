import { Anchor, Group, ActionIcon, rem } from "@mantine/core";
import { IconMailForward } from "@tabler/icons-react";

interface Link {
  name: string;
  link: string;
}

interface Copywright {
  url?: string;
  content?: string;
}

interface FooterItem {
  // actionItems: ActionItem[];
  copywright?: Copywright;
  links: Link[];
}

export function FooterCentered({
  links,
  copywright = { url: "https://dpwanjala.com", content: "dpwanjala.com" },
}: FooterItem) {
  const linkComponents = links?.map((item, index) => (
    <Anchor href={item?.link} key={index}>
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
        <Anchor href={copywright?.url} target="blank">
          © {copywright?.content}
        </Anchor>

        {/* <Group className={classes.links}>{items}</Group> */}
        {links.length > 0 && (
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            {linkComponents}
          </Group>
        )}
      </div>
    </div>
  );
}

// const items = links.map((link) => (
//   <Anchor
//     c="dimmed"
//     key={link.label}
//     href={link.link}
//     lh={1}
//     onClick={(event) => event.preventDefault()}
//     size="sm"
//   >
//     {link.label}
//   </Anchor>
// ));
