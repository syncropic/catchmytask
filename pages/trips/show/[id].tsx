import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
} from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { Accordion, Anchor, Flex, MantineProvider, Title } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { GetManyResponse, useMany, useList, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconEdit,
  IconList,
  IconMathFunction,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import {
  ScrollArea,
  Table,
  Pagination,
  Group,
  Menu,
  Box,
  ActionIcon,
  Text,
  Code,
  Button,
} from "@mantine/core";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { useParsed } from "@refinedev/core";
import { addSeparator, formatDateTimeAsDate } from "src/utils";
import CodeBlock from "src/components/codeblock/codeblock";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListMessages from "@components/message/ListItems";
import WriteMessagesForm from "@components/message/WriteItemForm";
import { parseISO, format } from "date-fns";
import { useInvalidate } from "@refinedev/core";

// Define the data structure
interface IOnewurldBooking {
  id: string;
  sstg_booking_number: string;
  passenger: string;
  sstg_status: string;
  supplier_status: string;
  booking_type: string;
  finance_comments: string;
  supplier_comments: string;
  itinerary_id: string;
  reporting_date: string;
}

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <>
      <Show isLoading={isLoading}>
        <Text>
          <b>item_id:</b> {record?.trip_id}
        </Text>

        <Accordion defaultValue="details">
          <Accordion.Item key="details" value="details">
            <Accordion.Control icon={<IconList />}>
              More details
            </Accordion.Control>
            <Accordion.Panel>
              <CodeBlock jsonData={data} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Show>
    </>
  );
};
export default PageShow;
