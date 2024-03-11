import React from "react";
import { Anchor } from "@mantine/core";

const ExternalLink = ({ value, displayFormat, displayComponentContent }) => {
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return (
    <Anchor href={value} target="_blank" rel="noopener noreferrer">
      {displayComponentContent ? displayComponentContent : value}
    </Anchor>
  );
};

export default ExternalLink;
