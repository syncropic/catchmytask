import React from "react";
import { ContentBlockProps } from "@components/interfaces";
import {
  Badge,
  Group,
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  useMantineColorScheme,
  useComputedColorScheme,
  UnstyledButton,
  Anchor,
} from "@mantine/core";
import classes from "./ActionsGrid.module.css";
import { iconMapping } from "@components/Utils";

export function List({ title, items }: ContentBlockProps) {
  const computedColorScheme = useComputedColorScheme("light"); // Use the computed color scheme

  const items_components = items.map((item) => {
    const IconComponent = iconMapping[item.metadata?.illustration];
    return (
      <UnstyledButton
        key={item.name}
        className={classes.item}
        style={{
          backgroundColor:
            computedColorScheme === "light"
              ? "rgba(229, 231, 235, 1)" // Tailwind bg-gray-200 for light mode
              : "rgba(255, 255, 255, 0.1)", // Existing dark mode background
          color:
            computedColorScheme === "light"
              ? "#000" // Dark text for light mode
              : "#FFF", // Light text for dark mode
          boxShadow:
            computedColorScheme === "light"
              ? "0 4px 6px rgba(0, 0, 0, 0.1)" // Light mode shadow
              : "0 4px 6px rgba(0, 0, 0, 0.5)", // Dark mode shadow
          borderRadius: "8px", // Add some rounding to the corners
          padding: "10px", // Add padding to give some spacing inside the items
        }}
      >
        {IconComponent && (
          <IconComponent
            color={computedColorScheme === "light" ? "#000" : "#FFF"}
            size="2rem"
          />
        )}
        <Text size="xs" mt={7}>
          {item.name}
        </Text>
      </UnstyledButton>
    );
  });

  return (
    <div
      style={{
        backgroundColor:
          computedColorScheme === "light"
            ? "rgba(229, 231, 235, 1)" // Tailwind bg-gray-200 for light mode
            : "rgba(0, 0, 0, 0.8)", // Existing dark mode background
      }}
    >
      <Container size="lg" py="xl">
        <Card
          className={classes.card}
          style={{
            backgroundColor:
              computedColorScheme === "light"
                ? "rgba(229, 231, 235, 1)" // Tailwind bg-gray-200 for light mode
                : "rgba(0, 0, 0, 0.6)", // Existing dark mode card background
            color: computedColorScheme === "light" ? "#000" : "#FFF",
          }}
        >
          <Title
            order={2}
            className={classes.title}
            ta="center"
            mt="sm"
            style={{
              color: computedColorScheme === "light" ? "#000" : "#FFF",
            }}
          >
            {title.name}
          </Title>
          <div className="flex justify-center">
            <Text
              c="dimmed"
              ta="center"
              style={{
                color:
                  computedColorScheme === "light"
                    ? "rgba(0, 0, 0, 0.6)" // Dimmed text in light mode
                    : "rgba(255, 255, 255, 0.6)", // Dimmed text in dark mode
              }}
            >
              {title.description}
            </Text>
          </div>
          <SimpleGrid cols={4} mt="md">
            {items_components}
          </SimpleGrid>
          <Group justify="space-between">
            <Text className={classes.title}></Text>
            <Anchor
              size="xs"
              c="dimmed"
              style={{
                lineHeight: 1,
                color:
                  computedColorScheme === "light"
                    ? "rgba(0, 0, 0, 0.6)"
                    : "rgba(255, 255, 255, 0.6)",
              }}
            >
              + 100's other services
            </Anchor>
          </Group>
        </Card>
      </Container>
    </div>
  );
}

export default List;
