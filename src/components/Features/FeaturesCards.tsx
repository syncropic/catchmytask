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

// const mockdata = [
//   {
//     title: "Extreme performance",
//     description:
//       "This dust is actually a powerful poison that will even make a pro wrestler sick, Regice cloaks itself with frigid air of -328 degrees Fahrenheit",
//     icon: IconGauge,
//   },
//   {
//     title: "Privacy focused",
//     description:
//       "People say it can run at the same speed as lightning striking, Its icy body is so cold, it will not melt even if it is immersed in magma",
//     icon: IconUser,
//   },
//   {
//     title: "No third parties",
//     description:
//       "They’re popular, but they’re rare. Trainers who show them off recklessly may be targeted by thieves",
//     icon: IconCookie,
//   },
// ];

export function FeaturesCards({ items, heading, subheading }) {
  const theme = useMantineTheme();
  const features = items.map((feature) => (
    <Card
      key={feature.title}
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
      {feature.icon}

      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
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
    </Container>
  );
}
