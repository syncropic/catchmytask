import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  HttpError,
  useList,
  useCustom,
} from "@refinedev/core";
import { useDisclosure } from "@mantine/hooks";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { IconEdit, IconSend, IconTrash } from "@tabler/icons-react";
import { Group, Button, Autocomplete } from "@mantine/core";
import { useForm } from "@refinedev/mantine";
import Fuse from "fuse.js";
import * as musicMetadata from "music-metadata-browser";
import { useAppStore } from "src/store";

// Define the data structure
interface IMusic {
  id: string;
  name: string;
  artist: string;
  tempo: string;
  genre: string;
  description: string;
  spotify_preview_url: string;
  spotify_external_url: string;
}

export const SyncFiles: React.FC<IResourceComponentsProps> = () => {
  const {
    data,
    isLoading: isLoadingMusic,
    isError: isErrorMusic,
  } = useList<IMusic, HttpError>({
    meta: {
      fields: [
        "id",
        "name",
        "artist",
        "tempo",
        "genre",
        "description",
        "spotify_preview_url",
        "spotify_external_url",
      ],
      view: "views01jqhl3qzwqmc5f42qki",
    },
  });
  const data_items = data?.data ?? [];

  return (
    <div className="w-max-screen">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Autocomplete
          label="Source"
          placeholder="Select source"
          data={locations}
          {...form.getInputProps("source")}
        />
        <Button size="xs" onClick={handleFolderSelection}>
          Select Local Folder
        </Button>{" "}
        <Autocomplete
          label="Destination"
          placeholder="Select destination"
          data={locations}
          {...form.getInputProps("destination")}
        />
        <div>{JSON.stringify(syncFiles)}</div>
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
};
export default SyncFiles;
