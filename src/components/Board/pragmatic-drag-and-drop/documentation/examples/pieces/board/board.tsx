import React, { forwardRef, memo, type ReactNode, useEffect } from "react";

import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Box, xcss } from "@atlaskit/primitives";
import { useBoardContext } from "@components/Board";
import { ScrollArea } from "@mantine/core";
import styles from "./ScrollArea.module.css"; // Import CSS module

type BoardProps = {
  children: ReactNode;
};

// const boardStyles = xcss({
//   display: "flex",
//   justifyContent: "center",
//   gap: "space.200",
//   flexDirection: "row",
//   height: "480px",
// });

const boardStyles = xcss({
  display: "flex",
  justifyContent: "center",
  gap: "space.200",
  flexDirection: "row",
  height: "480px",
  overflowX: "auto", // Enable horizontal scroll
  //   whiteSpace: "nowrap", // Prevent children from wrapping
});

const Board = forwardRef<HTMLDivElement, BoardProps>(
  ({ children }: BoardProps, ref) => {
    const { instanceId } = useBoardContext();

    useEffect(() => {
      return autoScrollWindowForElements({
        canScroll: ({ source }) => source.data.instanceId === instanceId,
      });
    }, [instanceId]);

    return (
      <ScrollArea
        classNames={{
          viewport: styles.viewport,
          scrollbar: styles.horizontalScrollbar,
        }}
      >
        <Box ref={ref}>{children}</Box>
      </ScrollArea>
    );
  }
);

export default memo(Board);

// xcss={boardStyles}
