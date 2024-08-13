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
} from "@mantine/core";
import classes from "./FeaturesCards.module.css";
import { ContentBlockProps } from "@components/interfaces";

export function FeaturesCards({ title, items }: ContentBlockProps) {
  const theme = useMantineTheme();
  const features = items.map((feature) => (
    <Card
      key={feature.name}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
    >
      {/* <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]}
      /> */}
      {/* {feature.icon} */}

      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.name}
      </Text>
      {/* <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text> */}
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      {/* <Group justify="center">
        <Badge variant="filled" size="lg">
          Best company ever
        </Badge>
      </Group> */}

      <Title order={2} className={classes.title} ta="center" mt="sm">
        {title.name}
      </Title>
      <div className="flex justify-center">
        <Text c="dimmed" ta="center">
          {title.description}
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
