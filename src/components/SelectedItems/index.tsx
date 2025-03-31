import React, { useState } from "react";
import {
  Text,
  Card,
  Badge,
  Group,
  ActionIcon,
  Button,
  Menu,
  Divider,
  Tooltip,
  Checkbox,
  Title,
  Box,
  Stack,
  Select,
  TextInput,
  Alert,
  ScrollArea,
} from "@mantine/core";
import {
  IconBookmarkOff,
  IconDotsVertical,
  IconTrash,
  IconDownload,
  IconShare,
  IconClipboard,
  IconFilter,
  IconArrowsSort,
  IconSearch,
  IconFileExport,
  IconCheck,
  IconAlertCircle,
  IconExternalLink,
} from "@tabler/icons-react";

// Import the useSearchContext from your main search component

// Import the types from your types file
import { SearchResult, SelectedItemsProps } from "@components/types";
import { useSearchContext } from "@components/SearchResults";

const SelectedItems: React.FC<SelectedItemsProps> = ({
  title = "Selected Items",
  maxHeight = 600,
  onExport,
  onShare,
}) => {
  const { savedResults, removeResult } = useSearchContext();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [isCompact, setIsCompact] = useState(true);

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedIds.length === savedResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(savedResults.map((item) => item.id));
    }
  };

  // Toggle selection for a single item
  const toggleItemSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Clear all selected items from the context
  const clearAllSaved = () => {
    // This will trigger multiple state updates, but React will batch them
    savedResults.forEach((result) => removeResult(result.id));
  };

  // Remove selected items
  const removeSelected = () => {
    selectedIds.forEach((id) => removeResult(id));
    setSelectedIds([]);
  };

  // Handle export selected or all
  const handleExport = (onlySelected: boolean = false) => {
    const itemsToExport = onlySelected
      ? savedResults.filter((item) => selectedIds.includes(item.id))
      : savedResults;

    if (onExport) {
      onExport(itemsToExport);
    } else {
      // Default export behavior - e.g., copy to clipboard or generate CSV
      console.log("Exporting items:", itemsToExport);

      // Example: copy titles to clipboard
      const titles = itemsToExport.map((item) => item.title).join("\n");
      navigator.clipboard.writeText(titles);
    }
  };

  // Handle share
  const handleShare = () => {
    const itemsToShare =
      selectedIds.length > 0
        ? savedResults.filter((item) => selectedIds.includes(item.id))
        : savedResults;

    if (onShare) {
      onShare(itemsToShare);
    } else {
      // Default share behavior
      console.log("Sharing items:", itemsToShare);
    }
  };

  // Filter saved results based on search
  const filteredResults = savedResults.filter((result) =>
    searchFilter === ""
      ? true
      : result.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        result.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Sort the filtered results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return (
          new Date(b.date || b["lastUpdated"] || "").getTime() -
          new Date(a.date || a["lastUpdated"] || "").getTime()
        );
      case "oldest":
        return (
          new Date(a.date || a["lastUpdated"] || "").getTime() -
          new Date(b.date || b["lastUpdated"] || "").getTime()
        );
      case "relevance":
        return b.relevanceScore - a.relevanceScore;
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Get type info for a result
  const getTypeInfo = (type: string): { color: string; label: string } => {
    switch (type) {
      case "webpage":
        return { color: "blue", label: "Web" };
      case "document":
        return { color: "red", label: "Doc" };
      case "image":
        return { color: "green", label: "Img" };
      case "video":
        return { color: "grape", label: "Vid" };
      case "api":
        return { color: "orange", label: "API" };
      default:
        return { color: "gray", label: type.substring(0, 3) };
    }
  };

  // Render a compact version of a result item
  const renderCompactItem = (result: SearchResult) => {
    const typeInfo = getTypeInfo(result.type);
    const isSelected = selectedIds.includes(result.id);

    return (
      <Card
        key={result.id}
        withBorder
        padding="xs"
        radius="md"
        className="mb-2"
      >
        <Group position="apart" noWrap>
          <Checkbox
            checked={isSelected}
            onChange={() => toggleItemSelection(result.id)}
            size="xs"
          />

          <div className="flex-grow truncate">
            <Group spacing="xs" noWrap>
              <Badge size="xs" color={typeInfo.color}>
                {typeInfo.label}
              </Badge>
              <Text size="sm" lineClamp={1} className="font-medium">
                {result.title}
              </Text>
            </Group>

            <Text size="xs" color="dimmed" lineClamp={1}>
              {result.description}
            </Text>
          </div>

          <Group spacing="xs" noWrap>
            {result.type === "webpage" && "url" in result && (
              <Tooltip label="Open link">
                <ActionIcon
                  size="xs"
                  color="blue"
                  component="a"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink size={14} />
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label="Remove">
              <ActionIcon
                size="xs"
                color="red"
                onClick={() => removeResult(result.id)}
              >
                <IconBookmarkOff size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card>
    );
  };

  // Render a detailed version of a result item
  const renderDetailedItem = (result: SearchResult) => {
    const typeInfo = getTypeInfo(result.type);
    const isSelected = selectedIds.includes(result.id);

    return (
      <Card
        key={result.id}
        withBorder
        padding="sm"
        radius="md"
        className="mb-3"
      >
        <Group position="apart" mb="xs">
          <Group>
            <Checkbox
              checked={isSelected}
              onChange={() => toggleItemSelection(result.id)}
              size="xs"
            />
            <Badge size="sm" color={typeInfo.color}>
              {result.type}
            </Badge>
            {result.relevanceScore && (
              <Badge size="sm" color="gray">
                {(result.relevanceScore * 100).toFixed(0)}%
              </Badge>
            )}
          </Group>

          <Group spacing="xs">
            {result.type === "webpage" && "url" in result && (
              <Tooltip label="Open link">
                <ActionIcon
                  size="sm"
                  color="blue"
                  component="a"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon size="sm">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconClipboard size={14} />}
                  onClick={() => navigator.clipboard.writeText(result.title)}
                >
                  Copy title
                </Menu.Item>
                {result.type === "webpage" && "url" in result && (
                  <Menu.Item
                    icon={<IconClipboard size={14} />}
                    onClick={() => navigator.clipboard.writeText(result.url)}
                  >
                    Copy URL
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  icon={<IconBookmarkOff size={14} />}
                  onClick={() => removeResult(result.id)}
                  color="red"
                >
                  Remove
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Text size="sm" weight={500} lineClamp={2}>
          {result.title}
        </Text>

        <Text size="xs" color="dimmed" mt="xs" lineClamp={3}>
          {result.description}
        </Text>

        <Group position="apart" mt="sm" spacing="xs">
          <Group spacing="xs">
            {result.date && (
              <Text size="xs" color="dimmed">
                {new Date(result.date).toLocaleDateString()}
              </Text>
            )}
            {result.source && (
              <Text size="xs" color="dimmed">
                {result.source}
              </Text>
            )}
          </Group>

          {/* Type-specific metadata */}
          <Group spacing="xs">
            {"fileType" in result && (
              <Badge size="xs" variant="outline">
                {result.fileType}
              </Badge>
            )}
            {"fileSize" in result && (
              <Text size="xs" color="dimmed">
                {result.fileSize}
              </Text>
            )}
            {"duration" in result && (
              <Text size="xs" color="dimmed">
                {result.duration}
              </Text>
            )}
            {"dimensions" in result && (
              <Text size="xs" color="dimmed">
                {result.dimensions}
              </Text>
            )}
          </Group>
        </Group>
      </Card>
    );
  };

  return (
    <Card withBorder radius="md" padding="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Title order={4} size="h5">
            {title}{" "}
            {savedResults.length > 0 && (
              <Text component="span" size="sm" color="dimmed">
                ({savedResults.length})
              </Text>
            )}
          </Title>

          <Button
            size="xs"
            variant="subtle"
            onClick={() => setIsCompact(!isCompact)}
            compact
          >
            {isCompact ? "Detailed View" : "Compact View"}
          </Button>
        </Group>
      </Card.Section>

      {/* Search and filter controls */}
      {savedResults.length > 0 && (
        <Box pt="xs">
          <Group mb="xs">
            <TextInput
              size="xs"
              placeholder="Search selected items..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              icon={<IconSearch size={14} />}
              className="flex-grow"
            />

            <Select
              size="xs"
              value={sortOrder}
              onChange={(value) => setSortOrder(value || "newest")}
              icon={<IconArrowsSort size={14} />}
              data={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "relevance", label: "Relevance" },
                { value: "az", label: "A-Z" },
                { value: "za", label: "Z-A" },
              ]}
              w={110}
            />
          </Group>

          <Group position="apart" mb="xs">
            <Group>
              <Checkbox
                checked={
                  selectedIds.length === savedResults.length &&
                  savedResults.length > 0
                }
                indeterminate={
                  selectedIds.length > 0 &&
                  selectedIds.length < savedResults.length
                }
                onChange={toggleSelectAll}
                label={<Text size="xs">Select all</Text>}
                size="xs"
              />

              {selectedIds.length > 0 && (
                <Text size="xs" color="dimmed">
                  {selectedIds.length} selected
                </Text>
              )}
            </Group>

            <Group spacing="xs">
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<IconFileExport size={14} />}
                    disabled={savedResults.length === 0}
                  >
                    Export
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconFileExport size={14} />}
                    onClick={() => handleExport(false)}
                  >
                    Export all items
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCheck size={14} />}
                    onClick={() => handleExport(true)}
                    disabled={selectedIds.length === 0}
                  >
                    Export selected
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    disabled={savedResults.length === 0}
                    color="red"
                    variant="subtle"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color="red"
                    icon={<IconTrash size={14} />}
                    onClick={clearAllSaved}
                  >
                    Remove all items
                  </Menu.Item>
                  {selectedIds.length > 0 && (
                    <Menu.Item
                      color="red"
                      icon={<IconTrash size={14} />}
                      onClick={removeSelected}
                    >
                      Remove selected ({selectedIds.length})
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Box>
      )}

      <Divider my="xs" />

      {savedResults.length > 0 ? (
        <ScrollArea.Autosize maxHeight={maxHeight} type="scroll">
          {sortedResults.length > 0 ? (
            <div>
              {sortedResults.map((result) =>
                isCompact
                  ? renderCompactItem(result)
                  : renderDetailedItem(result)
              )}
            </div>
          ) : (
            <Alert
              icon={<IconFilter size={16} />}
              color="gray"
              title="No results match your search"
            >
              Try adjusting your search query
            </Alert>
          )}
        </ScrollArea.Autosize>
      ) : (
        <Stack align="center" spacing="xs" my="xl">
          <IconAlertCircle
            size={32}
            stroke={1.5}
            color="var(--mantine-color-gray-5)"
          />
          <Text color="dimmed" size="sm" align="center">
            No items selected yet
          </Text>
          <Text color="dimmed" size="xs" align="center">
            Save search results to see them here
          </Text>
        </Stack>
      )}
    </Card>
  );
};

export default SelectedItems;
