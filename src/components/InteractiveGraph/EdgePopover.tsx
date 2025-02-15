import React from "react";
import { Popover, Text, Paper, CloseButton } from "@mantine/core";

interface SimilarityDetails {
  key_similarity: number;
  source_key: string;
  target_key: string;
  tempo_difference: number;
  tempo_similarity: number;
}

interface EdgePopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  link: any;
  onClose: () => void;
}

const EdgePopover: React.FC<EdgePopoverProps> = ({
  isOpen,
  position,
  link,
  onClose,
}) => {
  if (!link?.similarity_details) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <Popover
        opened={isOpen}
        position="right"
        withArrow
        trapFocus={false}
        closeOnClickOutside={true}
        withinPortal={true}
        onChange={onClose}
      >
        <Popover.Target>
          <div
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              width: 1,
              height: 1,
            }}
          />
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: "auto" }}>
          <Paper p="md" radius="md" className="w-64">
            <div className="flex justify-between items-start mb-2">
              <Text size="lg" fw={500}>
                Similarity Details
              </Text>
              <CloseButton onClick={onClose} />
            </div>
            <Text size="sm" mb="xs">
              <strong>Key Similarity:</strong>{" "}
              {link.similarity_details.key_similarity.toFixed(3)}
            </Text>
            <Text size="sm" mb="xs">
              <strong>Source Key:</strong> {link.similarity_details.source_key}
            </Text>
            <Text size="sm" mb="xs">
              <strong>Target Key:</strong> {link.similarity_details.target_key}
            </Text>
            <Text size="sm" mb="xs">
              <strong>Tempo Difference:</strong>{" "}
              {link.similarity_details.tempo_difference.toFixed(3)}
            </Text>
            <Text size="sm" mb="xs">
              <strong>Tempo Similarity:</strong>{" "}
              {link.similarity_details.tempo_similarity.toFixed(3)}
            </Text>
          </Paper>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default EdgePopover;
