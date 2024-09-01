import React from "react";
import {
  Container,
  Title,
  Accordion,
  Text,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import classes from "./AccordionList.module.css";
import { ContentBlockProps } from "@components/interfaces";

export function AccordionList({ title, items }: ContentBlockProps) {
  const computedColorScheme = useComputedColorScheme("light"); // Use the computed color scheme

  return (
    <div
      style={{
        backgroundColor:
          computedColorScheme === "light"
            ? "rgba(229, 231, 235, 1)" // Tailwind bg-gray-200 for light mode
            : "rgba(0, 0, 0, 0.8)", // Existing dark mode background
      }}
    >
      <Container size="sm" className={classes.wrapper}>
        <Title
          ta="center"
          className={classes.title}
          style={{
            color: computedColorScheme === "light" ? "#000" : "#FFF",
          }}
        >
          {title?.name}
        </Title>

        <Accordion variant="separated">
          {items.map((item, index) => {
            return (
              <Accordion.Item
                className={classes.item}
                value={item.name}
                key={index}
                style={{
                  backgroundColor:
                    computedColorScheme === "light"
                      ? "rgba(255, 255, 255, 1)" // Slightly lighter for the accordion items in light mode
                      : "rgba(50, 50, 50, 0.9)", // Slightly darker for accordion items in dark mode
                  boxShadow:
                    computedColorScheme === "light"
                      ? "0 4px 6px rgba(0, 0, 0, 0.1)" // Light mode shadow
                      : "0 4px 6px rgba(0, 0, 0, 0.5)", // Dark mode shadow
                  borderRadius: "8px", // Adding border radius for a smoother look
                  padding: "10px", // Some padding around the items
                  marginBottom: "10px", // Space between accordion items
                }}
              >
                <Accordion.Control>
                  <Text
                    size="sm"
                    fw={700}
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 90 }}
                  >
                    {item.name}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel
                  style={{
                    color: computedColorScheme === "light" ? "#000" : "#FFF",
                  }}
                >
                  {item.description}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Container>
    </div>
  );
}

export default AccordionList;
