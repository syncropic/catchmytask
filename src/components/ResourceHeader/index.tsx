// ResourceHeader.tsx
import React from "react";
import { Title, Text } from "@mantine/core";

interface ResourceHeaderProps {
  name: string;
  heading: string;
  subheading: string;
  description: string;
}

const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  name,
  heading,
  subheading,
  description,
}) => {
  return (
    <div className="p-3">
      <Title>{name}</Title>
      <Title order={4}>{heading}</Title>
      <Text>{subheading}</Text>
      <Text>{description}</Text>
    </div>
  );
};

export default ResourceHeader;
