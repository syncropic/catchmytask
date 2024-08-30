import { FilterItem } from "@components/interfaces";
import Reveal from "@components/Reveal";
import {
  ActionIcon,
  Badge,
  Checkbox,
  Tooltip,
  Indicator,
  Button,
} from "@mantine/core";
import { IconFilter, IconPlus, IconSearch } from "@tabler/icons-react";
import { useAppStore } from "src/store";

const Generate = () => {
  // const { searchFilters, setSearchFilters } = useAppStore();

  // // Ensure TypeScript knows searchFilters is an array of FilterItem objects
  // const activeFiltersCount = searchFilters.filter(
  //   (filter: FilterItem) => filter.is_selected
  // ).length;

  // const handleCheckboxChange = (itemId: number) => {
  //   const updatedFilters = searchFilters.map((filter: FilterItem) =>
  //     filter.id === itemId
  //       ? { ...filter, is_selected: !filter.is_selected }
  //       : filter
  //   );
  //   setSearchFilters(updatedFilters);
  // };

  return (
    <Reveal
      target={
        <Tooltip label="Filter" position="right">
          <ActionIcon aria-label="filter" size="sm">
            <IconPlus />
          </ActionIcon>
        </Tooltip>
      }
      trigger="click"
    >
      <div>generate flow</div>
    </Reveal>
  );
};

export default Generate;
