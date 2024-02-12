import {
  Autocomplete,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
} from "src/utils";
import { CompleteActionComponentProps } from "@components/interfaces";
import React from "react";

export function Sync({
  setActionType,
  action_options,
  identity,
  data_items,
  open,
  record,
  action_step,
  variant = "default",
  activeActionOption,
  setActiveActionOption,
}: CompleteActionComponentProps) {
  const invalidate = useInvalidate();

  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      author: identity?.email,
      author_email: identity?.email,
      source: "",
      // flight_airline_reference_code: "",
      // contact_email: "",
      // contact_name: "",
      // flight_change_pnr_old_text: "",
      // flight_change_pnr_new_text: "",
    },
  });
  const locations = ["local", "current_view"];

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    // setActiveItem(item);
    // setActionType("create");
    setFieldValue("action", value);
  };

  const handleSubmit = (e: any) => {
    let request_data = {
      ...activeActionOption,
      id: addSeparator(activeActionOption?.id, "action_options"),
      values: {
        ...record,
        ...values, // so i can override original in the form if not disabled
        action_options: [
          addSeparator(activeActionOption?.id, "action_options"),
        ],
      },
    };
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        // invalidateCallback();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };
  // const syncFiles = useAppStore((state) => state.syncFiles);
  // const setSyncFiles = useAppStore((state) => state.setSyncFiles);
  // use react state instead of zustand
  const [syncFiles, setSyncFiles] = React.useState([]);

  // console.log("data_items", data_items);
  // Using useForm hook for form handling
  const form = useForm({
    initialValues: {
      source: "",
      destination: "current_view",
    },
  });

  // Modified normalizeString function
  const normalizeString = (str: any) => {
    if (typeof str !== "string") {
      console.error("Expected a string, got:", str);
      return ""; // Return empty string or handle as needed
    }
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ");
  };

  const getMetadata = async (file) => {
    try {
      const metadata = await musicMetadata.parseBlob(file);
      console.log("metadata", metadata);
      return metadata.common;
    } catch (error) {
      console.error("Error reading metadata", error);
      return null;
    }
  };

  const splitFileName = (fileName: string) => {
    // Remove the file extension
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    // Check if file name starts with a hyphen
    if (fileNameWithoutExtension.startsWith("-")) {
      // Use the file name without extension as both artist and title
      const normalizedFileName = normalizeString(fileNameWithoutExtension);
      return { artist: normalizedFileName, title: normalizedFileName };
    }

    // Split the file name into artist and title parts
    const parts = fileNameWithoutExtension
      .split(/[-()]+/)
      .map((part) => normalizeString(part.trim()));

    // Fallback for undefined artist or title
    let artist = parts[0];
    let name = parts[1] || artist; // Use artist as title if title is undefined
    artist = artist || name; // Use title as artist if artist is undefined

    return { artist, name };
  };

  const createFuseWithDirectoryFiles = (files) => {
    const fuseOptions = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.6,
    };
    return new Fuse(files, fuseOptions);
  };

  // const processDirectoryFiles = async (directoryHandle) => {
  //   const filesProcessed = [];

  //   for await (const entry of directoryHandle.values()) {
  //     if (entry.kind === "file") {
  //       const file = await entry.getFile();
  //       if (file.type.includes("audio")) {
  //         const { artist, title } = splitFileName(file.name);
  //         filesProcessed.push({ artist, title, fileName: file.name });
  //       }
  //     }
  //   }

  //   return filesProcessed;
  // };

  const processDirectoryFiles = async (directoryHandle) => {
    const filesProcessed = [];

    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file") {
        const file = await entry.getFile();
        if (file.type.includes("audio")) {
          // console.log("getting_metadata_for", file.name);
          // const metadata = await getMetadata(file); // takes a while for large directories
          // let title = metadata?.title;
          let name = null;
          let artist = null;

          if (!name) {
            // If title is not found in metadata, use filename
            const { name: fileNameTitle, artist: fileNameArtist } =
              splitFileName(file.name);
            name = fileNameTitle;
            artist = fileNameArtist;
          }

          filesProcessed.push({ name, fileName: file.name, artist });
        }
      }
    }

    return filesProcessed;
  };

  const searchDirectoryFiles = (fuse, dataItem) => {
    const searchString = `${dataItem.name}`;
    // console.log("searchString", searchString);
    return fuse.search(searchString).slice(0, 3); // Return top 3 matches
  };

  const handleFolderSelection = async () => {
    if (!window.showDirectoryPicker) {
      console.error("File System Access API is not supported in this browser.");
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      const processedFiles = await processDirectoryFiles(directoryHandle);
      // console.log("processedFiles", processedFiles);
      const fuse = createFuseWithDirectoryFiles(processedFiles);

      let matchesList: any[] | ((prevState: never[]) => never[]) = [];

      // data_items.forEach((dataItem) => {
      //   const matches = searchDirectoryFiles(fuse, dataItem);
      //   console.log(`Matches for '${dataItem.name} by ${dataItem.artist}':`);
      //   matches.forEach((match) => {
      //     console.log(
      //       `  Match: '${match.item.fileName}', score: ${match.score}`
      //     );
      //     // add to sync list
      //     let syncFileItem = { ...match.item, resource_id: dataItem.id };
      //     matchesList.push(syncFileItem);
      //     // setSyncFiles([...syncFiles, syncFileItem]);
      //   });
      // });
      // setSyncFiles(matchesList);
    } catch (error) {
      console.error("Error accessing folder:", error);
    }
  };

  console.log("data_items", data_items);

  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
        size: "xs",
      }}
      // contentProps={{
      //   style: {
      //     // backgroundColor: "cornflowerblue",
      //     padding: "16px",
      //     height: "420px",
      //   },
      // }}
      title={<Title order={3}>Configure and Execute Action</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <>
          <SaveButton {...saveButtonProps} fullWidth>
            Complete Action
          </SaveButton>
        </>
      )}
    >
      {/* <div>{JSON.stringify(data_items)}</div> */}
      <Autocomplete
        label="Source"
        placeholder="Select source"
        data={locations}
        {...form.getInputProps("source")}
      />
      <Button size="xs" onClick={handleFolderSelection}>
        Select Local Folder
      </Button>
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
    </Create>
  );
}

export default Sync;
