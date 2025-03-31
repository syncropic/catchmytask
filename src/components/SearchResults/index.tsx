import React, { useState, createContext, useContext } from "react";
import {
  TextInput,
  Button,
  Group,
  Badge,
  Select,
  Card,
  Text,
  Collapse,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import {
  IconSearch,
  IconGridDots,
  IconList,
  IconChevronDown,
  IconChevronUp,
  IconAdjustments,
  IconExternalLink,
  IconChevronLeft,
  IconChevronRight,
  IconBookmark,
  IconBookmarkOff,
} from "@tabler/icons-react";

import {
  SearchResult,
  SearchContextType,
  SearchResultsProps,
  SearchResultItemProps,
  WebpageResult,
  DocumentResult,
  ImageResult,
  VideoResult,
  ApiResult,
} from "@components/types";

// Mock data representing different types of search results
const mockResults: SearchResult[] = [
  {
    id: 1,
    type: "webpage",
    title: "Introduction to Search Engines",
    description:
      "A comprehensive guide to understanding how search engines work and their importance in modern web navigation.",
    url: "https://example.com/search-engines",
    source: "Example Tech Blog",
    date: "2025-02-15",
    relevanceScore: 0.95,
  },
  {
    id: 2,
    type: "document",
    title: "Search Algorithm Optimization",
    description:
      "Technical paper on improving search algorithm efficiency and accuracy for large-scale applications.",
    fileType: "PDF",
    fileSize: "2.4MB",
    author: "Dr. Jane Smith",
    date: "2024-11-10",
    relevanceScore: 0.89,
  },
  {
    id: 3,
    type: "image",
    title: "Search Engine Architecture Diagram",
    description:
      "Visual representation of modern search engine components and their interactions.",
    thumbnailUrl: "https://placehold.co/600x400",
    dimensions: "1200x800",
    fileType: "PNG",
    source: "Search Tech Conference 2024",
    relevanceScore: 0.78,
  },
  {
    id: 4,
    type: "video",
    title: "Building a Custom Search Engine",
    description:
      "Tutorial on creating your own specialized search engine with Python and React.",
    thumbnailUrl: "https://placehold.co/600x400",
    duration: "32:15",
    channel: "CodeMasters",
    views: "45K",
    date: "2024-09-05",
    relevanceScore: 0.85,
  },
  {
    id: 5,
    type: "api",
    title: "SearchAPI Endpoint Documentation",
    description:
      "Full documentation for the SearchAPI REST endpoints with examples and authentication details.",
    apiVersion: "v3.2",
    lastUpdated: "2025-01-20",
    provider: "SearchCorp",
    relevanceScore: 0.92,
  },
];

// Create the context
const SearchContext = createContext<SearchContextType>({
  savedResults: [],
  saveResult: () => {},
  removeResult: () => {},
  isSaved: () => false,
});

// Hook to use the search context
export const useSearchContext = () => useContext(SearchContext);

// Component to display a single search result
const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  expanded,
  toggleExpand,
}) => {
  const { saveResult, removeResult, isSaved } = useSearchContext();
  const isResultSaved = isSaved(result.id);

  // Icon and color mapping based on result type
  const getTypeInfo = (
    type: string
  ): { icon: React.ReactNode; color: string } => {
    switch (type) {
      case "webpage":
        return {
          icon: <IconExternalLink size={16} stroke={1.5} />,
          color: "blue",
        };
      case "document":
        return {
          icon: (
            <Text size="xs" fw={600}>
              PDF
            </Text>
          ),
          color: "red",
        };
      case "image":
        return {
          icon: (
            <Text size="xs" fw={600}>
              IMG
            </Text>
          ),
          color: "green",
        };
      case "video":
        return {
          icon: (
            <Text size="xs" fw={600}>
              VID
            </Text>
          ),
          color: "grape",
        };
      case "api":
        return {
          icon: (
            <Text size="xs" fw={600}>
              API
            </Text>
          ),
          color: "orange",
        };
      default:
        return {
          icon: (
            <Text size="xs" fw={600}>
              ?
            </Text>
          ),
          color: "gray",
        };
    }
  };

  const typeInfo = getTypeInfo(result.type);

  // Handle saving/removing result
  const handleToggleSave = () => {
    if (isResultSaved) {
      removeResult(result.id);
    } else {
      saveResult(result);
    }
  };

  // Compact metadata display helper
  const renderMetaItem = (label: string | null, value: string) => (
    <Badge
      size="xs"
      radius="sm"
      className="mr-1 mb-1"
      color="gray"
      variant="outline"
    >
      {label && <span className="font-medium mr-1">{label}:</span>}
      <span className="truncate">{value}</span>
    </Badge>
  );

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render metadata elements specific to each result type
  const renderMetadata = () => {
    return (
      <div className="flex flex-wrap mt-1">
        {result.source && renderMetaItem(null, result.source)}
        {result.date && renderMetaItem(null, formatDate(result.date))}
        {"url" in result &&
          renderMetaItem(
            null,
            result.url.replace(/(^\w+:|^)\/\//, "").split("/")[0]
          )}
        {"fileType" in result && renderMetaItem(null, result.fileType)}
        {"fileSize" in result && renderMetaItem(null, result.fileSize)}
        {"author" in result && renderMetaItem("By", result.author)}
        {"dimensions" in result && renderMetaItem(null, result.dimensions)}
        {"channel" in result && renderMetaItem(null, result.channel)}
        {"views" in result && renderMetaItem(null, `${result.views} views`)}
        {"apiVersion" in result && renderMetaItem("v", result.apiVersion)}
        {"provider" in result && renderMetaItem(null, result.provider)}
        {"lastUpdated" in result &&
          renderMetaItem("Updated", formatDate(result.lastUpdated))}
      </div>
    );
  };

  // Render result content
  const renderResultContent = () => {
    const baseContent = (
      <div className="min-w-0">
        <Text
          size="sm"
          fw={500}
          className="text-blue-600 hover:text-blue-800 cursor-pointer truncate"
        >
          {result.title}
        </Text>
        <Text size="xs" color="dimmed" className="line-clamp-2 mt-0.5">
          {result.description}
        </Text>
      </div>
    );

    // Render different layouts for results with thumbnails
    if (result.type === "image" || result.type === "video") {
      const thumbSize = result.type === "video" ? "h-16 w-24" : "h-16 w-20";
      return (
        <div className="flex">
          <div className="flex-shrink-0 mr-2 relative">
            <img
              src={"thumbnailUrl" in result ? result.thumbnailUrl : ""}
              alt={result.title}
              className={`${thumbSize} object-cover rounded`}
            />
            {result.type === "video" && "duration" in result && (
              <div className="absolute bottom-0.5 right-0.5 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                {result.duration}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {baseContent}
            {renderMetadata()}
          </div>
        </div>
      );
    }

    return (
      <div>
        {baseContent}
        {renderMetadata()}
      </div>
    );
  };

  return (
    <Card
      padding="xs"
      radius="md"
      className={
        expanded
          ? "border-blue-300 bg-blue-50"
          : isResultSaved
          ? "border-green-300"
          : "border-gray-200"
      }
      withBorder
    >
      <div className="flex justify-between items-start gap-1">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span
              className="flex-shrink-0"
              style={{ color: `var(--mantine-color-${typeInfo.color}-filled)` }}
            >
              {typeInfo.icon}
            </span>
            <Text size="xs" c="dimmed" className="capitalize">
              {result.type}
            </Text>
            <Badge
              size="xs"
              radius="sm"
              color={
                result.relevanceScore > 0.8
                  ? "green"
                  : result.relevanceScore > 0.6
                  ? "blue"
                  : "gray"
              }
            >
              {(result.relevanceScore * 100).toFixed(0)}%
            </Badge>
            {isResultSaved && (
              <Badge size="xs" radius="sm" color="green" variant="dot">
                Saved
              </Badge>
            )}
            <ActionIcon
              onClick={toggleExpand}
              variant="subtle"
              color="gray"
              size="sm"
              className="ml-auto"
            >
              {expanded ? (
                <IconChevronUp size={14} />
              ) : (
                <IconChevronDown size={14} />
              )}
            </ActionIcon>
          </div>

          {renderResultContent()}
        </div>
      </div>

      <Collapse in={expanded}>
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
          <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
            {Object.entries(result)
              .filter(
                ([key]) =>
                  ![
                    "id",
                    "type",
                    "title",
                    "description",
                    "relevanceScore",
                    "thumbnailUrl",
                  ].includes(key)
              )
              .map(([key, value]) => (
                <div key={key} className="truncate">
                  <span className="font-medium capitalize mr-1">{key}:</span>
                  <span className="text-gray-600">
                    {typeof value === "string" ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
          </div>

          {/* Save/Remove button */}
          <div className="mt-3 flex justify-end">
            <Button
              size="xs"
              variant={isResultSaved ? "light" : "outline"}
              color={isResultSaved ? "red" : "green"}
              leftSection={
                isResultSaved ? (
                  <IconBookmarkOff size={14} />
                ) : (
                  <IconBookmark size={14} />
                )
              }
              onClick={handleToggleSave}
            >
              {isResultSaved ? "Remove from Saved" : "Save Result"}
            </Button>
          </div>
        </div>
      </Collapse>
    </Card>
  );
};

// Context provider component
export const SearchContextProvider: React.FC<{
  children: React.ReactNode;
  onSavedResultsChange?: (results: SearchResult[]) => void;
}> = ({ children, onSavedResultsChange }) => {
  const [savedResults, setSavedResults] = useState<SearchResult[]>([]);

  const saveResult = (result: SearchResult) => {
    setSavedResults((prev) => {
      const updated = [...prev, result];
      if (onSavedResultsChange) {
        onSavedResultsChange(updated);
      }
      return updated;
    });
  };

  const removeResult = (resultId: number) => {
    setSavedResults((prev) => {
      const updated = prev.filter((r) => r.id !== resultId);
      if (onSavedResultsChange) {
        onSavedResultsChange(updated);
      }
      return updated;
    });
  };

  const isSaved = (resultId: number) => {
    return savedResults.some((r) => r.id === resultId);
  };

  return (
    <SearchContext.Provider
      value={{ savedResults, saveResult, removeResult, isSaved }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Main search results component
const SearchResults: React.FC<SearchResultsProps> = ({
  initialResults = mockResults,
  onSearch,
  onSavedResultsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("list"); // 'list' or 'grid'
  const [expandedResults, setExpandedResults] = useState<
    Record<number, boolean>
  >({});
  const [sortBy, setSortBy] = useState("relevance"); // 'relevance', 'date', etc.
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { savedResults, isSaved } = useSearchContext();

  // Toggle expanded state for a result
  const toggleExpand = (resultId: number) => {
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  // Toggle expand for all results
  const toggleExpandAll = (expand: boolean) => {
    const newState: Record<number, boolean> = {};
    initialResults.forEach((result) => {
      newState[result.id] = expand;
    });
    setExpandedResults(newState);
  };

  // Filter results by type
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  // Get all available result types
  const resultTypes = [...new Set(initialResults.map((result) => result.type))];

  // Filter and sort results
  const filteredResults = initialResults
    .filter(
      (result) =>
        (selectedTypes.length === 0 || selectedTypes.includes(result.type)) &&
        (searchQuery === "" ||
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (!showSavedOnly || isSaved(result.id))
    )
    .sort((a, b) => {
      if (sortBy === "relevance") {
        return b.relevanceScore - a.relevanceScore;
      } else if (sortBy === "date" && a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  // Count of saved results
  const savedCount = savedResults.length;

  return (
    <div className="p-3">
      {/* Compact header with search and controls */}
      <div className="flex flex-col space-y-2 mb-2">
        {/* Search bar */}
        {/* <TextInput
          placeholder="Refine your search..."
          value={searchQuery}
          onChange={handleSearchChange}
          leftSection={<IconSearch size={14} />}
          size="xs"
        /> */}

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-1">
          <Group>
            <Text size="xs" fw={500} color="dimmed">
              {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "result" : "results"}
            </Text>

            <SegmentedControl
              size="xs"
              value={viewType}
              onChange={setViewType}
              data={[
                {
                  value: "list",
                  label: (
                    <Center>
                      <IconList size={14} />
                    </Center>
                  ),
                },
                {
                  value: "grid",
                  label: (
                    <Center>
                      <IconGridDots size={14} />
                    </Center>
                  ),
                },
              ]}
            />

            <Group gap={0}>
              <Button
                onClick={() => toggleExpandAll(true)}
                size="xs"
                variant="outline"
                color="gray"
                className="rounded-r-none"
              >
                Expand All
              </Button>
              <Button
                onClick={() => toggleExpandAll(false)}
                size="xs"
                variant="outline"
                color="gray"
                className="rounded-l-none"
              >
                Collapse All
              </Button>
            </Group>
          </Group>

          {/* <Group>
            <Badge
              size="sm"
              color="green"
              variant="light"
              leftSection={<IconBookmark size={12} />}
            >
              {savedCount} saved
            </Badge>

            <Button
              size="xs"
              variant={showSavedOnly ? "filled" : "outline"}
              color={showSavedOnly ? "green" : "gray"}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              {showSavedOnly ? "Showing Saved" : "Show All"}
            </Button>

            <Select
              size="xs"
              value={sortBy}
              onChange={(value) => setSortBy(value || "relevance")}
              data={[
                { value: "relevance", label: "Sort: Relevance" },
                { value: "date", label: "Sort: Date" },
              ]}
            />

            <Button
              onClick={() => setShowFilters(!showFilters)}
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconAdjustments size={14} />}
            >
              Filters
            </Button>
          </Group> */}
        </div>
      </div>

      {/* Compact filters */}
      <Collapse in={showFilters}>
        <Card padding="xs" radius="md" className="mb-2 bg-gray-50">
          <Group>
            <Text size="xs" fw={500}>
              Type:
            </Text>
            <div className="flex flex-wrap gap-1">
              {resultTypes.map((type) => (
                <Badge
                  key={type}
                  size="xs"
                  variant={selectedTypes.includes(type) ? "filled" : "outline"}
                  color={selectedTypes.includes(type) ? "blue" : "gray"}
                  className="cursor-pointer"
                  onClick={() => toggleTypeFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </Group>
        </Card>
      </Collapse>

      {/* Results with more compact spacing */}
      <div
        className={viewType === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"}
      >
        {filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <SearchResultItem
              key={result.id}
              result={result}
              expanded={!!expandedResults[result.id]}
              toggleExpand={() => toggleExpand(result.id)}
            />
          ))
        ) : (
          <Text size="xs" color="dimmed" align="center" className="py-4">
            {showSavedOnly
              ? "You haven't saved any results yet."
              : "No results match your current filters."}
          </Text>
        )}
      </div>

      {/* Compact pagination */}
      {filteredResults.length > 0 && (
        <Group position="center" className="mt-3">
          <Group spacing={0}>
            <ActionIcon variant="default" radius="xs" size="sm">
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Button
              variant="filled"
              color="blue"
              size="xs"
              className="rounded-none"
            >
              1
            </Button>
            <Button variant="subtle" size="xs" className="rounded-none">
              2
            </Button>
            <Button variant="subtle" size="xs" className="rounded-none">
              3
            </Button>
            <ActionIcon variant="default" radius="xs" size="sm">
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Group>
      )}
    </div>
  );
};

// A Center component for wrapping icons in SegmentedControl
const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center">{children}</div>
);

// Export a wrapped version of SearchResults with context
const SearchResultsWithContext: React.FC<SearchResultsProps> = (props) => {
  return (
    <SearchContextProvider onSavedResultsChange={props.onSavedResultsChange}>
      <SearchResults {...props} />
    </SearchContextProvider>
  );
};

export default SearchResultsWithContext;
