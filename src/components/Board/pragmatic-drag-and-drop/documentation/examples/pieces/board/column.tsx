import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import invariant from "tiny-invariant";
import { useAppStore, useTransientStore } from "src/store";
import { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  type CustomTriggerProps,
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from "@atlaskit/ds-lib/merge-refs";
import Heading from "@atlaskit/heading";
// This is the smaller MoreIcon soon to be more easily accessible with the
// ongoing icon project
import MoreIcon from "@atlaskit/icon/glyph/editor/more";
import { easeInOut } from "@atlaskit/motion/curves";
import { mediumDurationMs } from "@atlaskit/motion/durations";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Box, Flex, Inline, Stack, xcss } from "@atlaskit/primitives";
import { token } from "@atlaskit/tokens";
import { Card } from "./card";
import {
  ColumnContext,
  type ColumnContextProps,
  useColumnContext,
} from "./column-context";
import { ActionStep, useBoardContext } from "@components/Board";
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import SearchInput from "@components/SearchInput";
import ActionInputWrapper from "@components/ActionInput";
import { truncateText } from "@components/Utils";
import {
  Button,
  Indicator,
  Menu,
  rem,
  Text,
  useComputedColorScheme,
} from "@mantine/core";
import { ActionStepResultsWrapper } from "@components/ActionStepResults";
import {
  IconCopy,
  IconDotsVertical,
  IconMessageCircle,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";

// const columnStyles = xcss({
//   //   width: "250px",
//   width: "650px",
//   backgroundColor: "elevation.surface.sunken",
//   borderRadius: "border.radius.300",
//   transition: `background ${mediumDurationMs}ms ${easeInOut}`,
//   position: "relative",
//   /**
//    * TODO: figure out hover color.
//    * There is no `elevation.surface.sunken.hovered` token,
//    * so leaving this for now.
//    */
// });

// const getColumnStyles = (backgroundColor: any) =>
//   xcss({
//     width: "650px",
//     borderRadius: "border.radius.300",
//     transition: `background ${mediumDurationMs}ms ${easeInOut}`,
//     position: "relative",
//     backgroundColor: backgroundColor, // Dynamic background color
//   });

const getColumnStyles = (effectiveScheme: string) =>
  xcss({
    width: "650px",
    backgroundColor:
      effectiveScheme === "light"
        ? "elevation.surface.sunken" // Keep the original background for light
        : "elevation.surface.sunken", // New background for dark theme
    borderRadius: "border.radius.300",
    transition: `background ${mediumDurationMs}ms ${easeInOut}`,
    position: "relative",
  });

const stackStyles = xcss({
  // allow the container to be shrunk by a parent height
  // https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/#the-minimum-size-gotcha-11
  minHeight: "0",

  // ensure our card list grows to be all the available space
  // so that users can easily drop on en empty list
  flexGrow: 1,
});

const scrollContainerStyles = xcss({
  height: "100%",
  overflowY: "auto",
});

const cardListStyles = xcss({
  boxSizing: "border-box",
  minHeight: "100%",
  padding: "space.100",
  gap: "space.100",
});

const columnHeaderStyles = xcss({
  paddingInlineStart: "space.200",
  paddingInlineEnd: "space.200",
  paddingBlockStart: "space.100",
  color: "color.text.subtlest",
  userSelect: "none",
});

/**
 * Note: not making `'is-dragging'` a `State` as it is
 * a _parallel_ state to `'is-column-over'`.
 *
 * Our board allows you to be over the column that is currently dragging
 */
type State =
  | { type: "idle" }
  | { type: "is-card-over" }
  | { type: "is-column-over"; closestEdge: Edge | null }
  | { type: "generate-safari-column-preview"; container: HTMLElement }
  | { type: "generate-column-preview" };

// preventing re-renders with stable state objects
const idle: State = { type: "idle" };
const isCardOver: State = { type: "is-card-over" };

const stateStyles: {
  [key in State["type"]]: ReturnType<typeof xcss> | undefined;
} = {
  idle: xcss({
    cursor: "grab",
  }),
  "is-card-over": xcss({
    backgroundColor: "color.background.selected.hovered",
  }),
  "is-column-over": undefined,
  /**
   * **Browser bug workaround**
   *
   * _Problem_
   * When generating a drag preview for an element
   * that has an inner scroll container, the preview can include content
   * vertically before or after the element
   *
   * _Fix_
   * We make the column a new stacking context when the preview is being generated.
   * We are not making a new stacking context at all times, as this _can_ mess up
   * other layering components inside of your card
   *
   * _Fix: Safari_
   * We have not found a great workaround yet. So for now we are just rendering
   * a custom drag preview
   */
  "generate-column-preview": xcss({
    isolation: "isolate",
  }),
  "generate-safari-column-preview": undefined,
};

const isDraggingStyles = xcss({
  opacity: 0.4,
});

export const Column = memo(function Column({ column }: { column: ActionStep }) {
  const columnId = column.id;
  const columnRef = useRef<HTMLDivElement | null>(null);
  const columnInnerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<State>(idle);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [openedMenu, setOpenedMenu] = useState(false);
  const {
    entity_types,
    focused_entities,
    setEntityTypes,
    setFocusedEntities,
    activeTask,
    colorScheme,
  } = useAppStore();
  const computedColorScheme = useComputedColorScheme("light"); // Compute the color scheme, defaults to 'light'

  // Determine the effective scheme to use
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;
  const { instanceId, registerColumn } = useBoardContext();

  useEffect(() => {
    invariant(columnRef.current);
    invariant(columnInnerRef.current);
    invariant(headerRef.current);
    invariant(scrollableRef.current);
    return combine(
      registerColumn({
        columnId,
        entry: {
          element: columnRef.current,
        },
      }),
      draggable({
        element: columnRef.current,
        dragHandle: headerRef.current,
        getInitialData: () => ({ columnId, type: "column", instanceId }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          const isSafari: boolean =
            navigator.userAgent.includes("AppleWebKit") &&
            !navigator.userAgent.includes("Chrome");

          if (!isSafari) {
            setState({ type: "generate-column-preview" });
            return;
          }
          setCustomNativeDragPreview({
            getOffset: centerUnderPointer,
            render: ({ container }) => {
              setState({
                type: "generate-safari-column-preview",
                container,
              });
              return () => setState(idle);
            },
            nativeSetDragImage,
          });
        },
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop() {
          setState(idle);
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element: columnInnerRef.current,
        getData: () => ({ columnId }),
        canDrop: ({ source }) => {
          return (
            source.data.instanceId === instanceId && source.data.type === "card"
          );
        },
        getIsSticky: () => true,
        onDragEnter: () => setState(isCardOver),
        onDragLeave: () => setState(idle),
        onDragStart: () => setState(isCardOver),
        onDrop: () => setState(idle),
      }),
      dropTargetForElements({
        element: columnRef.current,
        canDrop: ({ source }) => {
          return (
            source.data.instanceId === instanceId &&
            source.data.type === "column"
          );
        },
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = {
            columnId,
          };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["left", "right"],
          });
        },
        onDragEnter: (args) => {
          setState({
            type: "is-column-over",
            closestEdge: extractClosestEdge(args.self.data),
          });
        },
        onDrag: (args) => {
          // skip react re-render if edge is not changing
          setState((current) => {
            const closestEdge: Edge | null = extractClosestEdge(args.self.data);
            if (
              current.type === "is-column-over" &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return {
              type: "is-column-over",
              closestEdge,
            };
          });
        },
        onDragLeave: () => {
          setState(idle);
        },
        onDrop: () => {
          setState(idle);
        },
      }),
      autoScrollForElements({
        element: scrollableRef.current,
        canScroll: ({ source }) =>
          source.data.instanceId === instanceId && source.data.type === "card",
      })
    );
  }, [columnId, registerColumn, instanceId]);

  const stableItems = useRef(column.items);
  useEffect(() => {
    stableItems.current = column.items;
  }, [column.items]);

  const getCardIndex = useCallback((userId: string) => {
    return stableItems.current.findIndex((item) => item.userId === userId);
  }, []);

  const getNumCards = useCallback(() => {
    return stableItems.current.length;
  }, []);

  const contextValue: ColumnContextProps = useMemo(() => {
    return { columnId, getCardIndex, getNumCards };
  }, [columnId, getCardIndex, getNumCards]);

  const handleModeSelection = (item: any, id: string, action: string) => {
    // console.log("Mode selection item:", item);
    // console.log("Mode selection id:", id);
    // console.log("Mode selection action:", action);

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };

      // Ensure that the entity exists in the state
      if (!new_focused_entities[id]) {
        new_focused_entities[id] = {};
      }

      // Define the mode key based on the action
      const modeKey = `${action}_mode`;

      // Toggle the mode or set it to the new item
      if (new_focused_entities[id][modeKey] === item) {
        new_focused_entities[id][modeKey] = null; // Clear if already selected
      } else {
        new_focused_entities[id][modeKey] = item; // Set new item
      }

      // Update the state with the modified focused_entities
      setFocusedEntities(new_focused_entities);
    }
  };

  const updateComponentAction = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };
      //   console.log("new_focused_entities", new_focused_entities);
      //   console.log("id", id);
      if (!new_focused_entities[record?.id]) {
        new_focused_entities[record?.id] = {};
      }
      if (new_focused_entities[record?.id].action === action) {
        new_focused_entities[record?.id].action = null;
      } else {
        new_focused_entities[record?.id].action = action;
      }
      setFocusedEntities(new_focused_entities);
    }
  };

  const backgroundColor =
    effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800";

  const columnStyles = getColumnStyles(backgroundColor);

  return (
    <ColumnContext.Provider value={contextValue}>
      <Flex
        testId={`column-${columnId}`}
        ref={columnRef}
        direction="column"
        xcss={[columnStyles, stateStyles[state.type]]}
      >
        {/* This element takes up the same visual space as the column.
          We are using a separate element so we can have two drop targets
          that take up the same visual space (one for cards, one for columns)
        */}
        <Stack xcss={stackStyles} ref={columnInnerRef}>
          <Stack
            xcss={[stackStyles, isDragging ? isDraggingStyles : undefined]}
          >
            <div
              //   xcss={columnHeaderStyles}
              ref={headerRef}
              //   testId={`column-header-${columnId}`}
              //   spread="space-between"
              //   alignBlock="center"
              className="flex flex-col"
            >
              <div className="flex flex-row items-center justify-between p-3">
                <div className="w-[250px]">
                  {/* <div
                  size="xxsmall"
                  as="span"
                  testId={`column-header-title-${columnId}`}
                  className="truncate-text"
                  >
                    {column?.name || column?.description}
                  </div> */}
                  {/* <Text truncate="end" size="xs">
                    {column?.name || column?.description}
                  </Text> */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Reveal
                      trigger="click"
                      target={
                        <Text
                          truncate="end"
                          size="xs"
                          className="text-blue-500 pl-3 pr-3"
                        >
                          {/* {truncateText(`${activeTask?.name}`, 3)} */}
                          {column?.name || column?.description}
                        </Text>
                      }
                    >
                      <MonacoEditor
                        value={column}
                        language="json"
                        height="50vh"
                      />
                    </Reveal>
                  </div>
                </div>
               
                <div>
                  <ComponentsToolbar
                    include_components={[
                      
                      {
                        action: "fields",
                        entity_type: "action_steps",
                        type: "action",
                        record: column,
                        onClick: updateComponentAction,
                      },
                      {
                        action: "menu",
                        entity_type: "action_steps",
                        type: "action",
                        record: column,
                        onClick: updateComponentAction,
                      },
                    ]}
                  ></ComponentsToolbar>
                </div>
              </div>
              <div>
                
                {focused_entities[column?.id]?.["action"] === "save" && (
                  <div className="w-full">
                    <ActionInputWrapper
                      name="save"
                      query_name="data_model"
                      record={{ ...column, credential_id: "local device" }}
                      action="save"
                      success_message_code="action_input_data_model_schema"
                    />
                  </div>
                )}
                {focused_entities[column?.id]?.["action"] === "edit" && (
                  <div className="w-full">
                    <ActionInputWrapper
                      name="action_step"
                      query_name="data_model"
                      record={column}
                      action="edit"
                      success_message_code="action_input_data_model_schema"
                    />
                  </div>
                )}
              </div>
              {/* <ActionMenu /> */}
            </div>
            <Box xcss={scrollContainerStyles} ref={scrollableRef}>
              <Stack xcss={cardListStyles} space="space.100">
                {/* {column.items.map((item) => (
                  <Card item={item} key={item.userId} />
                ))} */}
                {/* <div>cards</div> */}
                {/* {column?.id === "action_steps:3b1vb5wpr5gtmw8qy0j3" && (
                  <ActionStepResultsWrapper record={column} />
                )} */}
                {/* <ActionStepResultsWrapper record={column} /> */}
                {column?.results_mode && (
                  <ActionStepResultsWrapper record={column} />
                )}
                {/* <div>results</div> */}
              </Stack>
            </Box>
          </Stack>
        </Stack>
        {state.type === "is-column-over" && state.closestEdge && (
          <DropIndicator
            edge={state.closestEdge}
            gap={token("space.200", "0")}
          />
        )}
      </Flex>
      {state.type === "generate-safari-column-preview"
        ? createPortal(<SafariColumnPreview column={column} />, state.container)
        : null}
    </ColumnContext.Provider>
  );
});

const safariPreviewStyles = xcss({
  width: "250px",
  backgroundColor: "elevation.surface.sunken",
  borderRadius: "border.radius",
  padding: "space.200",
});

function SafariColumnPreview({ column }: { column: ActionStep }) {
  return (
    <Box xcss={[columnHeaderStyles, safariPreviewStyles]}>
      <Heading size="xxsmall" as="span">
        {column.name}
      </Heading>
    </Box>
  );
}

function ActionMenu() {
  return (
    <DropdownMenu trigger={DropdownMenuTrigger}>
      <ActionMenuItems />
    </DropdownMenu>
  );
}

function ActionMenuItems() {
  const { columnId } = useColumnContext();
  const { getColumns, reorderColumn } = useBoardContext();

  const columns = getColumns();
  const startIndex = columns.findIndex((column) => column.id === columnId);

  const moveLeft = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex - 1,
    });
  }, [reorderColumn, startIndex]);

  const moveRight = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex + 1,
    });
  }, [reorderColumn, startIndex]);

  const isMoveLeftDisabled = startIndex === 0;
  const isMoveRightDisabled = startIndex === columns.length - 1;

  return (
    <DropdownItemGroup>
      <DropdownItem onClick={moveLeft} isDisabled={isMoveLeftDisabled}>
        Move left
      </DropdownItem>
      <DropdownItem onClick={moveRight} isDisabled={isMoveRightDisabled}>
        Move right
      </DropdownItem>
    </DropdownItemGroup>
  );
}

function DropdownMenuTrigger({
  triggerRef,
  ...triggerProps
}: CustomTriggerProps) {
  return (
    <IconButton
      ref={mergeRefs([triggerRef])}
      appearance="subtle"
      label="Actions"
      spacing="compact"
      icon={MoreIcon}
      {...triggerProps}
    />
  );
}
