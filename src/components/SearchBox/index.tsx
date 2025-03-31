import React, { useState } from "react";
import { Autocomplete, Box, Tooltip, Text } from "@mantine/core";
import { IconSearch, IconDeviceLaptop, IconWorld } from "@tabler/icons-react";
import { useAppStore } from "../../store"; // Adjust this path to match your project structure

const MantineSearchBox = () => {
  const [isRemoteSearch, setIsRemoteSearch] = useState(true);
  const [value, setValue] = useState("");

  // Get state and setters from Zustand store
  const setSearchBoxFocused = useAppStore((state) => state.setSearchBoxFocused);
  const searchBoxFocused = useAppStore((state) => state.searchBoxFocused);

  // Mock data for suggestions
  const data = [
    "react hooks tutorial",
    "react performance optimization",
    "react state management",
    "react router v6",
    "react testing library examples",
  ];

  const handleSubmit = (query) => {
    if (isRemoteSearch) {
      console.log("Remote search submitted:", query);
      // Here you would call your API endpoint
    } else {
      console.log("Local search submitted:", query);
      // Here you would search through cached results
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(value);
    }
  };

  // Focus and blur handlers to update Zustand store
  const handleFocus = () => {
    setSearchBoxFocused(true);
  };

  const handleBlur = () => {
    // Small delay to ensure other click handlers fire first
    setTimeout(() => {
      setSearchBoxFocused(false);
    }, 100);
  };

  return (
    <Box className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(value);
        }}
      >
        <Autocomplete
          value={value}
          onChange={setValue}
          data={data}
          placeholder={
            isRemoteSearch
              ? "Searching from API (slower, but complete results)"
              : "Searching locally (faster, but limited to cached data)"
          }
          classNames={{
            input: "placeholder:text-xs",
            wrapper: "rounded-full",
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          leftSection={<IconSearch size="1rem" className="text-gray-500" />}
          rightSection={
            <Tooltip
              label={
                isRemoteSearch
                  ? "Switch to local search"
                  : "Switch to remote search"
              }
            >
              <div
                onClick={() => setIsRemoteSearch(!isRemoteSearch)}
                className="cursor-pointer px-2 border-l border-gray-200 pl-3"
              >
                <div className="flex flex-row items-center gap-1">
                  {isRemoteSearch ? (
                    <>
                      <IconWorld size="1.1rem" className="text-blue-500" />
                      <Text size="xs" className="text-blue-500 font-medium">
                        Remote
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconDeviceLaptop
                        size="1.1rem"
                        className="text-blue-500"
                      />
                      <Text size="xs" className="text-blue-500 font-medium">
                        Local
                      </Text>
                    </>
                  )}
                </div>
              </div>
            </Tooltip>
          }
          rightSectionWidth={85}
          onKeyDown={handleKeyDown}
          onItemSubmit={(item) => handleSubmit(item.value)}
        />
      </form>
    </Box>
  );
};

export default MantineSearchBox;
