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
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { useAppStore } from "src/store";

const FilterComponent = () => {
  const { searchFilters, setSearchFilters } = useAppStore();

  // Ensure TypeScript knows searchFilters is an array of FilterItem objects
  const activeFiltersCount = searchFilters.filter(
    (filter: FilterItem) => filter.is_selected
  ).length;

  const handleCheckboxChange = (itemId: number) => {
    const updatedFilters = searchFilters.map((filter: FilterItem) =>
      filter.id === itemId
        ? { ...filter, is_selected: !filter.is_selected }
        : filter
    );
    setSearchFilters(updatedFilters);
  };

  return (
    <Reveal
      target={
        <Indicator inline label={activeFiltersCount} size={16} color="blue">
          <Tooltip label="Filter" position="right">
            <ActionIcon aria-label="filter" size="sm">
              <IconFilter />
            </ActionIcon>
          </Tooltip>
        </Indicator>
      }
      trigger="hover"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {searchFilters.map((item: FilterItem) => (
          <Checkbox
            checked={item.is_selected}
            label={item.description}
            key={item.id}
            onChange={() => handleCheckboxChange(item.id)}
          />
        ))}
      </div>
    </Reveal>
  );
};

export default FilterComponent;
