import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@components/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/Popover";

// interface for Combobox component
export interface ComboboxProps {
  data_items: Array<{ value: string; label: string }>;
  resource: string;
  value: string;
  setValue: (value: string) => void;
}

export function Combobox({
  data_items,
  resource,
  value,
  setValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const placeholder = `Select ${resource} ...`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data_items.find((data_item) => data_item.value === value)?.label
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No data_item found.</CommandEmpty>
            <CommandGroup>
              {data_items.map((data_item) => (
                <CommandItem
                  key={data_item.value}
                  value={data_item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {data_item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === data_item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
