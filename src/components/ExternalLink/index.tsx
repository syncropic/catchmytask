import React from "react";
import { Anchor } from "@mantine/core";
import { IFieldConfigurationWithValue } from "@components/interfaces";

const ExternalLink: React.FC<IFieldConfigurationWithValue> = ({
  value,
  display_format,
  display_component,
  display_component_content,
}) => {
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return (
    <Anchor href={value} target="_blank" rel="noopener noreferrer">
      {display_component_content ? display_component_content : value}
    </Anchor>
  );
};

export default ExternalLink;
