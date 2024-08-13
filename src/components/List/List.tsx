import { ContentBlockProps } from "@components/interfaces";

import {
  Badge,
  Group,
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  rem,
  useMantineTheme,
  UnstyledButton,
  Anchor,
} from "@mantine/core";
// import classes from "./FeaturesCards.module.css";
import classes from "./ActionsGrid.module.css";
import { iconMapping } from "@components/Utils";

export function List({ title, items }: ContentBlockProps) {
  const theme = useMantineTheme();

  const items_components = items.map((item) => {
    const IconComponent = iconMapping[item.metadata?.illustration];
    return (
      <UnstyledButton key={item.name} className={classes.item}>
        {IconComponent && (
          <IconComponent
            // color={theme.colors[item.metadata?.color][6]}
            size="2rem"
          />
        )}
        <Text size="xs" mt={7}>
          {item.name}
          {/* {item.metadata?.illustration} */}
        </Text>
      </UnstyledButton>
    );
  });

  return (
    <div className="bg-gray-200">
      <Container size="lg" py="xl">
        <Card className={classes.card}>
          <Title order={2} className={classes.title} ta="center" mt="sm">
            {title.name}
          </Title>
          <div className="flex justify-center">
            <Text c="dimmed" ta="center">
              {title.description}
            </Text>
          </div>
          <SimpleGrid cols={4} mt="md">
            {items_components}
          </SimpleGrid>
          <Group justify="space-between">
            <Text className={classes.title}></Text>
            <Anchor size="xs" c="dimmed" style={{ lineHeight: 1 }}>
              + 100's other services
            </Anchor>
          </Group>
        </Card>
      </Container>
    </div>
  );
}

export default List;

{
  /* <Container size="lg" py="xl">
<Title order={2} className={classes.title} ta="center" mt="sm">
  {heading}
</Title>
<div className="flex justify-center">
  <Text c="dimmed" ta="center">
    {subheading}
  </Text>
</div>

<SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
  {features}
</SimpleGrid>
</Container> */
}
