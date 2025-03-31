import React, { useState, useCallback, memo, useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useAppStore } from "src/store";
import { IIdentity } from "@components/interfaces";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { TextInput, LoadingOverlay, Button, Alert } from "@mantine/core";
import { IconRefresh, IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { useLiveQuery } from "@components/Utils/useLiveQuery";

// Responsive MessageItem component
const MessageItem = memo(({ message }) => {
  const formattedDate = React.useMemo(() => {
    if (!message.created_datetime) return "";
    return new Date(message.created_datetime).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [message.created_datetime]);

  const statusColors = {
    passed: "bg-green-100 border-green-500 dark:bg-green-900/30",
    pending: "bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30",
    failed: "bg-red-100 border-red-500 dark:bg-red-900/30",
  };

  const statusColor =
    statusColors[message.action_status] ||
    "bg-gray-100 border-gray-500 dark:bg-gray-800";

  return (
    <div
      className={`p-3 border-l-4 ${statusColor} mb-2 rounded shadow-sm hover:shadow transition w-full`}
    >
      <div className="font-medium text-sm break-words">
        {message.heading || message.name || "Untitled Message"}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
        {message.subheading || ""}
      </div>
      <div className="mt-1 flex flex-wrap justify-between items-center gap-2">
        <span className="text-xs text-gray-500">{formattedDate}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 whitespace-nowrap">
          {message.action_status || "unknown"}
        </span>
      </div>
    </div>
  );
});

// MessageRow component
const MessageRow = memo(({ index, style, data }) => {
  const { messages, isItemLoaded } = data;

  if (!isItemLoaded(index)) {
    return (
      <div style={style} className="p-3">
        Loading...
      </div>
    );
  }

  const message = messages[index];

  return (
    <div style={style} className="px-2">
      <MessageItem message={message} />
    </div>
  );
});

// Main component with debugging
export const MessageListing = () => {
  const { data: identity } = useGetIdentity<IIdentity>();
  const { params } = useAppStore();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  // Session ID from URL params or context
  const sessionId = params?.id || null;

  // Base query construction
  const getQuery = useCallback(
    (tab) => {
      const baseQuery = `
      SELECT 
        id, author_id, action_status, entity_type, message_type,
        name, heading, subheading, profile_id, session_id, task_id,
        summary_message_code, created_datetime, updated_datetime
      FROM messages
      WHERE author_id = '${identity?.email}'
    `;

      // Add filters based on tab
      switch (tab) {
        case "session":
          return `${baseQuery} AND session_id = '${sessionId}'`;
        case "pending":
          return `${baseQuery} AND action_status = 'pending'`;
        case "failed":
          return `${baseQuery} AND action_status = 'failed'`;
        default:
          return baseQuery;
      }
    },
    [identity?.email, sessionId]
  );

  // Use the original live query hook that was working before
  const {
    data: messages,
    error,
    loading,
    meta,
    refresh,
    loadMore,
  } = useLiveQuery(
    getQuery(activeTab) + " ORDER BY created_datetime DESC",
    "messages",
    { limit: 20, throttleTime: 500 }
  );

  // Update debug info
  React.useEffect(() => {
    setDebugInfo({
      messagesCount: messages?.length || 0,
      hasMessages: messages?.length > 0,
      isLoading: loading,
      hasError: !!error,
    });
  }, [messages, loading, error]);

  // Filter messages based on search term
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim() || !messages) {
      return messages || [];
    }

    const term = searchTerm.toLowerCase().trim();
    return messages.filter(
      (message) =>
        (message.heading || "").toLowerCase().includes(term) ||
        (message.subheading || "").toLowerCase().includes(term) ||
        (message.name || "").toLowerCase().includes(term) ||
        (message.author_id || "").toLowerCase().includes(term)
    );
  }, [messages, searchTerm]);

  // Helper functions for infinite loading
  const isItemLoaded = useCallback(
    (index) => !meta.hasMore || index < filteredMessages.length,
    [meta.hasMore, filteredMessages.length]
  );

  const loadMoreItems = useCallback(() => {
    if (!loading && meta.hasMore) {
      return loadMore();
    }
    return Promise.resolve();
  }, [loading, meta.hasMore, loadMore]);

  const itemCount = meta.hasMore
    ? filteredMessages.length + 1
    : filteredMessages.length;

  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search input and refresh button row */}
      <div className="flex items-center gap-2 p-3 border-b">
        <TextInput
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          leftSection={<IconSearch size={16} />}
          size="sm"
        />
        <Button
          size="xs"
          leftIcon={<IconRefresh size={14} />}
          onClick={refresh}
          loading={loading}
          variant="subtle"
          compact
        >
          Refresh
        </Button>
      </div>

      {/* Message list with status tabs as buttons */}
      <div className="flex gap-1 p-2 border-b">
        <Button
          size="xs"
          variant={activeTab === "all" ? "filled" : "subtle"}
          onClick={() => setActiveTab("all")}
          className="flex-1"
        >
          All
        </Button>
        {sessionId && (
          <Button
            size="xs"
            variant={activeTab === "session" ? "filled" : "subtle"}
            onClick={() => setActiveTab("session")}
            className="flex-1"
          >
            Session
          </Button>
        )}
        <Button
          size="xs"
          variant={activeTab === "pending" ? "filled" : "subtle"}
          onClick={() => setActiveTab("pending")}
          className="flex-1"
        >
          Pending
        </Button>
        <Button
          size="xs"
          variant={activeTab === "failed" ? "filled" : "subtle"}
          onClick={() => setActiveTab("failed")}
          className="flex-1"
        >
          Failed
        </Button>
      </div>

      {/* Messages content area */}
      <div className="relative flex-grow">
        <LoadingOverlay visible={loading && filteredMessages.length === 0} />

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading messages"
            color="red"
            className="m-3"
          >
            {error.message}
          </Alert>
        )}

        {!loading && filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
            <p>
              {searchTerm
                ? "No matching messages found"
                : "No messages to display"}
            </p>
            {/* Debug info */}
            {process.env.NODE_ENV !== "production" && (
              <pre className="text-xs mt-4 text-left">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="h-[calc(90vh-120px)]">
            <AutoSizer>
              {({ height, width }) => (
                <InfiniteLoader
                  isItemLoaded={isItemLoaded}
                  itemCount={itemCount}
                  loadMoreItems={loadMoreItems}
                  threshold={5}
                >
                  {({ onItemsRendered, ref }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={itemCount}
                      itemSize={105}
                      onItemsRendered={onItemsRendered}
                      ref={ref}
                      itemData={{
                        messages: filteredMessages,
                        isItemLoaded,
                      }}
                    >
                      {MessageRow}
                    </List>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageListing;
