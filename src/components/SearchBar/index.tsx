import React from "react";
import { ActionIcon, Button, Checkbox, Tooltip } from "@mantine/core";
import SelectSession from "@components/SelectSession";
import { HttpError, useList } from "@refinedev/core";
import { ISession } from "@components/interfaces";
import { useAppStore } from "src/store";
import {
  IconCopy,
  IconEdit,
  IconFilter,
  IconGripHorizontal,
  IconLetterS,
  IconPlus,
  IconRun,
  IconSearch,
} from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { IconLetterB } from "@tabler/icons-react";
import Reveal from "@components/Reveal";
import FilterComponent from "@components/Filter";

interface SearchBarProps {
  name: string;
  heading: string;
  subheading: string;
  description: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  name,
  heading,
  subheading,
  description,
}) => {
  const {
    activeSession,
    activeApplication,

    activeLayout,
    setActiveLayout,
    searchFilters,
    setSearchFilters,
  } = useAppStore();

  const {
    data,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<ISession, HttpError>({
    resource: "sessions",
    filters: [
      {
        field: "session_status",
        operator: "eq",
        value: "published",
      },
      {
        field: "application",
        operator: "eq",
        value: activeApplication?.id,
      },
    ],
  });

  const session_data_items = data?.data ?? [];

  return (
    <div className="flex w-full items-center pl-4 pr-4 space-x-4">
      {activeLayout?.searchInput?.isDisplayed && (
        <div className="hidden lg:block w-full max-w-2xl">
          <SearchInput />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
