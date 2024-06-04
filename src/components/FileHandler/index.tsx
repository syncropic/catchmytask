import { getFileHash } from "@components/Utils";
import { FieldConfiguration } from "@components/interfaces";
import React, { useState } from "react";
import { useAppStore } from "src/store"; // Adjust the import path as needed
import { localDb } from "src/localDb";

const FileHandler: React.FC<FieldConfiguration> = ({ field_name }) => {
  const [status, setStatus] = useState<string>("Ready");
  const { activeRecord } = useAppStore();

  const handleFileSelection = async () => {
    setStatus("Prompting file selection...");
    try {
      if (!(window as any).showOpenFilePicker) {
        setStatus(
          "The File System Access API is not supported in this browser."
        );
        return;
      }

      const [fileHandle] = await (window as any).showOpenFilePicker({
        multiple: false,
      });
      const file = await fileHandle.getFile();
      const file_handle_id = await getFileHash(file); // Use hash as fileId

      // Check if the file is already in the database
      const existingFile = await localDb.file_handles
        .where({ file_handle_id: file_handle_id })
        .first();
      if (existingFile) {
        setStatus("This file already exists in the database.");
        console.log("This file already exists in the database.");
        return;
      }

      // Assuming the structure of your fileHandles table includes a fileHandle column for storing metadata or the handle itself
      // Note: Directly storing FileSystemFileHandle objects might not be fully supported due to serialization issues
      // For demonstration, storing the file's arrayBuffer might be more straightforward
      const arrayBuffer = await file.arrayBuffer();
      await localDb.file_handles.add({
        file_handle_id: file_handle_id,
        record_id: activeRecord?.id,
        file_handle: arrayBuffer, // Storing ArrayBuffer representation
        name: file.name,
        type: file.type,
      });

      setStatus(
        `File "${file.name}" added successfully with ID: ${file_handle_id}`
      );
    } catch (error) {
      setStatus(`An error occurred: ${error}`);
      console.error("Error selecting file:", error);
    }
  };

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={handleFileSelection}>
        {field_name || "Select File"}
      </button>
    </div>
  );
};

export default FileHandler;
