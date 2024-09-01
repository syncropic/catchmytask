import React from "react";
import {
  ThemeIcon,
  Text,
  Title,
  Container,
  SimpleGrid,
  rem,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { iconMapping } from "@components/Utils";
import classes from "./FeaturesGrid.module.css";
import { ContentBlockProps } from "@components/interfaces";

interface FeatureProps {
  icon: React.FC<any>;
  title: React.ReactNode;
  description: React.ReactNode;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
  const computedColorScheme = useComputedColorScheme("light");

  return (
    <div
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
        padding: "20px", // Add padding to give some spacing inside the items
      }}
    >
      <ThemeIcon variant="light" size={40} radius={40}>
        <Icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
      </ThemeIcon>
      <Text mt="sm" mb={7}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.6}>
        {description}
      </Text>
    </div>
  );
}

export function FeaturesGrid({ title, items }: ContentBlockProps) {
  const computedColorScheme = useComputedColorScheme("light");

  const items_components = items.map((item, index) => {
    const IconComponent = iconMapping[item.metadata?.illustration];
    return (
      <div
        key={index}
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
          padding: "20px", // Add padding to give some spacing inside the items
        }}
      >
        <ThemeIcon variant="light" size={40} radius={40}>
          {IconComponent && <IconComponent size="2rem" />}
        </ThemeIcon>
        <Text mt="sm" mb={7}>
          {item.name}
        </Text>
        <Text size="sm" c="dimmed" lh={1.6}>
          {item.description}
        </Text>
      </div>
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
      <Container className={classes.wrapper}>
        <Title
          className={classes.title}
          style={{ color: computedColorScheme === "light" ? "#000" : "#FFF" }}
        >
          {title.name}
        </Title>

        <Container size={560} p={0}>
          <Text
            size="sm"
            className={classes.description}
            style={{
              color:
                computedColorScheme === "light"
                  ? "rgba(0, 0, 0, 0.6)"
                  : "rgba(255, 255, 255, 0.6)",
            }}
          >
            {title.description}
          </Text>
        </Container>

        <SimpleGrid
          mt={60}
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: "xl", md: 50 }}
          verticalSpacing={{ base: "xl", md: 50 }}
        >
          {items_components}
        </SimpleGrid>
      </Container>
    </div>
  );
}
